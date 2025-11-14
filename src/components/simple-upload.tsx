'use client'

import { useState, useRef } from 'react'

export default function SimpleUpload() {
  const [status, setStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setStatus('❌ Only ZIP files allowed')
      return
    }

    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setStatus('⬆️ Uploading...')
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setStatus(`✅ Success! ${result.extractedFiles} files extracted`)
      } else {
        setStatus('❌ Upload failed')
      }
    } catch (error) {
      setStatus('❌ Upload error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">📁 Upload ZIP File</h1>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 text-lg font-medium"
          >
            📂 Choose ZIP File
          </button>
        </div>

        {status && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-lg">{status}</p>
          </div>
        )}

        <div className="mt-6 text-center text-gray-600">
          <p className="text-sm">1. Click button to select ZIP file</p>
          <p className="text-sm">2. File will be uploaded and extracted</p>
          <p className="text-sm">3. I can then analyze the contents</p>
        </div>
      </div>
    </div>
  )
}