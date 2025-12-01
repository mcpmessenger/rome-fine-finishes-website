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
    
    // Step 1: Use GPT-4 Vision to analyze the image and create a transformation prompt
    console.log(`Step 1: Analyzing image with GPT-4 Vision for surface type: ${surfaceType}`)
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
    const modelsToTry = [
      {
        name: "openai/gpt-image-1",
        params: {
          prompt: `Transform this image: ${transformationDescription}. Maintain the exact same structure, layout, perspective, furniture, appliances, and all elements. Change ONLY the surface finishes and colors. Photorealistic result with high quality, realistic lighting.`,
          image: imageDataUrl, // Multimodal input - both text and image
          openai_api_key: openaiApiKey || "", // Required for bring-your-own-token model
          // Note: This model requires a verified OpenAI API key
          // Your OpenAI account will be charged for usage
        }
      },
      // Note: Many Replicate img2img models return 404
      // If gpt-image-1 fails, you'll need to find working models on Replicate
      // Visit https://replicate.com/explore and search for "img2img" or "image-to-image"
      // Then update the model names below with working models from your account
    ]
    
    const primaryModel = modelsToTry[0]
    
    try {
      console.log(`Using model: ${primaryModel.name}`)
      console.log(`Replicate auth token present: ${!!process.env.REPLICATE_API_TOKEN}`)
      console.log(`Replicate auth token length: ${process.env.REPLICATE_API_TOKEN?.length || 0}`)
      
      // Try the API call
      console.log(`Calling model: ${primaryModel.name}`)
      console.log(`Input params keys:`, Object.keys(primaryModel.params))
      console.log(`Image data URL length:`, imageDataUrl?.length || 0)
      console.log(`Image data URL preview:`, imageDataUrl?.substring(0, 50) || 'N/A')
      
      let result = await replicate.run(primaryModel.name as `${string}/${string}`, { input: primaryModel.params })
      console.log(`Model result type:`, typeof result)
      console.log(`Model result:`, result)
      console.log(`Model result is array:`, Array.isArray(result))
      if (result && typeof result === 'object') {
        console.log(`Model result keys:`, Object.keys(result))
      }
      
      // Handle async iterators (some Replicate models return async iterators)
      if (result && typeof result === 'object' && typeof (result as any)[Symbol.asyncIterator] === 'function') {
        console.log('Result is an async iterator, consuming...')
        const results: string[] = []
        for await (const item of result as AsyncIterable<any>) {
          console.log('Iterator item:', item)
          if (typeof item === 'string') {
            results.push(item)
          } else if (item && typeof item === 'object') {
            // Extract URL from iterator items
            const url = (item as any).url || (item as any).output || (item as any).image
            if (url && typeof url === 'string') {
              results.push(url)
            }
          }
        }
        result = results.length > 0 ? results : result
        console.log('Consumed iterator, results:', results)
      }
      
      // Handle different output formats
      if (Array.isArray(result)) {
        // Filter out functions and extract URLs
        output = result
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
      } else if (typeof result === 'string') {
        output = [result]
      } else if (result && typeof result === 'object') {
        // Handle various object formats
        if ('output' in result) {
          // Some models return { output: [...] } or { output: "url" }
          const outputValue = (result as any).output
          output = Array.isArray(outputValue) ? outputValue : [outputValue]
        } else if ('url' in result) {
          // Some models return { url: "..." }
          output = [(result as any).url]
        } else if ('urls' in result && Array.isArray((result as any).urls)) {
          // Some models return { urls: [...] }
          output = (result as any).urls
        } else if ('image' in result) {
          // Some models return { image: "..." }
          output = [(result as any).image]
        } else if ('images' in result && Array.isArray((result as any).images)) {
          // Some models return { images: [...] }
          output = (result as any).images
        } else {
          // Try to find any string property that looks like a URL
          const stringProps = Object.values(result).filter(v => typeof v === 'string' && (v.startsWith('http') || v.startsWith('data:')))
          if (stringProps.length > 0) {
            output = stringProps as string[]
          } else {
            console.error(`Unexpected output format:`, result)
            console.error(`Object keys:`, Object.keys(result))
            throw new Error(`Unexpected output format from model: object with keys ${Object.keys(result).join(', ')}`)
          }
        }
      } else {
        console.error(`Unexpected output format:`, result)
        throw new Error(`Unexpected output format from model: ${typeof result}`)
      }
      
      modelUsed = primaryModel.name
      console.log(`Successfully used model: ${primaryModel.name}`, `Output length: ${output?.length}`)
    } catch (error: any) {
      console.error(`Model error details:`, {
        status: error.status,
        statusCode: error.statusCode,
        message: error.message,
        response: error.response?.data || error.response,
        body: error.body,
        request: error.request?.url,
      })
      
      // Check if it's an organization verification error for gpt-image-1
      const errorMessage = error.message || JSON.stringify(error.body || error.response || {})
      const isOrgVerificationError = errorMessage?.includes("organization must be verified") || errorMessage?.includes("Verify Organization")
      
      if (error.status === 429 || errorMessage?.includes("rate limit") || errorMessage?.includes("too many requests")) {
        return NextResponse.json(
          { 
            error: "API rate limit exceeded", 
            details: "You've made too many requests. Please wait a few minutes and try again." 
          },
          { status: 429 }
        )
      }
      
      // If it's a 404 or organization verification error, try other models from our list
      if (error.status === 404 || isOrgVerificationError || errorMessage?.includes("model not found") || errorMessage?.includes("not found")) {
        if (isOrgVerificationError) {
          console.log("OpenAI organization verification required for gpt-image-1. Falling back to other models...")
        } else {
          console.log(`Primary model not found, trying alternatives...`)
        }
        let lastError: Error | null = error
        
        // Try remaining models from our list
        for (let i = 1; i < modelsToTry.length; i++) {
          const model = modelsToTry[i]
          try {
            console.log(`Trying model ${i + 1}/${modelsToTry.length}: ${model.name}`)
            // Add a small delay between attempts to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000))
            let fallbackResult = await replicate.run(model.name as `${string}/${string}`, { input: model.params })
            console.log(`Fallback model result type:`, typeof fallbackResult)
            console.log(`Fallback model result:`, fallbackResult)
            
            // Handle async iterators (same as primary model)
            if (fallbackResult && typeof fallbackResult === 'object' && typeof (fallbackResult as any)[Symbol.asyncIterator] === 'function') {
              console.log('Fallback result is an async iterator, consuming...')
              const results: string[] = []
              for await (const item of fallbackResult as AsyncIterable<any>) {
                console.log('Fallback iterator item:', item)
                if (typeof item === 'string') {
                  results.push(item)
                } else if (item && typeof item === 'object') {
                  const url = (item as any).url || (item as any).output || (item as any).image
                  if (url && typeof url === 'string') {
                    results.push(url)
                  }
                }
              }
              fallbackResult = results.length > 0 ? results : fallbackResult
              console.log('Consumed fallback iterator, results:', results)
            }
            
            // Handle different output formats (same as primary model)
            if (Array.isArray(fallbackResult)) {
              // Filter out functions and extract URLs
              output = fallbackResult
                .map(item => {
                  if (typeof item === 'string') return item
                  if (typeof item === 'function') {
                    console.warn('Found function in fallback output array, skipping')
                    return null
                  }
                  if (item && typeof item === 'object') {
                    return (item as any).url || (item as any).output || (item as any).image || null
                  }
                  return null
                })
                .filter((item): item is string => item !== null && typeof item === 'string')
            } else if (typeof fallbackResult === 'string') {
              output = [fallbackResult]
            } else if (fallbackResult && typeof fallbackResult === 'object') {
              // Handle various object formats
              if ('output' in fallbackResult) {
                const outputValue = (fallbackResult as any).output
                output = Array.isArray(outputValue) ? outputValue : [outputValue]
              } else if ('url' in fallbackResult) {
                output = [(fallbackResult as any).url]
              } else if ('urls' in fallbackResult && Array.isArray((fallbackResult as any).urls)) {
                output = (fallbackResult as any).urls
              } else if ('image' in fallbackResult) {
                output = [(fallbackResult as any).image]
              } else if ('images' in fallbackResult && Array.isArray((fallbackResult as any).images)) {
                output = (fallbackResult as any).images
              } else {
                // Try to find any string property that looks like a URL
                const stringProps = Object.values(fallbackResult).filter(v => typeof v === 'string' && (v.startsWith('http') || v.startsWith('data:')))
                if (stringProps.length > 0) {
                  output = stringProps as string[]
                } else {
                  console.error(`Unexpected output format from fallback:`, fallbackResult)
                  console.error(`Object keys:`, Object.keys(fallbackResult))
                  throw new Error(`Unexpected output format from model: object with keys ${Object.keys(fallbackResult).join(', ')}`)
                }
              }
            } else {
              console.error(`Unexpected output format from fallback:`, fallbackResult)
              throw new Error(`Unexpected output format from model: ${typeof fallbackResult}`)
            }
            
            modelUsed = model.name
            console.log(`Successfully used model: ${model.name}`, `Output length: ${output?.length}`)
            break
          } catch (fallbackError: any) {
            if (fallbackError.status === 429 || fallbackError.message?.includes("rate limit")) {
              return NextResponse.json(
                { 
                  error: "API rate limit exceeded", 
                  details: "You've made too many requests. Please wait a few minutes and try again." 
                },
                { status: 429 }
              )
            }
            console.log(`Model ${model.name} failed:`, fallbackError.message)
            lastError = fallbackError
            continue
          }
        }
        
        if (!output || !modelUsed) {
          // Provide helpful error message
          const isOrgError = isOrgVerificationError
          return NextResponse.json(
            { 
              error: isOrgError ? "OpenAI organization verification required" : "No available image-to-image models found", 
              details: isOrgError ? `The gpt-image-1 model requires your OpenAI organization to be verified.

**If you just verified:**
- It can take up to 30 minutes for access to propagate after verification
- Try waiting 10-15 more minutes and then try again
- You can also try generating a new API key at https://platform.openai.com/api-keys to refresh the status

**To verify (if not done yet):**
1. Go to https://platform.openai.com/settings/organization/general
2. Click on "Verify Organization"
3. Wait up to 30 minutes for access to propagate

**Current Status:**
- All Replicate fallback models are returning 404 (models not found)
- This means those models don't exist or aren't available in your account
- Once gpt-image-1 verification propagates, it should work

**Alternative Solution:**
If verification takes too long, you can find working img2img models at https://replicate.com/explore
Search for "img2img" or "image-to-image" and share the model name to update the code.

Last error: ${lastError?.message || "Unknown error"}` : `All attempted models returned 404 errors. This means the models don't exist or aren't available in your Replicate account.

**Solutions:**

1. **Invalid API Token**: Your REPLICATE_API_TOKEN in .env.local may be incorrect or expired.
   - Get your token from: https://replicate.com/account/api-tokens
   - Make sure it starts with "r8_" and is the full token

2. **Models Not Available**: The models may not be available in your account or have been removed.
   - Visit https://replicate.com/explore to browse available models
   - Search for "img2img" or "image-to-image" models
   - Copy the exact model identifier (owner/model format)

3. **Account Permissions**: Your account may not have access to these models.
   - Check your Replicate account dashboard
   - Verify your account status and billing

To fix this:
- Verify your API token at https://replicate.com/account/api-tokens
- Find a working img2img model at https://replicate.com/explore
- Update the model name in the code with a model that works for your account

Last error: ${lastError?.message || "Unknown error"}` 
            },
            { status: 404 }
          )
        }
      } else {
        // Re-throw other errors
        throw error
      }
    }

    console.log(`Final output:`, output)
    console.log(`Output length:`, output?.length)
    console.log(`Output type:`, typeof output)
    console.log(`Model used: ${modelUsed}`)
    if (output) {
      console.log(`Output array contents:`, output.map((item, idx) => ({ index: idx, type: typeof item, value: typeof item === 'string' ? item.substring(0, 100) + '...' : item })))
    }
    
    if (!output || output.length === 0) {
      console.error("Output is empty or undefined")
      console.error(`Model attempted: ${modelUsed || 'None'}`)
      console.error("This might mean:")
      console.error("1. The model doesn't support the input format (data URLs, etc.)")
      console.error("2. The model returned an empty result")
      console.error("3. The output format is different than expected")
      console.error("4. REPLICATE_API_TOKEN might not be set correctly (check .env.local)")
      
      // Provide more helpful error message
      const errorDetails = modelUsed 
        ? `Model "${modelUsed}" returned empty output. This could mean the model doesn't support the input format or there's a configuration issue.`
        : "No model was successfully executed. Check that your API keys are set correctly in .env.local"
      
      throw new Error(`Failed to generate image: ${errorDetails}`)
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
