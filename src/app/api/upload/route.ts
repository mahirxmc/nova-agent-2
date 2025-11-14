import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import JSZip from 'jszip'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.includes('zip') && !file.name.toLowerCase().endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Only ZIP files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save the zip file
    const zipPath = join(uploadsDir, file.name)
    await writeFile(zipPath, buffer)

    // Extract the zip file
    const zip = new JSZip()
    const zipContent = await zip.loadAsync(buffer)
    
    const extractedFiles = []
    const extractDir = join(uploadsDir, file.name.replace('.zip', ''))
    
    // Create extraction directory
    if (!existsSync(extractDir)) {
      await mkdir(extractDir, { recursive: true })
    }

    // Extract each file
    for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
      // Skip directories
      if (zipEntry.dir) continue

      const fileContent = await zipEntry.async('nodebuffer')
      const filePath = join(extractDir, relativePath)
      
      // Create subdirectories if needed
      const subDir = join(filePath, '..')
      if (!existsSync(subDir)) {
        await mkdir(subDir, { recursive: true })
      }
      
      await writeFile(filePath, fileContent)
      extractedFiles.push({
        path: relativePath,
        size: fileContent.length
      })
    }

    return NextResponse.json({
      message: 'File uploaded and extracted successfully',
      fileName: file.name,
      size: file.size,
      extractedFiles: extractedFiles.length,
      files: extractedFiles
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload and extract file' },
      { status: 500 }
    )
  }
}