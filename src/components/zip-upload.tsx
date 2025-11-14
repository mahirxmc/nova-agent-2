'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: number
  status: 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

export default function ZipUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return
    }

    const fileArray = Array.from(fileList)
    const zipFiles = fileArray.filter(file => 
      file.type === 'application/zip' || 
      file.type === 'application/x-zip-compressed' ||
      file.name.toLowerCase().endsWith('.zip')
    )

    if (zipFiles.length === 0) {
      alert('Please upload only ZIP files')
      return
    }

    const newFiles: UploadedFile[] = zipFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }))

    setFiles(prev => [...prev, ...newFiles])

    // Upload files sequentially
    zipFiles.forEach((file, index) => {
      uploadFile(file, newFiles[index].id)
    })
  }, [])

  const uploadFile = async (file: File, fileId: string) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, progress: Math.min(f.progress + 15, 90) }
            : f
        ))
      }, 300)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (response.ok) {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'success', progress: 100 }
            : f
        ))
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Upload failed')
      }
    } catch (error) {
      clearInterval(progressInterval)
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed', progress: 0 }
          : f
      ))
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer && e.dataTransfer.files) {
      console.log('Files dropped:', e.dataTransfer.files)
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Files selected:', e.target.files)
    handleFiles(e.target.files)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            ZIP File Upload
          </CardTitle>
          <CardDescription>
            Upload and extract ZIP files with drag and drop support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              Drag & drop ZIP files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Only ZIP files are supported
            </p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'uploading' && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Uploading {file.progress}%
                        </Badge>
                      )}
                      {file.status === 'success' && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Success
                        </Badge>
                      )}
                      {file.status === 'error' && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Error
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="w-full" />
                  )}
                  
                  {file.status === 'error' && file.error && (
                    <p className="text-sm text-red-600 mt-2">{file.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}