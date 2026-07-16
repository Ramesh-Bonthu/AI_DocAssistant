import React from 'react'
import { TemplateCard, TemplateData } from './TemplateCard'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TemplateGridProps {
  templates: TemplateData[]
  viewMode: 'grid' | 'list'
  onOpen: (template: TemplateData) => void
  onEdit: (template: TemplateData) => void
  onDuplicate: (template: TemplateData) => void
  onDelete: (template: TemplateData) => void
  onCardClick: (template: TemplateData) => void
  onUploadClick: () => void
}

export function TemplateGrid({
  templates = [],
  viewMode,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
  onCardClick,
  onUploadClick
}: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-slate-200 rounded-3xl min-h-[350px] shadow-sm">
        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <FileText className="text-slate-400" size={22} />
        </div>
        <h3 className="font-semibold text-slate-800 text-base">No Templates Found</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1.5 leading-relaxed">
          Get started by uploading your company document templates to manage them and automate generation.
        </p>
        <Button onClick={onUploadClick} className="mt-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-4 h-9 shadow-blue">
          <Plus size={14} className="mr-1" /> Upload Template
        </Button>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-3 w-full">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onOpen={onOpen}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onCardClick={onCardClick}
            viewMode="list"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onOpen={onOpen}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onCardClick={onCardClick}
          viewMode="grid"
        />
      ))}
      {/* Add New Template Placeholder Card */}
      <div 
        onClick={onUploadClick}
        className="flex flex-col bg-slate-50/40 rounded-2xl border-2 border-dashed border-slate-300/80 items-center justify-center p-6 min-h-[260px] cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-sm transition-all group gap-3"
      >
        <div className="w-10 h-10 bg-slate-100/80 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
          <Plus className="text-slate-500 group-hover:text-blue-600" size={20} />
        </div>
        <span className="text-sm text-slate-600 group-hover:text-blue-600 font-semibold transition-colors">Add New Template</span>
      </div>
    </div>
  )
}
