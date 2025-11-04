import React, { useState } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUploaded?: (file: any) => void;
}

export function FileUpload({ isOpen, onClose, onFileUploaded }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatus('idle');
      setError('');
      setExtractedText('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setStatus('uploading');
    setError('');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        // Call process-file edge function
        const { data, error: uploadError } = await supabase.functions.invoke('process-file', {
          body: {
            fileData: base64Data,
            fileName: selectedFile.name,
            mimeType: selectedFile.type,
            userId: user.id,
          },
        });

        if (uploadError) throw uploadError;

        setStatus('success');
        setExtractedText(data?.data?.extractedText || '');
        
        if (onFileUploaded) {
          onFileUploaded(data?.data?.file);
        }

        setTimeout(() => {
          onClose();
          setSelectedFile(null);
          setStatus('idle');
        }, 2000);
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      console.error('Upload error:', err);
      setStatus('error');
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setStatus('idle');
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold mb-6">Upload File</h2>

        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:border-blue-400 transition-colors"
        >
          {selectedFile ? (
            <div className="space-y-3">
              <File className="w-12 h-12 text-blue-600 mx-auto" />
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-600">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-gray-600">Drag and drop a file here, or click to select</p>
              <p className="text-xs text-gray-500">
                Supported: PDF, DOCX, TXT, CSV, XLSX, Images (Max 10MB)
              </p>
            </div>
          )}

          <input
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.docx,.txt,.csv,.xlsx,.jpg,.jpeg,.png,.gif"
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-block mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm font-medium"
          >
            Select File
          </label>
        </div>

        {status === 'uploading' && (
          <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
            <span>Uploading and processing...</span>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>File uploaded successfully!</span>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {extractedText && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-40 overflow-y-auto">
            <p className="text-xs font-medium text-gray-700 mb-2">Extracted Text:</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{extractedText}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || status === 'success'}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
