import React from 'react'
import { FileText, Download, Calendar, Tag, Shield, Compass, Sliders, Layers, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TemplateData } from './TemplateCard'
import { cn } from '@/lib/utils'

interface TemplatePreviewProps {
  template: TemplateData
  onClose: () => void
}

export function TemplatePreview({ template, onClose }: TemplatePreviewProps) {
  const isActiveStatus = template.status === 'Active'
  
  const createdDate = new Date(template.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const updatedDate = new Date(template.updatedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const tagsList = template.tags ? template.tags.split(',').map(t => t.trim()).filter(t => t !== '') : []

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden max-w-5xl mx-auto shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between p-6 border-b border-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-800 truncate max-w-lg">{template.templateName}</h2>
          <p className="text-xs text-slate-400 mt-1">Detailed template overview and configuration specs</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-slate-600">
          <X size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
        {/* Left Col: High-Res Preview Image (8 cols) */}
        <div className="md:col-span-7 bg-slate-50/50 p-6 flex items-center justify-center min-h-[400px] border-r border-slate-50">
          <div className="w-full max-w-md aspect-[3/4] bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden relative group">
            {template.previewImage ? (
              <img src={template.previewImage} alt={template.templateName} className="object-cover w-full h-full" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
                <FileText className="text-slate-300" size={56} />
                <span className="text-xs font-semibold text-slate-400">Preview image not available</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Metadata & Info (5 cols) */}
        <div className="md:col-span-5 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block shadow-sm",
                isActiveStatus 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : "bg-slate-100 text-slate-500 border-slate-200"
              )}>
                {template.status}
              </span>
              <h3 className="text-base font-bold text-slate-800 mt-2">{template.templateName}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{template.companyName}</p>
            </div>

            {template.description && (
              <div className="bg-slate-50 border border-slate-100/40 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{template.description}</p>
              </div>
            )}

            {/* Spec grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
              <div className="flex items-start gap-2">
                <Compass size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Doc Type</span>
                  <span className="text-xs font-semibold text-slate-700">{template.documentType}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Layers size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Category</span>
                  <span className="text-xs font-semibold text-slate-700">{template.category || 'General'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Sliders size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Format Spec</span>
                  <span className="text-xs font-semibold text-slate-700">{template.paperSize} ({template.orientation})</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Shield size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Revision</span>
                  <span className="text-xs font-semibold text-slate-700">v{template.version}</span>
                </div>
              </div>
            </div>

            {/* Date logs */}
            <div className="space-y-2 border-t border-slate-50 pt-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-400" /> Uploaded</span>
                <span className="font-semibold text-slate-700">{createdDate}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-400" /> Last Updated</span>
                <span className="font-semibold text-slate-700">{updatedDate}</span>
              </div>
            </div>

            {/* Tags section */}
            {tagsList.length > 0 && (
              <div className="border-t border-slate-50 pt-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Tag size={10} /> Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {tagsList.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-semibold text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-8 border-t border-slate-50 pt-4">
            <a href={template.originalFile} download={template.templateName} className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-xs font-semibold shadow-blue gap-1.5">
                <Download size={14} /> Download Original File
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
