import React from 'react'
import { Eye, Edit3, Copy, Trash2, Calendar, FileText, Badge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TemplateData {
  id: string
  templateName: string
  companyName: string
  documentType: string
  description?: string
  category?: string
  tags?: string
  paperSize: string
  orientation: string
  originalFile: string
  previewImage?: string
  status: string
  version: string
  createdAt: string
  updatedAt: string
}

interface TemplateCardProps {
  template: TemplateData
  onOpen: (template: TemplateData) => void
  onEdit: (template: TemplateData) => void
  onDuplicate: (template: TemplateData) => void
  onDelete: (template: TemplateData) => void
  onCardClick?: (template: TemplateData) => void
  viewMode: 'grid' | 'list'
}

export function TemplateCard({
  template,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
  onCardClick,
  viewMode
}: TemplateCardProps) {
  const isActiveStatus = template.status === 'Active'
  const formattedDate = new Date(template.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  if (viewMode === 'list') {
    return (
      <div 
        onClick={() => onCardClick?.(template)}
        className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all gap-4 w-full cursor-pointer"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden relative flex items-center justify-center">
            {template.previewImage ? (
              <img src={template.previewImage} alt={template.templateName} className="object-cover w-full h-full" />
            ) : (
              <FileText className="text-slate-400" size={24} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-800 truncate text-sm">{template.templateName}</h3>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                isActiveStatus 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : "bg-slate-100 text-slate-500 border-slate-200"
              )}>
                {template.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{template.companyName} • {template.documentType}</p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
              <span className="flex items-center gap-1"><Calendar size={12} /> Created: {formattedDate}</span>
              <span>v{template.version}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end md:self-center">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 rounded-xl" onClick={(e) => { e.stopPropagation(); onOpen(template); }} title="Open">
            <Eye size={15} />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 rounded-xl" onClick={(e) => { e.stopPropagation(); onEdit(template); }} title="Edit">
            <Edit3 size={15} />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 rounded-xl" onClick={(e) => { e.stopPropagation(); onDuplicate(template); }} title="Duplicate">
            <Copy size={15} />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 rounded-xl" onClick={(e) => { e.stopPropagation(); onDelete(template); }} title="Delete">
            <Trash2 size={15} />
          </Button>
        </div>
      </div>
    )
  }

  // Grid view card design
  return (
    <div 
      onClick={() => onCardClick?.(template)}
      className="flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-slate-200/60 transition-all cursor-pointer"
    >
      {/* Thumbnail area */}
      <div className="aspect-[4/3] bg-slate-50 relative flex items-center justify-center overflow-hidden border-b border-slate-50">
        {template.previewImage ? (
          <img src={template.previewImage} alt={template.templateName} className="object-cover w-full h-full hover:scale-102 transition-transform duration-200" />
        ) : (
          <FileText className="text-slate-400" size={32} />
        )}
        <span className={cn(
          "absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm border",
          isActiveStatus 
            ? "bg-emerald-500 text-white border-transparent" 
            : "bg-slate-400 text-white border-transparent"
        )}>
          {template.status}
        </span>
        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-slate-900/70 text-white rounded text-[9px] font-semibold">
          {template.paperSize} • {template.orientation}
        </span>
      </div>

      {/* Info area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{template.documentType}</span>
            <span className="text-[10px] text-slate-400 font-medium">v{template.version}</span>
          </div>
          <h3 className="font-semibold text-slate-800 truncate text-sm mt-1" title={template.templateName}>
            {template.templateName}
          </h3>
          <p className="text-xs text-slate-500 truncate mt-0.5">{template.companyName}</p>
          {template.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed h-8">
              {template.description}
            </p>
          )}
        </div>

        <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Calendar size={11} /> {formattedDate}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 rounded-lg" onClick={(e) => { e.stopPropagation(); onOpen(template); }} title="Open">
              <Eye size={14} />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 rounded-lg" onClick={(e) => { e.stopPropagation(); onEdit(template); }} title="Edit">
              <Edit3 size={14} />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 rounded-lg" onClick={(e) => { e.stopPropagation(); onDuplicate(template); }} title="Duplicate">
              <Copy size={14} />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-500 hover:text-red-600 rounded-lg" onClick={(e) => { e.stopPropagation(); onDelete(template); }} title="Delete">
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
