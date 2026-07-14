'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, RotateCcw, GitBranch, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const VERSIONS = [
  { id: 'v5', label: 'Version 5', tag: 'Current', time: '2 hours ago', author: 'Ajay Kumar', changes: 'Updated payment terms, added discount field', color: 'bg-blue-600' },
  { id: 'v4', label: 'Version 4', tag: null, time: 'Yesterday, 4:30 PM', author: 'Ajay Kumar', changes: 'Added company logo, changed font to Inter', color: 'bg-slate-400' },
  { id: 'v3', label: 'Version 3', tag: null, time: 'Yesterday, 11:00 AM', author: 'Ajay Kumar', changes: 'Fixed GST calculation for IGST', color: 'bg-slate-400' },
  { id: 'v2', label: 'Version 2', tag: null, time: '2 days ago', author: 'Ajay Kumar', changes: 'Initial design changes, updated template', color: 'bg-slate-400' },
  { id: 'v1', label: 'Version 1', tag: 'Original', time: '3 days ago', author: 'Ajay Kumar', changes: 'Document created from template', color: 'bg-slate-300' },
]

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-blue-50 text-blue-600 border-blue-100',
  edit: 'bg-amber-50 text-amber-600 border-amber-100',
  download: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  share: 'bg-violet-50 text-violet-600 border-violet-100',
  delete: 'bg-red-50 text-red-600 border-red-100',
}

interface HistoryItem {
  id: string
  action: string
  document: string
  client: string
  time: string
  type: string
}

export default function HistoryPage() {
  const params = useParams()
  const appId = params?.appId as string

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!appId) return

    setLoading(true)
    fetch(`/api/app/${appId}/history`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch history')
        return res.json()
      })
      .then((data) => {
        setHistory(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [appId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading history logs...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">History</h1>
        <p className="text-sm text-slate-500 mt-0.5">Version history and activity log for your documents</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Version history */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-5">
            <GitBranch className="text-blue-600" size={18} />
            <h2 className="text-base font-semibold text-slate-900">Version History</h2>
            <Badge className="ml-auto text-xs bg-slate-50 text-slate-600 border-slate-200">Active Document</Badge>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100" />
            <div className="space-y-4">
              {VERSIONS.map((v, i) => (
                <motion.div key={v.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="relative flex gap-4 pl-10">
                  <div className={`absolute left-2.5 top-2 w-3 h-3 rounded-full ${v.color} flex-shrink-0 ring-2 ring-white`} />
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{v.label}</span>
                        {v.tag && (
                          <Badge className={cn('text-xs', v.tag === 'Current' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-200 text-slate-600 border-slate-200')}>
                            {v.tag}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{v.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{v.changes}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{v.author}</span>
                      {v.tag !== 'Current' && (
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-50">
                          <RotateCcw size={11} className="mr-1" /> Restore
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
            <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs border-slate-200">
              <Eye size={13} className="mr-1.5" /> Compare Versions
            </Button>
            <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs border-slate-200">
              <GitBranch size={13} className="mr-1.5" /> Branch Version
            </Button>
          </div>
        </motion.div>

        {/* Activity log */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="text-slate-500" size={18} />
            <h2 className="text-base font-semibold text-slate-900">Activity Timeline</h2>
          </div>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-100" />
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No recent activities in this workspace</p>
            ) : (
              history.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="relative flex gap-4 pl-4 group">
                  <div className="absolute left-[-18.5px] top-1.5 w-2 h-2 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors" />
                  <div className="flex-1 flex items-start justify-between bg-slate-50 rounded-xl p-3 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="outline" className={cn('text-xs font-semibold px-1.5 py-0.5 rounded-md uppercase', ACTION_COLORS[item.type] || 'bg-slate-50 text-slate-600')}>
                          {item.type}
                        </Badge>
                        <span className="text-sm font-semibold text-slate-800">{item.action}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Document: <span className="text-slate-700">{item.document}</span></p>
                      <p className="text-xs text-slate-400 mt-0.5">Client: {item.client}</p>
                    </div>
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{item.time}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
