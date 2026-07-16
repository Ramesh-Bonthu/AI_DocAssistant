'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { TemplateUpload } from '@/components/templates/TemplateUpload'

export default function UploadPage() {
  const router = useRouter()
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <TemplateUpload 
        onSuccess={() => router.push('/templates')} 
        onCancel={() => router.push('/templates')} 
      />
    </div>
  )
}
