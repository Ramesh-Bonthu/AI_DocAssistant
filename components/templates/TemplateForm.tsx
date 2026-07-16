import React, { useState } from 'react'
import { Edit3, X, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { TemplateData } from './TemplateCard'

interface TemplateFormProps {
  template: TemplateData
  onSuccess: () => void
  onCancel: () => void
}

const DOCUMENT_TYPES = [
  'Invoice', 'Quotation', 'Purchase Order', 'Receipt', 
  'Certificate', 'Offer Letter', 'Agreement', 'Custom'
]

const CATEGORIES = [
  'Finance', 'HR', 'Education', 'Career', 'Design', 'General'
]

export function TemplateForm({ template, onSuccess, onCancel }: TemplateFormProps) {
  const [submitting, setSubmitting] = useState(false)

  // Fields state pre-populated with active record values
  const [templateName, setTemplateName] = useState(template.templateName)
  const [companyName, setCompanyName] = useState(template.companyName)
  const [documentType, setDocumentType] = useState(template.documentType)
  const [description, setDescription] = useState(template.description || '')
  const [category, setCategory] = useState(template.category || 'General')
  const [tags, setTags] = useState(template.tags || '')
  const [paperSize, setPaperSize] = useState(template.paperSize || 'A4')
  const [orientation, setOrientation] = useState(template.orientation || 'Portrait')
  const [status, setStatus] = useState(template.status || 'Active')
  const [version, setVersion] = useState(template.version || '1.0')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!templateName.trim() || !companyName.trim() || !documentType) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateName,
          companyName,
          documentType,
          description,
          category,
          tags,
          paperSize,
          orientation,
          status,
          version
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update template metadata')
      }

      toast.success('Template updated successfully!')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update template metadata')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 max-w-2xl mx-auto shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
            <Edit3 size={18} className="text-blue-600" /> Edit Template Metadata
          </h2>
          <p className="text-xs text-slate-400 mt-1">Update template description, paper sizes, and deployment statuses</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-slate-600">
          <X size={16} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] font-semibold text-slate-500 mb-1 block">Template Name <span className="text-red-500">*</span></Label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-xs rounded-xl h-9 border-slate-200"
              required
            />
          </div>
          <div>
            <Label className="text-[11px] font-semibold text-slate-500 mb-1 block">Company Name <span className="text-red-500">*</span></Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="text-xs rounded-xl h-9 border-slate-200"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] font-semibold text-slate-500 mb-1 block">Document Type <span className="text-red-500">*</span></Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="border-slate-200 h-9 rounded-xl text-xs bg-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] font-semibold text-slate-500 mb-1 block">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-slate-200 h-9 rounded-xl text-xs bg-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-[11px] font-semibold text-slate-500 mb-1 block">Paper Size</Label>
            <Select value={paperSize} onValueChange={setPaperSize}>
              <SelectTrigger className="border-slate-200 h-9 rounded-xl text-xs bg-white">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] font-semibold text-slate-500 mb-1 block">Orientation</Label>
            <Select value={orientation} onValueChange={setOrientation}>
              <SelectTrigger className="border-slate-200 h-9 rounded-xl text-xs bg-white">
                <SelectValue placeholder="Orientation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Portrait">Portrait</SelectItem>
                <SelectItem value="Landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] font-semibold text-slate-500 mb-1 block">Version</Label>
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="text-xs rounded-xl h-9 border-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] font-semibold text-slate-500 mb-1 block">Tags (comma-separated)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="text-xs rounded-xl h-9 border-slate-200"
            />
          </div>
          <div>
            <Label className="text-[11px] font-semibold text-slate-500 mb-1 block">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="border-slate-200 h-9 rounded-xl text-xs bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-[11px] font-semibold text-slate-500 mb-1 block">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-xs rounded-xl border-slate-200 resize-none"
            rows={3}
          />
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-50 pt-4 flex items-center justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting} className="h-10 text-xs font-semibold px-4 rounded-xl border-slate-200">
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="h-10 text-xs font-semibold px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-blue gap-1.5">
            {submitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
