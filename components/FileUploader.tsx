'use client'

import { useState, useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import Image from 'next/image'
import { UploadCloud, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

type FileUploaderProps = {
  onChange: (files: File[]) => void
  maxSize?: number // in bytes
  acceptedFileTypes?: string[]
}

export function FileUploader({ 
  onChange, 
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedFileTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif']
}: FileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      fileRejections.forEach((file) => {
        file.errors.forEach((err) => {
          if (err.code === 'file-too-large') {
            toast({
              title: 'File too large',
              description: `File size should be less than ${maxSize / (1024 * 1024)}MB`,
              variant: 'destructive',
            })
          } else if (err.code === 'file-invalid-type') {
            toast({
              title: 'Invalid file type',
              description: `Accepted file types: ${acceptedFileTypes.join(', ')}`,
              variant: 'destructive',
            })
          }
        })
      })
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setPreview(URL.createObjectURL(file))
      onChange(acceptedFiles)
    }
  }, [onChange, maxSize, acceptedFileTypes])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: acceptedFileTypes.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    maxSize,
    multiple: false
  })

  return (
    <Card>
      <CardContent>
        <div 
          {...getRootProps()} 
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} aria-label="File upload" />
          {preview ? (
            <div className="relative w-full h-64">
              <Image
                src={preview}
                alt="File preview"
                layout="fill"
                objectFit="contain"
                className="rounded-lg"
              />
              <Button 
                variant="secondary" 
                size="sm" 
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreview(null)
                  onChange([])
                }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <>
              <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-sm text-center mb-2">
                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                SVG, PNG, JPG or GIF (max. {maxSize / (1024 * 1024)}MB)
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
