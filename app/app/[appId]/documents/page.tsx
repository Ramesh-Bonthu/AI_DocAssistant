'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search, Plus, Download, Copy, Pencil, Trash2, MoreHorizontal,
  FileText, Archive, Share2, CheckCircle, FileEdit, Loader2, X, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Completed' },
  draft: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: FileEdit, label: 'Draft' },
  shared: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Share2, label: 'Shared' },
  archived: { color: 'bg-slate-50 text-slate-600 border-slate-200', icon: Archive, label: 'Archived' },
}

const TYPE_LABELS: Record<string, string> = {
  invoice: 'Invoice',
  'offer-letter': 'Offer Letter',
  'hr-documents': 'HR Document',
  certificates: 'Certificate',
  'resume-analyzer': 'Resume Analysis',
  'experience-letter': 'Experience Letter',
  'appointment-letter': 'Appointment Letter',
  'salary-slip': 'Salary Slip',
}

const TYPE_COLORS: Record<string, string> = {
  invoice: 'bg-blue-50 text-blue-600',
  'offer-letter': 'bg-emerald-50 text-emerald-600',
  'hr-documents': 'bg-violet-50 text-violet-600',
  certificates: 'bg-rose-50 text-rose-600',
}

interface DocumentItem {
  id: string
  title: string
  client: string
  status: 'draft' | 'completed' | 'shared' | 'archived'
  updatedAt: string
  pages: number
  size: string
  type: string
}

export default function DocumentsPage() {
  const params = useParams()
  const appId = params?.appId as string

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'completed' | 'shared' | 'archived'>('all')
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)

  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editClientName, setEditClientName] = useState('')
  const [editStatus, setEditStatus] = useState<'draft' | 'completed' | 'shared' | 'archived'>('draft')
  const [updating, setUpdating] = useState(false)
  const [editErrorMsg, setEditErrorMsg] = useState('')

  const handleEditClick = (doc: DocumentItem) => {
    setEditingDoc(doc)
    setEditTitle(doc.title)
    setEditClientName(doc.client)
    setEditStatus(doc.status)
    setShowEditModal(true)
  }

  const handleUpdateDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDoc) return
    if (!editTitle.trim() || !editClientName.trim()) {
      setEditErrorMsg('Title and Client are required')
      return
    }
    setEditErrorMsg('')
    setUpdating(true)

    try {
      const res = await fetch(`/api/app/${appId}/documents?id=${editingDoc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          client: editClientName.trim(),
          status: editStatus,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update document')
      }

      const updated = await res.json()
      setDocs((prev) => prev.map((d) => d.id === editingDoc.id ? { ...d, ...updated } : d))
      setShowEditModal(false)
      setEditingDoc(null)
    } catch (err: any) {
      setEditErrorMsg(err.message || 'An error occurred')
    } finally {
      setUpdating(false)
    }
  }


  useEffect(() => {
    if (!appId) return
    
    setLoading(true)
    fetch(`/api/app/${appId}/documents`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch documents')
        return res.json()
      })
      .then((data) => {
        setDocs(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [appId])

  const deleteDoc = async (id: string) => {
    try {
      const res = await fetch(`/api/app/${appId}/documents?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== id))
      } else {
        console.error('Failed to delete document from database')
      }
    } catch (err) {
      console.error('Error deleting document:', err)
    }
  }

  const tabs = [
    { key: 'all', label: 'All Documents', count: docs.length },
    { key: 'completed', label: 'Completed', count: docs.filter((d) => d.status === 'completed').length },
    { key: 'draft', label: 'Drafts', count: docs.filter((d) => d.status === 'draft').length },
    { key: 'shared', label: 'Shared', count: docs.filter((d) => d.status === 'shared').length },
    { key: 'archived', label: 'Archived', count: docs.filter((d) => d.status === 'archived').length },
  ]

  const filtered = docs.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.client.toLowerCase().includes(search.toLowerCase())
    const matchTab = activeTab === 'all' || d.status === activeTab
    return matchSearch && matchTab
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading documents...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-sm text-slate-500 mt-0.5">{docs.length} total documents in your workspace</p>
        </div>
        <Link href={`/app/${appId}/editor`}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 shadow-blue">
            <Plus size={15} className="mr-1.5" /> New Document
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all', activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
            {tab.label} <span className={cn('ml-1.5 text-xs', activeTab === tab.key ? 'text-blue-600' : 'text-slate-400')}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents..." className="pl-9 h-9 rounded-xl border-slate-200 text-sm" />
      </div>

      {/* Documents table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <span>Document</span><span>Client</span><span>Status</span><span>Updated</span><span>Actions</span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="text-slate-400" size={20} />
            </div>
            <p className="text-slate-500 font-medium text-sm">No documents found</p>
          </div>
        ) : (
          filtered.map((doc, i) => {
            const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.draft
            const StatusIcon = status.icon
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="grid grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 px-5 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', TYPE_COLORS[doc.type] || 'bg-slate-50 text-slate-500')}>
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{TYPE_LABELS[doc.type] || doc.type} · {doc.pages} page{doc.pages > 1 ? 's' : ''} · {doc.size}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 truncate">{doc.client}</p>
                <span>
                  <Badge className={cn('text-xs border', status.color)}>
                    <StatusIcon size={10} className="mr-1" /> {status.label}
                  </Badge>
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap">{doc.updatedAt}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal size={15} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl w-44">
                    <Link href={`/app/${appId}/editor`}>
                      <DropdownMenuItem className="text-sm rounded-lg">
                        <FileEdit size={14} className="mr-2" /> Edit Content
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="text-sm rounded-lg" onClick={() => handleEditClick(doc)}>
                      <Pencil size={14} className="mr-2" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm rounded-lg">
                      <Download size={14} className="mr-2" /> Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm rounded-lg">
                      <Copy size={14} className="mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm rounded-lg">
                      <Share2 size={14} className="mr-2" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-sm text-red-600 rounded-lg" onClick={() => deleteDoc(doc.id)}>
                      <Trash2 size={14} className="mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Pagination hint */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Showing {filtered.length} of {docs.length} documents</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button key={p} className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-colors', p === 1 ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600')}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      <Dialog open={showEditModal} onOpenChange={(open) => {
        setShowEditModal(open)
        if (!open) {
          setEditingDoc(null)
          setEditErrorMsg('')
        }
      }}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Document Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateDocument} className="space-y-4 mt-2">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Document Title *</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Document Title"
                className="rounded-xl"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Client / Candidate Name *</Label>
              <Input
                value={editClientName}
                onChange={(e) => setEditClientName(e.target.value)}
                placeholder="Client Name"
                className="rounded-xl"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Status</Label>
              <Select value={editStatus} onValueChange={(v: any) => setEditStatus(v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editErrorMsg && (
              <p className="text-xs font-semibold text-red-500">{editErrorMsg}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={updating} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 shadow-blue">
                {updating ? 'Saving...' : (
                  <>
                    <Check size={15} className="mr-1.5" /> Save Changes
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setEditingDoc(null); }} className="flex-1 rounded-xl h-10 border-slate-200">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
