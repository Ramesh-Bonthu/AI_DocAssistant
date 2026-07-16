import React, { useState, useRef } from 'react'
import { Upload, X, FileText, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface TemplateUploadProps {
  onSuccess: (newTemplate?: any) => void
  onCancel: () => void
}

const DOCUMENT_TYPES = [
  'Invoice', 'Quotation', 'Purchase Order', 'Receipt', 
  'Certificate', 'Offer Letter', 'Agreement', 'Custom'
]

const CATEGORIES = [
  'Finance', 'HR', 'Education', 'Career', 'Design', 'General'
]

export function TemplateUpload({ onSuccess, onCancel }: TemplateUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Form Fields State
  const [templateName, setTemplateName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [documentType, setDocumentType] = useState('Invoice')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [tags, setTags] = useState('')
  const [paperSize, setPaperSize] = useState('A4')
  const [orientation, setOrientation] = useState('Portrait')
  const [status, setStatus] = useState('Active')
  const [version, setVersion] = useState('1.0')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (selectedFile: File): boolean => {
    // 20MB limit
    const maxSize = 20 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      toast.error('File size exceeds the 20MB limit')
      return false
    }

    // PDF, PNG, JPG, JPEG extensions
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase()
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg']
    if (!allowed.includes(ext)) {
      toast.error('Unsupported file type. Please upload a PDF, PNG, or JPG/JPEG.')
      return false
    }

    return true
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected && validateFile(selected)) {
      setFile(selected)
      
      // Auto-populate template name from file name (sans extension)
      const nameWithoutExt = selected.name.substring(0, selected.name.lastIndexOf('.'))
      setTemplateName(nameWithoutExt.replace(/[-_]/g, ' '))

      // Create preview for images
      if (selected.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selected))
      } else {
        setFilePreview('')
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const selected = e.dataTransfer.files?.[0]
    if (selected && validateFile(selected)) {
      setFile(selected)
      const nameWithoutExt = selected.name.substring(0, selected.name.lastIndexOf('.'))
      setTemplateName(nameWithoutExt.replace(/[-_]/g, ' '))

      if (selected.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selected))
      } else {
        setFilePreview('')
      }
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setFilePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }
    if (!templateName.trim() || !companyName.trim() || !documentType) {
      toast.error('Please fill in all required fields')
      return
    }

    setUploading(true)
    setProgress(10)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('templateName', templateName)
      formData.append('companyName', companyName)
      formData.append('documentType', documentType)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('tags', tags)
      formData.append('paperSize', paperSize)
      formData.append('orientation', orientation)
      formData.append('status', status)
      formData.append('version', version)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 15
        })
      }, 200)

      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setProgress(100)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload template')
      }

      toast.success('Template uploaded successfully!')
      onSuccess(result)
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload template')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 max-w-4xl mx-auto shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
            <Upload size={18} className="text-blue-600" /> Upload Document Template
          </h2>
          <p className="text-xs text-slate-400 mt-1">Upload a PDF or image template file and set document metadata</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-slate-600">
          <X size={16} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Drag & Drop File Selector */}
        <div className="flex flex-col gap-4">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Template File</Label>
          
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all min-h-[220px] ${
              file 
                ? 'border-blue-200 bg-blue-50/20' 
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />

            {file ? (
              <div className="space-y-4 w-full relative">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFile()
                  }}
                  className="absolute -top-6 -right-4 h-7 w-7 p-0 rounded-full bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 shadow-sm border border-slate-100"
                >
                  <X size={13} />
                </Button>

                {filePreview ? (
                  <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border border-slate-100 shadow-sm relative">
                    <img src={filePreview} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="w-14 h-14 mx-auto bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center">
                    <FileText className="text-blue-500" size={24} />
                  </div>
                )}
                
                <div className="min-w-0 px-4">
                  <p className="text-xs font-semibold text-slate-700 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center mx-auto text-slate-400 group-hover:text-blue-500 transition-colors">
                  <Upload size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Drag & drop your template file here</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Supports PDF, PNG, JPG, JPEG (Max 20MB)</p>
                </div>
              </div>
            )}
          </div>

          {uploading && (
            <div className="space-y-1.5 mt-2 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="animate-spin text-blue-500" size={11} /> Uploading file...
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5 bg-slate-200" />
            </div>
          )}
        </div>

        {/* Right Side: Metadata Information fields */}
        <div className="space-y-4">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Template Metadata</Label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] font-semibold text-slate-500 mb-1 block">Template Name <span className="text-red-500">*</span></Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Corporate Invoice"
                className="text-xs rounded-xl h-9 border-slate-200"
                required
              />
            </div>
            <div>
              <Label className="text-[11px] font-semibold text-slate-500 mb-1 block">Company Name <span className="text-red-500">*</span></Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
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
                placeholder="1.0"
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
                placeholder="GST, Invoice, Premium"
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
              placeholder="Provide a brief description of this template..."
              className="text-xs rounded-xl border-slate-200 resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="col-span-1 md:col-span-2 border-t border-slate-50 pt-4 flex items-center justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={uploading} className="h-10 text-xs font-semibold px-4 rounded-xl border-slate-200">
            Cancel
          </Button>
          <Button type="submit" disabled={uploading} className="h-10 text-xs font-semibold px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-blue gap-1.5">
            {uploading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            Upload and Save
          </Button>
        </div>
      </form>
    </div>
  )
}
