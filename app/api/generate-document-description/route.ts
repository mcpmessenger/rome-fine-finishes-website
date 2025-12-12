import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const maxDuration = 30

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
      console.error("FormData parsing error:", error)
      return NextResponse.json(
        { error: "Failed to parse form data", details: error.message },
        { status: 400 }
      )
    }
    
    const file = formData.get("file") as File
    const fileName = formData.get("fileName") as string || file?.name || "document"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    let description = ""
    let fileType = file.type
    let fileSize = file.size

    // Handle images with GPT-4 Vision
    if (file.type.startsWith("image/")) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64Image = buffer.toString("base64")
        const mimeType = file.type

        const descriptionPrompt = `Analyze this image and provide a detailed, professional description of what you see. Focus on:
- The main subject matter and composition
- Visual elements, colors, materials, and textures
- Style, design elements, and aesthetic qualities
- Any notable details or features
- Overall context and purpose

Provide a comprehensive description in 2-4 sentences that would be useful for document organization and search.`

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: descriptionPrompt,
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
          max_tokens: 300,
        })

        description = response.choices[0]?.message?.content?.trim() || "Unable to generate description."
      } catch (error: any) {
        console.error("Image description generation error:", error)
        description = `Image file: ${fileName}. Could not generate AI description: ${error.message}`
      }
    } else {
      // For non-image files, generate a basic description based on file type and name
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || ""
      const fileTypeMap: Record<string, string> = {
        pdf: "PDF document",
        doc: "Microsoft Word document",
        docx: "Microsoft Word document",
        xls: "Microsoft Excel spreadsheet",
        xlsx: "Microsoft Excel spreadsheet",
        txt: "Text file",
        csv: "Comma-separated values file",
      }
      
      const typeDescription = fileTypeMap[fileExtension] || `${fileExtension.toUpperCase()} file`
      description = `This is a ${typeDescription} named "${fileName}". Uploaded for reference and documentation purposes.`
    }

    return NextResponse.json({
      description,
      fileName,
      fileType,
      fileSize,
      uploadDate: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Document description generation error:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate description", 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

