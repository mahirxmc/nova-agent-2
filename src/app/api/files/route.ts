import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile, stat } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { path = '/' } = await request.json()
    
    // Security: prevent path traversal
    const safePath = path.replace(/\.\./g, '').replace(/^\/+/, '')
    const fullPath = join(process.cwd(), 'uploads', safePath)
    
    try {
      const entries = await readdir(fullPath, { withFileTypes: true })
      const files = []
      
      for (const entry of entries) {
        const entryPath = join(fullPath, entry.name)
        const stats = await stat(entryPath)
        
        files.push({
          name: entry.name,
          path: join(safePath, entry.name).replace(/\\/g, '/'),
          type: entry.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modified: stats.mtime.toISOString()
        })
      }
      
      return NextResponse.json({ files })
    } catch (error) {
      return NextResponse.json({ files: [] })
    }
  } catch (error) {
    console.error('File listing error:', error)
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
}