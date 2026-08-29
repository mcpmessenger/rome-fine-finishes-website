import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "",
})

export const runtime = "nodejs"
export const maxDuration = 60

// Priority surface transformation prompts
const TRANSFORMATION_PROMPTS = {
  cabinets: `Professional cabinet refinishing transformation: 
- If cabinets are dark (brown, black, dark wood): Transform to bright, light finishes like crisp white, soft cream, or light gray with modern shaker-style doors. Add contemporary matte black or brushed nickel hardware.
- If cabinets are light (white, cream, light wood): Transform to rich, warm finishes like deep espresso, charcoal gray, or warm walnut tones. Add elegant gold or bronze hardware.
- Apply realistic wood grain texture and professional-grade finish.
- Maintain exact cabinet structure, layout, and perspective.
- Create a dramatic but tasteful aesthetic transformation that shows clear before/after contrast.`,
  
  fireplace: `Modern fireplace makeover transformation:
- If fireplace is dark or dated: Transform to light, modern finishes like white shiplap, light gray stone, or clean white tile. Add a floating wood or white mantel shelf.
- If fireplace is light or plain: Transform to rich, dramatic finishes like dark slate, charcoal stone, or deep gray tile. Add a substantial dark wood or black mantel.
- Maintain exact fireplace structure, size, and proportions.
- Enhance with subtle ambient lighting.
- Create a striking visual transformation that modernizes the space.`,
  
  deck: `Professional deck refinishing transformation:
- If deck is dark or weathered: Transform to light, fresh finishes like light gray composite decking, white-washed wood, or natural light wood tones. Add modern black or white railings.
- If deck is light or faded: Transform to rich, warm finishes like dark brown composite, rich cedar tones, or deep mahogany. Add elegant dark railings.
- Maintain exact deck structure, layout, and perspective.
- Apply realistic wood grain texture with proper board spacing.
- Create a dramatic restoration that shows clear improvement.`,
  
  room: `Professional interior refinishing transformation:
- If room is dark: Transform to bright, airy finishes with light paint colors, white trim, and light-toned surfaces. Add modern light fixtures.
- If room is light: Transform to rich, cozy finishes with warm paint colors, dark accents, and deeper-toned surfaces. Add warm ambient lighting.
- Maintain exact room structure, layout, and perspective.
- Update surfaces with professional-grade finishes.
- Create a dramatic but tasteful aesthetic transformation.`,
}

async function consumeStreamToBuffer(stream: any): Promise<Buffer> {
  if (typeof stream.getReader === 'function') {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
      }
    }
    return Buffer.concat(chunks.map(c => Buffer.from(c)));
  }
  
  if (typeof stream[Symbol.asyncIterator] === 'function') {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  if (typeof stream.on === 'function') {
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      stream.on('data', (chunk: any) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks.map(c => Buffer.isBuffer(c) ? c : Buffer.from(c)))));
      stream.on('error', (err: any) => reject(err));
    });
  }

  throw new Error("Target is not a readable stream");
}

async function processReplicateResult(result: any): Promise<string[]> {
  if (!result) return []

  // Check if result is a stream
  if (result && (typeof result.getReader === 'function' || typeof result[Symbol.asyncIterator] === 'function' || typeof result.on === 'function')) {
    console.log("Result itself is a stream, consuming...")
    const buffer = await consumeStreamToBuffer(result)
    return [`data:image/png;base64,${buffer.toString("base64")}`]
  }

  // Handle async iterators
  if (result && typeof result === 'object' && typeof result[Symbol.asyncIterator] === 'function') {
    console.log('Result is an async iterator, consuming...')
    const results: any[] = []
    for await (const item of result as AsyncIterable<any>) {
      results.push(item)
    }
    result = results
  }

  // If it's an array
  if (Array.isArray(result)) {
    const outputs: string[] = []
    for (const item of result) {
      if (!item) continue
      if (typeof item === 'string') {
        outputs.push(item)
      } else if (typeof item.getReader === 'function' || typeof item[Symbol.asyncIterator] === 'function' || typeof item.on === 'function') {
        console.log("Found stream in output array, consuming...")
        const buffer = await consumeStreamToBuffer(item)
        outputs.push(`data:image/png;base64,${buffer.toString("base64")}`)
      } else if (typeof item === 'object') {
        const url = item.url || item.output || item.image
        if (url && typeof url === 'string') {
          outputs.push(url)
        } else if (url && (typeof url.getReader === 'function' || typeof url[Symbol.asyncIterator] === 'function' || typeof url.on === 'function')) {
          console.log("Found stream inside item object, consuming...")
          const buffer = await consumeStreamToBuffer(url)
          outputs.push(`data:image/png;base64,${buffer.toString("base64")}`)
        }
      }
    }
    return outputs
  }

  // If it's a string
  if (typeof result === 'string') {
    return [result]
  }

  // If it's an object
  if (typeof result === 'object') {
    if ('output' in result) {
      const outputValue = result.output
      return Array.isArray(outputValue) ? processReplicateResult(outputValue) : processReplicateResult([outputValue])
    }
    if ('url' in result) {
      return processReplicateResult(result.url)
    }
    if ('urls' in result) {
      return processReplicateResult(result.urls)
    }
    if ('image' in result) {
      return processReplicateResult(result.image)
    }
    if ('images' in result) {
      return processReplicateResult(result.images)
    }

    const stringProps = Object.values(result).filter(
      (v): v is string => typeof v === 'string' && (v.startsWith('http') || v.startsWith('data:'))
    )
    if (stringProps.length > 0) {
      return stringProps
    }
  }

  return []
}

