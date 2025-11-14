import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json()
    
    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      )
    }
    
    // Security: prevent path traversal
    const safePath = path.replace(/\.\./g, '').replace(/^\/+/, '')
    const fullPath = join(process.cwd(), 'uploads', safePath)
    
    try {
      const content = await readFile(fullPath, 'utf-8')
      return NextResponse.json({ content })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to read file' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('File reading error:', error)
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    )
  }
}