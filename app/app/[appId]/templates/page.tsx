'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Star, ArrowRight, Layout, Receipt, FileText,
  Award, UserCircle, HelpCircle, Users, Loader2, Plus, X, Trash2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const TYPE_ICONS: Record<string, React.ElementType> = {
  invoice: Receipt,
  'offer-letter': FileText,
  'hr-documents': Users,
  'question-generator': HelpCircle,
  certificates: Award,
  'resume-builder': UserCircle,
}

const GRADIENT_PREVIEWS: Record<string, string> = {
  invoice: 'from-blue-400 to-blue-600',
  'offer-letter': 'from-emerald-400 to-emerald-600',
  'hr-documents': 'from-violet-400 to-violet-600',
  'question-generator': 'from-amber-400 to-orange-500',
  certificates: 'from-rose-400 to-red-600',
  'resume-builder': 'from-cyan-400 to-cyan-600',
}

interface TemplateItem {
  id: string
  name: string
  type: string
  description: string
  preview: string
  usageCount: number
  isFavorite: boolean
  tags: string[]
}

export default function TemplatesPage() {
  const params = useParams()
  const appId = params?.appId as string

  const [userRole, setUserRole] = useState<string>('Super Admin')

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (role) setUserRole(role)
  }, [])

  const [search, setSearch] = useState('')
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const [showAddModal, setShowAddModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDesc, setNewTemplateDesc] = useState('')
  const [newTemplateTags, setNewTemplateTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTemplateName.trim() || !newTemplateDesc.trim()) {
      setErrorMsg('Name and description are required')
      return
    }
    setErrorMsg('')
    setSaving(true)

    try {
      const res = await fetch(`/api/app/${appId}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTemplateName.trim(),
          description: newTemplateDesc.trim(),
          tags: newTemplateTags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create template')
      }

      const created = await res.json()
      // Wrap single tags string back to array if it comes as comma-separated string from DB
      const formatted = {
        ...created,
        tags: typeof created.tags === 'string' ? created.tags.split(',') : (created.tags || [])
      }
      setTemplates((prev) => [...prev, formatted])
      setShowAddModal(false)
      setNewTemplateName('')
      setNewTemplateDesc('')
      setNewTemplateTags('')
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (userRole === 'Users') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-2">
          <Layout size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          You do not have the required permissions to view the templates database. Please contact an Admin if you believe this is an error.
        </p>
      </div>
    )
  }

  useEffect(() => {
    if (!appId) return
    
    setLoading(true)
    fetch(`/api/app/${appId}/templates`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch templates')
        return res.json()
      })
      .then((data: TemplateItem[]) => {
        setTemplates(data)
        setFavorites(new Set(data.filter((t) => t.isFavorite).map((t) => t.id)))
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [appId])

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const res = await fetch(`/api/app/${appId}/templates/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete template')
      }

      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete template')
    }
  }

  const filtered = templates.filter((t) => {
    const q = search.toLowerCase()
    return t.name.toLowerCase().includes(q) || 
           t.description.toLowerCase().includes(q) || 
           t.tags.some((tag) => tag.toLowerCase().includes(q))
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading templates...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
          <p className="text-sm text-slate-500 mt-0.5">{templates.length} templates available for this application</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." className="pl-9 h-9 rounded-xl border-slate-200 text-sm" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((template, i) => {
          const Icon = TYPE_ICONS[template.type] || FileText
          const gradient = GRADIENT_PREVIEWS[template.type] || 'from-blue-400 to-blue-600'
          const isFav = favorites.has(template.id)
          return (
            <motion.div key={template.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all hover:-translate-y-0.5 group">
              {/* Preview */}
              <div className={`bg-gradient-to-br ${gradient} h-32 relative flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10" />
                <div className="relative bg-white/95 rounded-lg p-3 w-24 shadow-lg">
                  <div className="h-1.5 w-16 bg-slate-200 rounded mb-1.5" />
                  <div className="h-1 w-12 bg-slate-100 rounded mb-2" />
                  <div className="space-y-0.5">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-0.5 bg-slate-100 rounded" style={{ width: `${80 - j * 10}%` }} />
                    ))}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id) }}
                  className="absolute top-3 left-3 w-7 h-7 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                  title="Delete template"
                >
                  <Trash2 size={13} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFav(template.id) }}
                  className="absolute top-3 right-3 w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                >
                  <Star size={13} className={isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-400'} />
                </button>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1.5">
                  <h3 className="text-sm font-semibold text-slate-900 leading-tight">{template.name}</h3>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{template.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{template.usageCount.toLocaleString()} uses</span>
                  <Link href={`/app/${appId}/editor`}>
                    <Button size="sm" className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                      Use Template <ArrowRight size={11} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )
        })}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 rounded-2xl flex flex-col items-center justify-center p-5 min-h-[260px] transition-all group cursor-pointer"
          onClick={() => setShowAddModal(true)}
        >
          <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center transition-colors">
            <Plus className="text-slate-400 group-hover:text-blue-600" size={24} />
          </div>
          <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors mt-3">Add New Template</p>
          <p className="text-xs text-slate-400 text-center max-w-[160px] mt-1">Create a new document template</p>
        </motion.div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Layout className="text-slate-400" size={22} />
          </div>
          <p className="text-slate-500 font-medium">No templates found</p>
          <p className="text-sm text-slate-400 mt-1">Try a different search term</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md p-6 overflow-hidden z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Add New Template</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTemplate} className="space-y-4">
                {errorMsg && (
                  <p className="text-xs font-semibold text-red-500 bg-red-50 p-2.5 rounded-lg border border-red-100">
                    {errorMsg}
                  </p>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Template Name</label>
                  <Input
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g. HPS Official Internship Letter"
                    className="rounded-xl border-slate-200 text-sm h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Description</label>
                  <textarea
                    value={newTemplateDesc}
                    onChange={(e) => setNewTemplateDesc(e.target.value)}
                    placeholder="Describe what this template is used for..."
                    className="w-full min-h-[80px] rounded-xl border border-slate-200 p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Tags (comma-separated)</label>
                  <Input
                    value={newTemplateTags}
                    onChange={(e) => setNewTemplateTags(e.target.value)}
                    placeholder="e.g. Internship, SDE, HPS"
                    className="rounded-xl border-slate-200 text-sm h-10"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl text-slate-600 hover:bg-slate-50 text-sm h-10 px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm h-10 px-4"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Template'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
