import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set in environment variables")
      return NextResponse.json(
        { 
          error: "API configuration error", 
          details: "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables." 
        },
        { status: 500 }
      )
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error: any) {
      // Handle form data parsing errors
      console.error("FormData parsing error:", error)
      return NextResponse.json(
        { error: "Failed to parse form data", details: error.message },
        { status: 400 }
      )
    }
    
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
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

    // Detection prompt with priority order: cabinets > fireplaces > decks > rooms
    const detectionPrompt = `Analyze this image and determine the primary surface type that could be refinished. 
Priority order (return ONLY one of these exact values):
1. "cabinets" - if kitchen or bathroom cabinets are visible
2. "fireplace" - if a fireplace or mantel is visible
3. "deck" - if an outdoor deck, patio, or deck surface is visible
4. "room" - if it's a general interior room but none of the above

Be specific and accurate. Return ONLY the single word: "cabinets", "fireplace", "deck", or "room" (lowercase, no quotes, no explanation).`

    // Use OpenAI Vision API (GPT-4 Vision)
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // GPT-4 Omni (latest vision model)
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: detectionPrompt,
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
      max_tokens: 10, // We only need one word
    })

    const detectedType = response.choices[0]?.message?.content?.trim().toLowerCase() || "room"

    // Validate detected type
    const validTypes = ["cabinets", "fireplace", "deck", "room"]
    const surfaceType = validTypes.includes(detectedType) ? detectedType : "room"

    console.log(`Detected surface type: ${surfaceType}`)

    return NextResponse.json({ surfaceType })
  } catch (error: any) {
    console.error("Surface detection error:", error)
    
    // Provide more specific error messages
    let errorMessage = "Failed to detect surface type"
    let errorDetails = error.message || "Unknown error occurred"
    
    if (error.message?.includes("API_KEY") || error.message?.includes("api key") || error.status === 401) {
      errorMessage = "API configuration error"
      errorDetails = "Invalid or missing OpenAI API key. Please check your environment variables."
    } else if (error.message?.includes("quota") || error.message?.includes("rate limit") || error.status === 429) {
      errorMessage = "API rate limit exceeded"
      errorDetails = "You've made too many requests. Please wait a few minutes and try again. You can use the manual selection option below to continue without waiting."
    } else if (error.message?.includes("insufficient_quota") || error.status === 402) {
      errorMessage = "Insufficient API quota"
      errorDetails = "Your OpenAI account has insufficient credits. Please add credits to your account."
    } else if (error.message?.includes("model") || error.status === 404) {
      errorMessage = "Model not available"
      errorDetails = "The selected model is not available. Please check your API key permissions."
    }
    
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    )
  }
}
