'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search, Star, ArrowRight, Layout, Receipt, FileText,
  Award, UserCircle, HelpCircle, Users, Loader2
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
    </div>
  )
}
