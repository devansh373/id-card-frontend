'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud, File, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps extends Omit<DropzoneOptions, 'onDrop'> {
  value?: File[] | null;
  onChange?: (files: File[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  label?: string;
  description?: string;
}

export function FileUpload({
  value,
  onChange,
  maxFiles = 1,
  accept = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
  },
  label = "Upload Image",
  description = "Drag and drop or click to browse",
  ...props
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange?.(acceptedFiles);

      if (acceptedFiles.length > 0) {
        // Create an object URL for image previews
        if (acceptedFiles[0].type.startsWith('image/')) {
          const objectUrl = URL.createObjectURL(acceptedFiles[0]);
          setPreviewUrl(objectUrl);
        }
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept,
    ...props,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.([]);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const hasFile = value && value.length > 0;

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full px-6 py-10 transition-colors border-2 border-dashed rounded-xl cursor-pointer group",
          isDragActive 
            ? "border-emerald-500 bg-emerald-50/50" 
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
          hasFile && "border-indigo-200 bg-indigo-50/30"
        )}
      >
        <input {...getInputProps()} />
        
        {hasFile ? (
          <div className="flex flex-col items-center justify-center gap-3">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={previewUrl} 
                alt="Upload preview" 
                className="object-contain h-32 rounded-md shadow-sm border border-slate-200" 
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <File className="w-8 h-8 text-indigo-500" />
              </div>
            )}
            
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                {value[0].name}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {(value[0].size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              isDragActive ? "bg-emerald-100" : "bg-slate-100 group-hover:bg-slate-200"
            )}>
              {isDragActive ? (
                <UploadCloud className="w-6 h-6 text-emerald-600" />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{label}</p>
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            </div>
          </div>
        )}

        {hasFile && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
