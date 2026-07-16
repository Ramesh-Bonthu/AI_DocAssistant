import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface FilterPanelProps {
  status: string
  onStatusChange: (val: string) => void
  category: string
  onCategoryChange: (val: string) => void
  documentType: string
  onDocumentTypeChange: (val: string) => void
  companyName: string
  onCompanyChange: (val: string) => void
  companies: string[]
}

const DOCUMENT_TYPES = [
  'Invoice', 'Quotation', 'Purchase Order', 'Receipt', 
  'Certificate', 'Offer Letter', 'Agreement', 'Custom'
]

const CATEGORIES = [
  'Finance', 'HR', 'Education', 'Career', 'Design', 'General'
]

export function FilterPanel({
  status, onStatusChange,
  category, onCategoryChange,
  documentType, onDocumentTypeChange,
  companyName, onCompanyChange,
  companies = []
}: FilterPanelProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
      <div>
        <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Status</Label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="bg-white border-slate-200 h-9 rounded-xl text-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Document Type</Label>
        <Select value={documentType} onValueChange={onDocumentTypeChange}>
          <SelectTrigger className="bg-white border-slate-200 h-9 rounded-xl text-xs">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {DOCUMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Category</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="bg-white border-slate-200 h-9 rounded-xl text-xs">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Company</Label>
        <Select value={companyName} onValueChange={onCompanyChange}>
          <SelectTrigger className="bg-white border-slate-200 h-9 rounded-xl text-xs">
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Companies</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company} value={company}>{company}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
