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

    // Step 2: Use Replicate's image-to-image models
    // These models accept the original image and modify it while maintaining structure
    console.log("Step 2: Generating transformed image with image-to-image models")
    
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
        name: "google/nano-banana",
        params: {
          prompt: `Transform this image: ${transformationDescription}. Maintain the exact same structure, layout, perspective, furniture, appliances, and all elements. Change ONLY the surface finishes and colors as specified. Photorealistic result with high quality, realistic lighting.${hasCustomDirections ? ' Follow the user\'s specific custom directions carefully.' : ''}`,
          image_input: [imageDataUrl], // Nano Banana expects an array of image URLs/data URLs
          aspect_ratio: "match_input_image",
          output_format: "jpg",
        }
      },
      {
        name: "black-forest-labs/flux-schnell",
        params: {
          prompt: `Transform this image: ${transformationDescription}. Maintain the exact same structure, layout, perspective, furniture, appliances, and all elements. Change ONLY the surface finishes and colors as specified. Photorealistic result with high quality, realistic lighting.${hasCustomDirections ? ' Follow the user\'s specific custom directions carefully.' : ''}`,
          image: imageDataUrl,
          strength: 0.6,
          num_outputs: 1,
        }
      },
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
    
    // Helper function to extract URL from various object formats
    const extractUrlFromObject = (obj: any, depth: number = 0, maxDepth: number = 5): string | null => {
      if (!obj || typeof obj !== 'object' || depth > maxDepth) return null
      
      // Handle Replicate FileOutput objects (have .url property or async url getter)
      if ('url' in obj) {
        const urlValue = obj.url
        if (typeof urlValue === 'string' && (urlValue.startsWith('http') || urlValue.startsWith('data:'))) {
          return urlValue
        }
        if (typeof urlValue === 'function' || typeof urlValue?.then === 'function') {
          // Async URL getter - log for debugging
          console.log('Found async URL getter in result object')
          return null // Will need special handling
        }
        // If url is an object, recurse into it
        if (urlValue && typeof urlValue === 'object') {
          const nested = extractUrlFromObject(urlValue, depth + 1, maxDepth)
          if (nested) return nested
        }
      }
      
      // Common property names (expanded list)
      const urlProperties = [
        'url', 'output', 'image', 'image_url', 'file', 'file_url', 
        'output_url', 'result', 'result_url', 'imageUrl', 'imageUrl',
        'href', 'src', 'source', 'content', 'data', 'value',
        'file_url', 'output_file', 'generated_image', 'transformed_image'
      ]
      for (const prop of urlProperties) {
        if (prop in obj) {
          const value = obj[prop]
          if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:'))) {
            return value
          }
          if (value && typeof value === 'object') {
            // Recursively check nested objects
            const nested = extractUrlFromObject(value, depth + 1, maxDepth)
            if (nested) return nested
          }
          // Handle arrays
          if (Array.isArray(value) && value.length > 0) {
            for (const item of value) {
              if (typeof item === 'string' && (item.startsWith('http') || item.startsWith('data:'))) {
                return item
              }
              const nested = extractUrlFromObject(item, depth + 1, maxDepth)
              if (nested) return nested
            }
          }
        }
      }
      
      // Check all string values in the object (aggressive search)
      for (const [key, value] of Object.entries(obj)) {
        // Skip functions and symbols
        if (typeof value === 'function' || typeof value === 'symbol') continue
        
        if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:'))) {
          console.log(`Found URL in property "${key}": ${value.substring(0, 100)}`)
          return value
        }
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const nested = extractUrlFromObject(value, depth + 1, maxDepth)
          if (nested) {
            console.log(`Found URL in nested property "${key}"`)
            return nested
          }
        }
        // Check arrays
        if (Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === 'string' && (item.startsWith('http') || item.startsWith('data:'))) {
              console.log(`Found URL in array at property "${key}"`)
              return item
            }
            const nested = extractUrlFromObject(item, depth + 1, maxDepth)
            if (nested) {
              console.log(`Found URL in array item at property "${key}"`)
              return nested
            }
          }
        }
      }
      
      return null
    }
    
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
              return extractUrlFromObject(item)
            }
            return null
          })
          .filter((item): item is string => item !== null && typeof item === 'string')
        return output.length > 0 ? output : null
      } else if (typeof result === 'string') {
        // Handle both URL strings and base64 data URLs
        if (result.startsWith('data:')) {
          console.log('Found base64 data URL in result')
        } else if (result.startsWith('http')) {
          console.log('Found HTTP URL in result')
        }
        return [result]
      } else if (result && typeof result === 'object') {
        // Check if this is an error object first
        if ('error' in result || 'message' in result && 'detail' in result) {
          console.warn('Result appears to be an error object:', result)
          return null
        }
        
        // Handle various object formats
        if ('output' in result) {
          const outputValue = (result as any).output
          if (Array.isArray(outputValue)) {
            const urls = outputValue.map((item: any) => {
              if (typeof item === 'string') return item
              return extractUrlFromObject(item)
            }).filter((url): url is string => url !== null)
            return urls.length > 0 ? urls : null
          } else if (typeof outputValue === 'string') {
            return [outputValue]
          } else {
            const url = extractUrlFromObject(outputValue)
            return url ? [url] : null
          }
        }
        
        // Try to extract URL from the object directly
        const url = extractUrlFromObject(result)
        if (url) return [url]
        
        // Try common array properties
        if ('urls' in result && Array.isArray((result as any).urls)) {
          return (result as any).urls.filter((u: any): u is string => typeof u === 'string')
        } else if ('images' in result && Array.isArray((result as any).images)) {
          const images = (result as any).images
          const urls = images.map((img: any) => {
            if (typeof img === 'string') return img
            return extractUrlFromObject(img)
          }).filter((url: string | null): url is string => url !== null)
          return urls.length > 0 ? urls : null
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
        
        let rawResult: any = await replicate.run(model.name as `${string}/${string}`, { input: model.params })
        console.log(`Model ${model.name} - RAW RESULT:`, {
          type: typeof rawResult,
          isArray: Array.isArray(rawResult),
          keys: rawResult && typeof rawResult === 'object' ? Object.keys(rawResult) : null,
          value: rawResult
        })
        
        // Handle Replicate FileOutput objects and ReadableStreams
        let result: any = rawResult
        
        // Check if result is an array with ReadableStream (flux-schnell, gpt-image-1)
        if (Array.isArray(rawResult) && rawResult.length > 0 && rawResult[0] instanceof ReadableStream) {
          console.log('Found ReadableStream in array, converting to buffer...')
          try {
            const stream = rawResult[0]
            const reader = stream.getReader()
            const chunks: Uint8Array[] = []
            
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              if (value instanceof Uint8Array) {
                chunks.push(value)
              }
            }
            
            if (chunks.length > 0) {
              const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
              const combinedBuffer = new Uint8Array(totalLength)
              let offset = 0
              for (const chunk of chunks) {
                combinedBuffer.set(chunk, offset)
                offset += chunk.length
              }
              // Convert to base64 data URL
              const base64 = Buffer.from(combinedBuffer).toString('base64')
              result = `data:image/png;base64,${base64}`
              console.log(`Converted ReadableStream (${totalLength} bytes) to base64 data URL`)
            }
          } catch (err) {
            console.warn('Failed to read ReadableStream:', err)
          }
        }
        // Method 1: Check if it's a FileOutput with url getter
        else if (rawResult && typeof rawResult === 'object') {
          // Try to access url property (might be getter, promise, or direct)
          if ('url' in rawResult) {
            const urlValue = (rawResult as any).url
            console.log(`Model ${model.name} - Found 'url' property:`, {
              type: typeof urlValue,
              isFunction: typeof urlValue === 'function',
              isPromise: urlValue && typeof urlValue.then === 'function',
              isString: typeof urlValue === 'string',
              value: typeof urlValue === 'string' ? urlValue.substring(0, 100) : 'non-string'
            })
            
            // If url is a promise or has a .then method, await it
            if (urlValue && typeof urlValue.then === 'function') {
              console.log('Found promise-based URL, awaiting...')
              try {
                const resolvedUrl = await urlValue
                if (typeof resolvedUrl === 'string') {
                  console.log(`Resolved URL from promise: ${resolvedUrl.substring(0, 100)}`)
                  result = resolvedUrl
                }
              } catch (err) {
                console.warn('Failed to resolve URL from promise:', err)
              }
            } else if (urlValue && typeof urlValue === 'function') {
              console.log('Found function-based URL getter, calling...')
              try {
                const resolvedUrl = await urlValue()
                if (typeof resolvedUrl === 'string') {
                  console.log(`Resolved URL from function: ${resolvedUrl.substring(0, 100)}`)
                  result = resolvedUrl
                }
              } catch (err) {
                console.warn('Failed to resolve URL from function:', err)
              }
            } else if (typeof urlValue === 'string') {
              // Direct string URL
              console.log(`Found direct string URL: ${urlValue.substring(0, 100)}`)
              result = urlValue
            }
          }
          
          // Method 2: Try calling .toString() or inspecting the object more deeply
          if (result === rawResult && typeof rawResult === 'object') {
            // Check for common methods that might return URLs
            const possibleMethods = ['getUrl', 'get', 'toString', 'valueOf']
            for (const methodName of possibleMethods) {
              if (typeof (rawResult as any)[methodName] === 'function') {
                try {
                  const methodResult = (rawResult as any)[methodName]()
                  if (typeof methodResult === 'string' && (methodResult.startsWith('http') || methodResult.startsWith('data:'))) {
                    console.log(`Found URL via method ${methodName}: ${methodResult.substring(0, 100)}`)
                    result = methodResult
                    break
                  }
                  if (methodResult && typeof methodResult.then === 'function') {
                    const resolved = await methodResult
                    if (typeof resolved === 'string' && (resolved.startsWith('http') || resolved.startsWith('data:'))) {
                      console.log(`Found URL via async method ${methodName}: ${resolved.substring(0, 100)}`)
                      result = resolved
                      break
                    }
                  }
                } catch (err) {
                  // Method doesn't work or throws, continue
                }
              }
            }
          }
        }
        
        // Handle async iterators (e.g., Nano Banana returns binary chunks)
        let processedResult: any = result
        if (result && typeof result === 'object' && typeof (result as any)[Symbol.asyncIterator] === 'function') {
          console.log('Result is an async iterator, consuming...')
          const chunks: Uint8Array[] = []
          const iteratorResults: string[] = []
          const asyncIterable = result as AsyncIterable<any>
          
          for await (const iteratorItem of asyncIterable) {
            console.log(`Iterator item type: ${typeof iteratorItem}, is Uint8Array: ${iteratorItem instanceof Uint8Array}`)
            
            // Handle binary data chunks (Uint8Array) - this is image data
            if (iteratorItem instanceof Uint8Array) {
              chunks.push(iteratorItem)
            } else if (typeof iteratorItem === 'string') {
              // String URLs
              iteratorResults.push(iteratorItem)
            } else if (iteratorItem && typeof iteratorItem === 'object') {
              // Try to extract URL from object
              const url = iteratorItem.url || iteratorItem.output || iteratorItem.image
              if (url && typeof url === 'string') {
                iteratorResults.push(url)
              }
            }
          }
          
          // If we got binary chunks, convert them to base64 data URL
          if (chunks.length > 0) {
            console.log(`Received ${chunks.length} binary chunks, converting to image...`)
            const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
            const combinedBuffer = new Uint8Array(totalLength)
            let offset = 0
            for (const chunk of chunks) {
              combinedBuffer.set(chunk, offset)
              offset += chunk.length
            }
            // Convert to base64 data URL
            const base64 = Buffer.from(combinedBuffer).toString('base64')
            const dataUrl = `data:image/png;base64,${base64}`
            processedResult = dataUrl
            console.log(`Converted ${totalLength} bytes to base64 data URL`)
          } else if (iteratorResults.length > 0) {
            processedResult = iteratorResults
          } else {
            processedResult = null
          }
          
          console.log('Consumed iterator, results:', {
            binaryChunks: chunks.length,
            urlResults: iteratorResults.length,
            finalResult: processedResult ? (typeof processedResult === 'string' ? processedResult.substring(0, 100) + '...' : 'array/object') : null
          })
        }
        
        // Process the result
        const processedOutput = processModelResult(processedResult)
        
        // Enhanced logging for debugging - FULL object inspection
        console.log(`Model ${model.name} - FULL RESULT INSPECTION:`)
        console.log(`  - Type: ${typeof processedResult}`)
        console.log(`  - Is Array: ${Array.isArray(processedResult)}`)
        if (processedResult && typeof processedResult === 'object') {
          console.log(`  - Keys: ${Object.keys(processedResult).join(', ')}`)
          console.log(`  - Full Object Structure:`, JSON.stringify(processedResult, null, 2))
          // Check each property
          for (const key of Object.keys(processedResult)) {
            const value = (processedResult as any)[key]
            console.log(`  - Property "${key}": type=${typeof value}, value=${typeof value === 'string' ? value.substring(0, 100) : typeof value === 'object' ? JSON.stringify(value).substring(0, 100) : String(value)}`)
          }
        } else {
          console.log(`  - Value: ${String(processedResult).substring(0, 200)}`)
        }
        console.log(`Model ${model.name} - Processed output:`, {
          hasOutput: !!processedOutput,
          outputLength: processedOutput?.length || 0,
          outputType: Array.isArray(processedOutput) ? 'array' : typeof processedOutput,
          firstItem: processedOutput?.[0] ? (typeof processedOutput[0] === 'string' ? processedOutput[0].substring(0, 100) + '...' : processedOutput[0]) : null,
        })
        
        if (processedOutput && processedOutput.length > 0) {
          output = processedOutput
          modelUsed = model.name
          console.log(`Successfully used model: ${model.name}`, `Output length: ${output.length}`)
          break // Success! Exit the loop
        } else {
          console.warn(`Model ${model.name} returned empty output. Raw result:`, {
            resultType: typeof processedResult,
            isArray: Array.isArray(processedResult),
            resultKeys: processedResult && typeof processedResult === 'object' ? Object.keys(processedResult) : null,
            resultPreview: typeof processedResult === 'string' ? processedResult.substring(0, 200) : JSON.stringify(processedResult).substring(0, 200),
          })
          lastError = new Error(`Model "${model.name}" returned empty output. Raw result type: ${typeof processedResult}`)
          continue // Try next model
        }
      } catch (error: any) {
        console.error(`Model ${model.name} error:`, {
          status: error.status,
          statusCode: error.statusCode,
          message: error.message,
          body: error.body,
          response: error.response,
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
        
        // For 404 errors, log that the model might not exist
        if (error.status === 404 || error.statusCode === 404) {
          console.warn(`Model ${model.name} not found (404). Model may be deprecated or moved.`)
        }
        
        // For other errors, continue to next model
        lastError = error
        console.log(`Model ${model.name} failed with error: ${errorMessage}, trying next model...`)
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
    
    console.log(`Generated image URL/Data:`, generatedImageUrl.substring(0, 100) + '...')

    console.log("Image generated successfully")

    // Step 3: Handle the generated image (could be URL or base64 data URL)
    let imageBase64: string
    let contentType: string
    
    if (generatedImageUrl.startsWith('data:')) {
      // It's already a base64 data URL - extract the base64 part
      console.log("Image is already a base64 data URL, extracting...")
      const dataUrlMatch = generatedImageUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (dataUrlMatch) {
        contentType = dataUrlMatch[1]
        imageBase64 = dataUrlMatch[2]
      } else {
        // Fallback: try to extract just the base64 part
        const base64Match = generatedImageUrl.split(',')
        if (base64Match.length > 1) {
          imageBase64 = base64Match[1]
          contentType = "image/png"
        } else {
          throw new Error("Failed to parse base64 data URL")
        }
      }
    } else {
      // It's a regular URL - download it
      console.log("Step 3: Downloading generated image from URL")
      const imageFetch = await fetch(generatedImageUrl)
      const generatedImageArrayBuffer = await imageFetch.arrayBuffer()
      imageBase64 = Buffer.from(generatedImageArrayBuffer).toString("base64")
      contentType = imageFetch.headers.get("content-type") || "image/png"
    }

    return NextResponse.json({
      transformedImage: imageBase64,
      mimeType: contentType,
      description: `Transformed ${surfaceType} using ${modelUsed}`,
      note: `Image generated with ${modelUsed} model`,
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
