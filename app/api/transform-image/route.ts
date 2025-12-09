import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import Replicate from "replicate"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

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

export async function POST(request: NextRequest) {
  try {
    // Check for API keys
    const openaiKey = process.env.OPENAI_API_KEY
    const replicateKey = process.env.REPLICATE_API_TOKEN
    
    if (!openaiKey) {
      return NextResponse.json(
        { 
          error: "API configuration error", 
          details: "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables." 
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
    const customDirections = formData.get("customDirections") as string | null
    const hasCustomDirections = customDirections && customDirections.trim()

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
    const baseTransformationPrompt = TRANSFORMATION_PROMPTS[surfaceType as keyof typeof TRANSFORMATION_PROMPTS]
    
    // Incorporate custom directions if provided
    let transformationPrompt = baseTransformationPrompt
    if (customDirections && customDirections.trim()) {
      transformationPrompt = `${baseTransformationPrompt}

USER CUSTOM DIRECTIONS (PRIORITY - FOLLOW THESE SPECIFIC INSTRUCTIONS):
${customDirections.trim()}

IMPORTANT: The user's custom directions take priority. Apply their specific requests while still maintaining the same structure, layout, and perspective.`
    }
    
    // Step 1: Use GPT-4 Vision to analyze the image and create a transformation prompt
    console.log(`Step 1: Analyzing image with GPT-4 Vision for surface type: ${surfaceType}`)
    const analysisPrompt = `Analyze this image carefully.${hasCustomDirections ? '' : ' First, determine if the current finish is DARK or LIGHT.'}

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
${hasCustomDirections ? '' : `- If current finish is DARK → change ONLY the surface color/finish to LIGHT (white, cream, light gray)
- If current finish is LIGHT → change ONLY the surface color/finish to DARK (espresso, charcoal, rich wood)`}
- Update ONLY the paint/stain color and finish texture on the specified surface
- Update hardware (handles, pulls) color/style if mentioned
- DO NOT change structure, shape, size, or position of anything
- DO NOT add or remove any elements
- DO NOT change the layout or composition

Create a concise transformation prompt (2-3 sentences) that:
${hasCustomDirections ? '1. Incorporates the user\'s specific custom directions' : '1. Identifies whether current finish is dark or light'}
2. Specifies ONLY the surface color/finish change needed
3. Emphasizes that everything else must remain IDENTICAL
4. Makes it clear this is SURFACE REFINISHING ONLY

Return ONLY the transformation prompt, nothing else. Keep it concise (2-3 sentences max).`

    let analysisResponse
    try {
      analysisResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 200,
      })
    } catch (error: any) {
      if (error.status === 429 || error.message?.includes("rate limit")) {
        return NextResponse.json(
          { 
            error: "API rate limit exceeded", 
            details: "You've made too many requests. Please wait a few minutes and try again." 
          },
          { status: 429 }
        )
      }
      throw error
    }

    const transformationDescription = analysisResponse.choices[0]?.message?.content || transformationPrompt
    console.log("Transformation description:", transformationDescription)

    // Step 2: Use Replicate's Stable Diffusion image-to-image model
    // This model accepts the original image and modifies it while maintaining structure
    console.log("Step 2: Generating transformed image with Stable Diffusion image-to-image")
    
    // Replicate SDK accepts data URLs directly
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`
    
    // Try the most reliable model first
    // Only try alternatives if the first one fails with a non-rate-limit error
    let output: string[] | undefined
    let modelUsed = ""
    
    // Check if OpenAI API key is available for gpt-image-1
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.warn("OPENAI_API_KEY not found. gpt-image-1 model will not be available.")
    }
    
    // Try the user-specified model first, then fallback to other img2img models
    // 
    // TO ADD NEW MODELS:
    // 1. Search Replicate: https://replicate.com/explore (search for "img2img" or "image-to-image")
    // 2. Find a model that supports image-to-image transformation
    // 3. Copy the model identifier (format: "owner/model-name" or "owner/model-name:version")
    // 4. Check the model's documentation for required parameters
    // 5. Add a new object to the modelsToTry array below
    //
    // Example models to try:
    // - Search for "nano banana" or similar model names on Replicate
    // - Look for models with "img2img" or "image-to-image" in their description
    // - Check model documentation for required parameters (prompt, image, strength, etc.)
    //
    const modelsToTry = [
      {
        name: "openai/gpt-image-1",
        params: {
          prompt: `Transform this image: ${transformationDescription}. Maintain the exact same structure, layout, perspective, furniture, appliances, and all elements. Change ONLY the surface finishes and colors as specified. Photorealistic result with high quality, realistic lighting.${hasCustomDirections ? ' Follow the user\'s specific custom directions carefully.' : ''}`,
          image: imageDataUrl, // Multimodal input - both text and image
          openai_api_key: openaiApiKey || "", // Required for bring-your-own-token model
          // Note: This model requires a verified OpenAI API key
          // Your OpenAI account will be charged for usage
        }
      },
      {
        name: "stability-ai/stable-diffusion-img2img",
        params: {
          prompt: `Transform this image: ${transformationDescription}. Maintain the exact same structure, layout, perspective, furniture, appliances, and all elements. Change ONLY the surface finishes and colors as specified. Photorealistic result with high quality, realistic lighting.${hasCustomDirections ? ' Follow the user\'s specific custom directions carefully.' : ''}`,
          image: imageDataUrl,
          strength: 0.6, // Controls how much to transform (0.0 = original, 1.0 = full transformation)
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50,
        }
      },
      {
        name: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        params: {
          prompt: `Transform this image: ${transformationDescription}. Maintain the exact same structure, layout, perspective, furniture, appliances, and all elements. Change ONLY the surface finishes and colors as specified. Photorealistic result with high quality, realistic lighting.${hasCustomDirections ? ' Follow the user\'s specific custom directions carefully.' : ''}`,
          image: imageDataUrl,
          strength: 0.6,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50,
        }
      },
      // Add your custom models here - search Replicate for image-to-image models
      // Example format:
      // {
      //   name: "owner/model-name",
      //   params: {
      //     prompt: `Transform this image: ${transformationDescription}...`,
      //     image: imageDataUrl,
      //     // Add other required parameters for the model
      //   }
      // },
    ]
    
    // Helper function to process model result
    const processModelResult = (result: any): string[] | null => {
      // Handle async iterators (some Replicate models return async iterators)
      if (result && typeof result === 'object' && typeof (result as any)[Symbol.asyncIterator] === 'function') {
        console.log('Result is an async iterator, consuming...')
        const results: string[] = []
        // Note: We can't await in a non-async function, so we'll handle this in the caller
        return null // Signal to handle async iterator in caller
      }
      
      // Handle different output formats
      if (Array.isArray(result)) {
        // Filter out functions and extract URLs
        const output = result
          .map(item => {
            if (typeof item === 'string') return item
            if (typeof item === 'function') {
              console.warn('Found function in output array, skipping')
              return null
            }
            if (item && typeof item === 'object') {
              return (item as any).url || (item as any).output || (item as any).image || null
            }
            return null
          })
          .filter((item): item is string => item !== null && typeof item === 'string')
        return output.length > 0 ? output : null
      } else if (typeof result === 'string') {
        return [result]
      } else if (result && typeof result === 'object') {
        // Handle various object formats
        if ('output' in result) {
          const outputValue = (result as any).output
          const output = Array.isArray(outputValue) ? outputValue : [outputValue]
          return output.length > 0 ? output : null
        } else if ('url' in result) {
          return [(result as any).url]
        } else if ('urls' in result && Array.isArray((result as any).urls)) {
          return (result as any).urls
        } else if ('image' in result) {
          return [(result as any).image]
        } else if ('images' in result && Array.isArray((result as any).images)) {
          return (result as any).images
        } else {
          // Try to find any string property that looks like a URL
          const stringProps = Object.values(result).filter(v => typeof v === 'string' && (v.startsWith('http') || v.startsWith('data:')))
          return stringProps.length > 0 ? (stringProps as string[]) : null
        }
      }
      return null
    }
    
    // Try each model in sequence until we get valid output
    let lastError: Error | null = null
    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i]
      try {
        console.log(`Trying model ${i + 1}/${modelsToTry.length}: ${model.name}`)
        console.log(`Replicate auth token present: ${!!process.env.REPLICATE_API_TOKEN}`)
        
        if (i > 0) {
          // Add a small delay between attempts to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        let result = await replicate.run(model.name as `${string}/${string}`, { input: model.params })
        console.log(`Model result type:`, typeof result)
        console.log(`Model result:`, result)
        
        // Handle async iterators
        if (result && typeof result === 'object' && typeof (result as any)[Symbol.asyncIterator] === 'function') {
          console.log('Result is an async iterator, consuming...')
          const results: string[] = []
          for await (const item of result as AsyncIterable<any>) {
            console.log('Iterator item:', item)
            if (typeof item === 'string') {
              results.push(item)
            } else if (item && typeof item === 'object') {
              const url = (item as any).url || (item as any).output || (item as any).image
              if (url && typeof url === 'string') {
                results.push(url)
              }
            }
          }
          result = results.length > 0 ? results : null
          console.log('Consumed iterator, results:', results)
        }
        
        // Process the result
        const processedOutput = processModelResult(result)
        
        if (processedOutput && processedOutput.length > 0) {
          output = processedOutput
          modelUsed = model.name
          console.log(`Successfully used model: ${model.name}`, `Output length: ${output.length}`)
          break // Success! Exit the loop
        } else {
          console.warn(`Model ${model.name} returned empty output, trying next model...`)
          lastError = new Error(`Model "${model.name}" returned empty output`)
          continue // Try next model
        }
      } catch (error: any) {
        console.error(`Model ${model.name} error:`, {
          status: error.status,
          statusCode: error.statusCode,
          message: error.message,
        })
        
        const errorMessage = error.message || JSON.stringify(error.body || error.response || {})
        
        // If rate limit, return immediately
        if (error.status === 429 || errorMessage?.includes("rate limit") || errorMessage?.includes("too many requests")) {
          return NextResponse.json(
            { 
              error: "API rate limit exceeded", 
              details: "You've made too many requests. Please wait a few minutes and try again." 
            },
            { status: 429 }
          )
        }
        
        // For other errors, continue to next model
        lastError = error
        console.log(`Model ${model.name} failed, trying next model...`)
        continue
      }
    }
    
    // If we get here, all models failed or returned empty output
    if (!output || !modelUsed) {
      console.error("All models failed or returned empty output")
      console.error(`Models attempted: ${modelsToTry.map(m => m.name).join(', ')}`)
      
      const errorDetails = lastError 
        ? `All attempted models failed. Last error: ${lastError.message}. 

**Troubleshooting Steps:**
1. Check that REPLICATE_API_TOKEN is set correctly in .env.local
2. Verify your Replicate account has credits/access
3. Visit https://replicate.com/explore to find working image-to-image models
4. Add new models to the modelsToTry array in app/api/transform-image/route.ts

**To add new models:**
- Search Replicate for "img2img" or "image-to-image" models
- Copy the model identifier (owner/model-name format)
- Add it to the modelsToTry array in the code
- Check the model's documentation for required parameters`
        : "No model was successfully executed. Check that your API keys are set correctly in .env.local"
      
      throw new Error(`Failed to generate image: ${errorDetails}`)
    }

    console.log(`Final output:`, output)
    console.log(`Output length:`, output?.length)
    console.log(`Output type:`, typeof output)
    console.log(`Model used: ${modelUsed}`)
    if (output) {
      console.log(`Output array contents:`, output.map((item, idx) => ({ index: idx, type: typeof item, value: typeof item === 'string' ? item.substring(0, 100) + '...' : item })))
    }
    
    const generatedImageUrl = output[0]
    if (!generatedImageUrl || typeof generatedImageUrl !== 'string') {
      console.error("Generated image URL is invalid:", generatedImageUrl)
      throw new Error(`Failed to generate image: Invalid output format. Expected string URL, got ${typeof generatedImageUrl}`)
    }
    
    console.log(`Generated image URL:`, generatedImageUrl)

    console.log("Image generated successfully")

    // Step 3: Download the generated image and convert to base64
    console.log("Step 3: Downloading generated image")
    const imageFetch = await fetch(generatedImageUrl)
    const generatedImageArrayBuffer = await imageFetch.arrayBuffer()
    const imageBase64 = Buffer.from(generatedImageArrayBuffer).toString("base64")

    // Get the content type from the response
    const contentType = imageFetch.headers.get("content-type") || "image/png"

    return NextResponse.json({
      transformedImage: imageBase64,
      mimeType: contentType,
      description: `Transformed ${surfaceType} using Stable Diffusion image-to-image`,
      note: "Image generated with Stable Diffusion image-to-image model",
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
