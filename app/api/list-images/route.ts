import { NextResponse } from "next/server"
import { readdir } from "fs/promises"
import { join } from "path"

const DEPLOY_FOLDERS = {
  "cabinet-refacing": "DEPLOY-cabinet-refacing",
  "cabinet-refinishing": "DEPLOY-cabinet-refinishing/iCloud Photos from Megan Fair",
  "decks": "DEPLOY-decks/iCloud Photos from Megan Fair",
  "furniture-restoration": "DEPLOY-furniture-restoration/iCloud Photos from Megan Fair",
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")

  if (!category || !(category in DEPLOY_FOLDERS)) {
    return NextResponse.json(
      { error: "Invalid category" },
      { status: 400 }
    )
  }

  try {
    const folderPath = join(process.cwd(), "public", DEPLOY_FOLDERS[category as keyof typeof DEPLOY_FOLDERS])
    const files = await readdir(folderPath)
    
    const imageFiles = files
      .filter((file) => {
        const ext = file.substring(file.lastIndexOf("."))
        return IMAGE_EXTENSIONS.includes(ext)
      })
      .map((file) => {
        const basePath = DEPLOY_FOLDERS[category as keyof typeof DEPLOY_FOLDERS]
        return `/${basePath}/${file}`
      })
      .sort()

    return NextResponse.json({ images: imageFiles })
  } catch (error) {
    console.error("Error reading directory:", error)
    return NextResponse.json(
      { error: "Failed to read images" },
      { status: 500 }
    )
  }
}