export async function POST(request: NextRequest) {
  try {
    // Check for API keys
    const geminiKey = process.env.GEMINI_API_KEY
    const replicateKey = process.env.REPLICATE_API_TOKEN
    
    if (!geminiKey) {
      return NextResponse.json(
        { 
          error: "API configuration error", 
          details: "Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables." 
        },
        { status: 500 }
      )
    }

    if (!replicateKey) {
      return NextResponse.json(
        { 
          error: "API configuration error", 
          details: "Replicate API token is not configured. Please set REPLICATE_API_TOKEN in your environment variables." 
        },
        { status: 500 }
      )
    }
    
    console.log("Transform image request received")

    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error: any) {
      console.error("FormData parsing error:", error)
      return NextResponse.json(
        { error: "Failed to parse form data", details: error.message },
        { status: 400 }
      )
    }
    
    const file = formData.get("image") as File
    const surfaceType = formData.get("surfaceType") as string

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    if (!surfaceType || !TRANSFORMATION_PROMPTS[surfaceType as keyof typeof TRANSFORMATION_PROMPTS]) {
      return NextResponse.json({ error: "Invalid surface type" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 })
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString("base64")
    const mimeType = file.type

    // Get transformation prompt for the surface type
    const transformationPrompt = TRANSFORMATION_PROMPTS[surfaceType as keyof typeof TRANSFORMATION_PROMPTS]
    
    // Step 1: Use Gemini Vision to analyze the image and create a transformation prompt
    console.log(`Step 1: Analyzing image with Gemini for surface type: ${surfaceType}`)
    const analysisPrompt = `Analyze this image carefully. First, determine if the current finish is DARK or LIGHT.

ABSOLUTE REQUIREMENTS - DO NOT CHANGE ANYTHING EXCEPT SURFACE FINISHES:
- Exact same layout, room structure, and architectural elements
- Same perspective, camera angle, and composition  
- Same appliances, fixtures, and furniture (DO NOT ADD OR REMOVE ANYTHING)
- Same window positions, sizes, and styles
- Same floor, walls, and ceiling (keep exactly as is)
- Same countertops, backsplash, and all other surfaces (unless they're the refinishing target)
- Same decorative items, plants, utensils - EVERYTHING stays in the same position
- Same lighting conditions and shadows

ONLY CHANGE - SURFACE REFINISHING:
- Apply this transformation: "${transformationPrompt}"
- If current finish is DARK → change ONLY the surface color/finish to LIGHT (white, cream, light gray)
- If current finish is LIGHT → change ONLY the surface color/finish to DARK (espresso, charcoal, rich wood)
- Update ONLY the paint/stain color and finish texture on the specified surface
- Update hardware (handles, pulls) color/style if mentioned
- DO NOT change structure, shape, size, or position of anything
- DO NOT add or remove any elements
- DO NOT change the layout or composition

Create a concise transformation prompt (2-3 sentences) that:
1. Identifies whether current finish is dark or light
2. Specifies ONLY the surface color/finish change needed
3. Emphasizes that everything else must remain IDENTICAL
4. Makes it clear this is SURFACE REFINISHING ONLY

Return ONLY the transformation prompt, nothing else. Keep it concise (2-3 sentences max).`

    const genAI = new GoogleGenerativeAI(geminiKey)
    let geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    let transformationDescription = transformationPrompt
    try {
      const result = await geminiModel.generateContent([
        analysisPrompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        }
      ])
      const response = await result.response
      transformationDescription = response.text().trim() || transformationPrompt
    } catch (error: any) {
      console.warn("gemini-2.5-flash failed, trying fallback to gemini-1.5-flash...", error.message)
      try {
        geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const result = await geminiModel.generateContent([
          analysisPrompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          }
        ])
        const response = await result.response
        transformationDescription = response.text().trim() || transformationPrompt
      } catch (fallbackError: any) {
        if (fallbackError.status === 429 || fallbackError.message?.includes("rate limit") || fallbackError.message?.includes("quota") || fallbackError.message?.includes("Service Unavailable") || fallbackError.status === 503) {
          return NextResponse.json(
            { 
              error: "API rate limit exceeded", 
              details: "Google's Gemini API is currently experiencing high demand. Please try again in a few moments or use manual selection." 
            },
            { status: 429 }
          )
        }
        throw fallbackError
      }
    }

    console.log("Transformation description:", transformationDescription)

    // Step 2: Prepare Data URI for Replicate input
    console.log("Step 2: Preparing Data URI for Replicate...")
    const fileUrl = `data:${mimeType};base64,${base64Image}`

    // Step 3: Use Replicate's Gemini Flash Image (nano-banana) model
    console.log("Step 3: Generating transformed image with google/nano-banana")
    
    let output: string[] | undefined
    const modelUsed = "google/nano-banana"
    
    try {
      console.log(`Using model: ${modelUsed}`)
      console.log(`Replicate auth token present: ${!!process.env.REPLICATE_API_TOKEN}`)
      
      const promptText = `Professional high-quality photo: ${transformationDescription}. Maintain the exact same structure, layout, perspective, furniture, appliances, and all elements. Change ONLY the surface finishes and colors. Photorealistic result with high quality, realistic lighting.`
      
      let result = await replicate.run(modelUsed as `${string}/${string}`, {
        input: {
          prompt: promptText,
          image: fileUrl,
          aspect_ratio: "match_input_image",
          output_format: "png"
        }
      })
      console.log(`Model result type:`, typeof result)
      console.log(`Model result:`, result)
      
      output = await processReplicateResult(result)
      console.log(`Successfully used model: ${modelUsed}`, `Output length: ${output?.length}`)
    } catch (error: any) {
      console.error(`Model error details:`, {
        status: error.status,
        statusCode: error.statusCode,
        message: error.message,
        response: error.response?.data || error.response,
        body: error.body,
        request: error.request?.url,
      })
      
      const errorMessage = error.message || JSON.stringify(error.body || error.response || {})
      
      if (error.status === 429 || errorMessage?.includes("rate limit") || errorMessage?.includes("too many requests")) {
        return NextResponse.json(
          { 
            error: "API rate limit exceeded", 
            details: "You've made too many requests. Please wait a few minutes and try again." 
          },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { 
          error: "Failed to execute google/nano-banana model", 
          details: `Image generation failed. Please verify your Replicate account status and credits. Last error: ${errorMessage}` 
        },
        { status: 500 }
      )
    }

    console.log(`Final output:`, output)
    
    if (!output || output.length === 0) {
      throw new Error(`Failed to generate image: Model returned empty output.`)
    }
    
    const generatedImageUrl = output[0]
    if (!generatedImageUrl || typeof generatedImageUrl !== 'string') {
      throw new Error(`Failed to generate image: Invalid output format. Expected string URL, got ${typeof generatedImageUrl}`)
    }
    
    console.log(`Generated image URL:`, generatedImageUrl)

    // Step 4: Download the generated image and convert to base64
    let imageBase64: string
    let contentType: string

    if (generatedImageUrl.startsWith("data:")) {
      console.log("Image returned as data URL, skipping download")
      const match = generatedImageUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (match) {
        contentType = match[1]
        imageBase64 = match[2]
      } else {
        throw new Error("Invalid data URL format returned from stream processing")
      }
    } else {
      console.log("Step 4: Downloading generated image")
      const imageFetch = await fetch(generatedImageUrl)
      const generatedImageArrayBuffer = await imageFetch.arrayBuffer()
      imageBase64 = Buffer.from(generatedImageArrayBuffer).toString("base64")
      contentType = imageFetch.headers.get("content-type") || "image/png"
    }

    return NextResponse.json({
      transformedImage: imageBase64,
      mimeType: contentType,
      description: `Transformed ${surfaceType} using Gemini Flash Image (nano-banana)`,
      note: "Image generated with Google Gemini 2.5 Flash Image model on Replicate",
    })
  } catch (error: any) {
    console.error("Image transformation error:", error)
    
    // Provide more specific error messages
    let errorMessage = "Failed to transform image"
    let errorDetails = error.message || "Unknown error occurred"
    
    if (error.message?.includes("API_KEY") || error.message?.includes("api key") || error.status === 401) {
      errorMessage = "API configuration error"
      errorDetails = "Invalid or missing API key. Please check your environment variables."
    } else if (error.message?.includes("quota") || error.message?.includes("rate limit") || error.status === 429) {
      errorMessage = "API rate limit exceeded"
      errorDetails = "You've made too many requests. Please wait a few minutes and try again."
    } else if (error.message?.includes("insufficient_quota") || error.status === 402) {
      errorMessage = "Insufficient API quota"
      errorDetails = "Your API account has insufficient credits. Please add credits to your account."
    }
    
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    )
  }
}
