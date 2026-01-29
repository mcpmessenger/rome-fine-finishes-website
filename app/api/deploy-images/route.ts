import { readdir } from "node:fs/promises"
import path from "path"

import { NextResponse } from "next/server"

const DEPLOY_FOLDERS = [
  { id: "cabinet-refacing", directory: "DEPLOY-cabinet-refacing" },
  { id: "cabinet-refinishing", directory: "DEPLOY-cabinet-refinishing" },
  { id: "decks", directory: "DEPLOY-decks" },
  { id: "furniture-restoration", directory: "DEPLOY-furniture-restoration" },
]

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".bmp",
  ".tiff",
])

async function collectImagesFromDir(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true })
  const images: string[] = []

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue
    }

    const entryPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      const nestedImages = await collectImagesFromDir(entryPath)
      images.push(...nestedImages)
      continue
    }

    if (!entry.isFile()) {
      continue
    }

    const extension = path.extname(entry.name).toLowerCase()
    if (!IMAGE_EXTENSIONS.has(extension)) {
      continue
    }

    const relativePath = path.relative(path.join(process.cwd(), "public"), entryPath)
    const normalizedPath = `/${relativePath.split(path.sep).join("/")}`
    images.push(normalizedPath)
  }

  return images.sort()
}

export async function GET() {
  const imagesByService: Record<string, string[]> = {}

  await Promise.all(
    DEPLOY_FOLDERS.map(async ({ id, directory }) => {
      const directoryPath = path.join(process.cwd(), "public", directory)
      try {
        imagesByService[id] = await collectImagesFromDir(directoryPath)
      } catch {
        imagesByService[id] = []
      }
    })
  )

  return NextResponse.json({ imagesByService })
}
