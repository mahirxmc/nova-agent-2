'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Upload, File, Folder, Search, RefreshCw, Eye, Download, Trash2 } from 'lucide-react'

interface FileInfo {
  name: string
  path: string
  type: 'file' | 'directory'
  size: number
  modified: string
  content?: string
}

export default function FileManager() {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [currentPath, setCurrentPath] = useState('/')
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const loadFiles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath })
      })
      
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Failed to load files:', error)
    }
    setIsLoading(false)
  }

  const viewFile = async (file: FileInfo) => {
    if (file.type === 'directory') {
      setCurrentPath(file.path)
      return
    }

    try {
      const response = await fetch('/api/files/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path })
      })
      
      if (response.ok) {
        const data = await response.json()
        setFileContent(data.content || '')
        setSelectedFile(file)
      }
    } catch (error) {
      console.error('Failed to load file content:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: FileInfo) => {
    if (file.type === 'directory') return <Folder className="w-4 h-4" />
    
    const ext = file.name.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'txt': return <File className="w-4 h-4 text-blue-500" />
      case 'js': return <File className="w-4 h-4 text-yellow-500" />
      case 'ts': return <File className="w-4 h-4 text-blue-600" />
      case 'json': return <File className="w-4 h-4 text-green-500" />
      case 'md': return <File className="w-4 h-4 text-purple-500" />
      case 'zip': return <File className="w-4 h-4 text-orange-500" />
      default: return <File className="w-4 h-4 text-gray-500" />
    }
  }

  useEffect(() => {
    loadFiles()
  }, [currentPath])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex gap-6">
        {/* File Browser */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  File Explorer
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadFiles} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Badge variant="secondary">{currentPath}</Badge>
                </div>
              </div>
              <CardDescription>
                Browse and analyze uploaded files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {currentPath !== '/' && (
                    <div 
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={() => setCurrentPath(currentPath.split('/').slice(0, -2).join('/') || '/')}
                    >
                      <Folder className="w-4 h-4" />
                      <span className="text-sm">..</span>
                    </div>
                  )}
                  
                  {files.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={() => viewFile(file)}
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {file.type === 'directory' ? 'Directory' : formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {file.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {files.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500">
                      <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No files found</p>
                      <p className="text-sm">Upload files using the ZIP upload interface</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* File Content Viewer */}
        <div className="flex-1">
          {selectedFile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {selectedFile.name}
                </CardTitle>
                <CardDescription>
                  {selectedFile.path} • {formatFileSize(selectedFile.size)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <pre className="text-sm bg-gray-50 p-4 rounded overflow-x-auto whitespace-pre-wrap">
                    {fileContent}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
          
          {!selectedFile && (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a file to view its content</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Quick Upload
          </CardTitle>
          <CardDescription>
            Upload files for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              Use the main ZIP upload interface
            </p>
            <p className="text-sm text-gray-500">
              Files will appear here automatically
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}