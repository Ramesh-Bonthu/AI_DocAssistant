'use client'

// Force rebuild to sync subcomponents
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TemplateToolbar } from '@/components/templates/TemplateToolbar'
import { FilterPanel } from '@/components/templates/FilterPanel'
import { TemplateGrid } from '@/components/templates/TemplateGrid'
import { TemplateUpload } from '@/components/templates/TemplateUpload'
import { TemplateForm } from '@/components/templates/TemplateForm'
import { TemplatePreview } from '@/components/templates/TemplatePreview'
import { TemplateData } from '@/components/templates/TemplateCard'
import { toast } from 'sonner'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TemplatesDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectForApp = searchParams.get('selectForApp')
  
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [docTypeFilter, setDocTypeFilter] = useState('ALL')
  const [companyFilter, setCompanyFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('newest')

  // Modals & Panels State
  const [activePanel, setActivePanel] = useState<'none' | 'upload' | 'edit' | 'preview'>('none')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null)
  
  // Delete Dialog State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<TemplateData | null>(null)
  const [deleting, setDeleting] = useState(false)

  // List of unique companies from templates
  const [companies, setCompanies] = useState<string[]>([])

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectForApp) params.append('appId', selectForApp)
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter)
      if (docTypeFilter !== 'ALL') params.append('documentType', docTypeFilter)
      if (companyFilter !== 'ALL') params.append('companyName', companyFilter)
      params.append('sortBy', sortBy)

      const response = await fetch(`/api/templates?${params.toString()}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch templates')
      }
      
      setTemplates(data)

      // Dynamically extract unique company names if it's the initial load
      if (!searchQuery && statusFilter === 'ALL' && categoryFilter === 'ALL' && docTypeFilter === 'ALL' && companyFilter === 'ALL') {
        const uniqueCompanies = Array.from(new Set(data.map((t: TemplateData) => t.companyName))) as string[]
        setCompanies(uniqueCompanies.filter(Boolean))
      }
    } catch (err: any) {
      toast.error(err.message || 'Error connecting to database')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter, categoryFilter, docTypeFilter, companyFilter, sortBy])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Duplication Handler
  const handleDuplicate = async (template: TemplateData) => {
    try {
      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          duplicateFromId: template.id
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to duplicate template')
      }

      toast.success(`Duplicated "${template.templateName}" successfully!`)
      fetchTemplates()
    } catch (err: any) {
      toast.error(err.message || 'Error duplicating template')
    }
  }

  // Deletion Handler
  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/templates/${templateToDelete.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete template')
      }

      toast.success(`Deleted "${templateToDelete.templateName}" template`)
      setShowDeleteConfirm(false)
      setTemplateToDelete(null)
      fetchTemplates()
    } catch (err: any) {
      toast.error(err.message || 'Error deleting template')
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteDialog = (template: TemplateData) => {
    setTemplateToDelete(template)
    setShowDeleteConfirm(true)
  }

  const handleCardClick = (template: TemplateData) => {
    const docTypeLower = template.documentType.toLowerCase()
    let targetAppId = 'invoice'
    
    if (docTypeLower.includes('invoice')) {
      targetAppId = 'invoice'
    } else if (docTypeLower.includes('offer') || docTypeLower.includes('letter')) {
      targetAppId = 'offer-letter'
    } else if (docTypeLower.includes('certificate')) {
      targetAppId = 'certificates'
    } else if (docTypeLower.includes('resume')) {
      targetAppId = 'resume-analyzer'
    } else if (docTypeLower.includes('receipt')) {
      targetAppId = 'salary-slip'
    } else if (docTypeLower.includes('quotation')) {
      targetAppId = 'invoice'
    } else if (docTypeLower.includes('purchase') || docTypeLower.includes('order')) {
      targetAppId = 'invoice'
    }

    router.push(`/app/${targetAppId}/editor?templateId=${template.id}`)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Template Library</h1>
          <p className="text-sm text-slate-500 mt-1">Upload, search, filter, and manage document template models dynamically</p>
        </div>
      </div>

      {/* Main flow switches */}
      {activePanel === 'upload' && (
        <TemplateUpload
          onSuccess={(newTemplate) => {
            setActivePanel('none')
            if (selectForApp && newTemplate && newTemplate.id) {
              router.push(`/app/${selectForApp}/editor?templateId=${newTemplate.id}`)
            } else {
              fetchTemplates()
            }
          }}
          onCancel={() => setActivePanel('none')}
        />
      )}

      {activePanel === 'edit' && selectedTemplate && (
        <TemplateForm
          template={selectedTemplate}
          onSuccess={() => {
            setActivePanel('none')
            setSelectedTemplate(null)
            fetchTemplates()
          }}
          onCancel={() => {
            setActivePanel('none')
            setSelectedTemplate(null)
          }}
        />
      )}

      {activePanel === 'preview' && selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          onClose={() => {
            setActivePanel('none')
            setSelectedTemplate(null)
          }}
        />
      )}

      {/* Grid Dashboard View */}
      {activePanel === 'none' && (
        <div className="space-y-4">
          <TemplateToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onUploadClick={() => setActivePanel('upload')}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />

          {showFilters && (
            <FilterPanel
              status={statusFilter}
              onStatusChange={setStatusFilter}
              category={categoryFilter}
              onCategoryChange={setCategoryFilter}
              documentType={docTypeFilter}
              onDocumentTypeChange={setDocTypeFilter}
              companyName={companyFilter}
              onCompanyChange={setCompanyFilter}
              companies={companies}
            />
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-2.5">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <span className="text-sm font-semibold text-slate-500">Querying template models...</span>
            </div>
          ) : (
            <TemplateGrid
              templates={templates}
              viewMode={viewMode}
              onOpen={(t) => {
                setSelectedTemplate(t)
                setActivePanel('preview')
              }}
              onEdit={(t) => {
                setSelectedTemplate(t)
                setActivePanel('edit')
              }}
              onDuplicate={handleDuplicate}
              onDelete={openDeleteDialog}
              onCardClick={handleCardClick}
              onUploadClick={() => setActivePanel('upload')}
            />
          )}
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && templateToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 max-w-md w-full shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 flex-shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Delete Template?</h3>
                <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to permanently delete the template <strong>"{templateToDelete.templateName}"</strong>? This will remove its metadata and files.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
              <Button variant="outline" disabled={deleting} onClick={() => {
                setShowDeleteConfirm(false)
                setTemplateToDelete(null)
              }} className="h-9 text-xs font-semibold px-4 rounded-xl border-slate-200">
                Cancel
              </Button>
              <Button disabled={deleting} onClick={handleDeleteConfirm} className="h-9 text-xs font-semibold px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm">
                {deleting ? <Loader2 className="animate-spin mr-1" size={13} /> : null}
                Yes, Delete Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
