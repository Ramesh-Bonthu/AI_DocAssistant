'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TemplateForm } from '@/components/templates/TemplateForm'
import { TemplateData } from '@/components/templates/TemplateCard'
import { Loader2 } from 'lucide-react'

export default function EditPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<TemplateData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params?.id
    if (id) {
      fetch(`/api/templates/${id}`)
        .then(res => res.json())
        .then(data => {
          setTemplate(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [params])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="text-sm text-slate-500 font-medium">Loading template specifications...</span>
      </div>
    )
  }

  if (!template || (template as any).error) {
    return (
      <div className="p-12 text-center text-slate-500 font-semibold bg-white border border-slate-100 rounded-3xl max-w-md mx-auto mt-12 shadow-sm">
        Template not found.
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <TemplateForm 
        template={template} 
        onSuccess={() => router.push('/templates')} 
        onCancel={() => router.push('/templates')} 
      />
    </div>
  )
}
