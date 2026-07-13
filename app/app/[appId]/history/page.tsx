'use client'

import { motion } from 'framer-motion'
import { Clock, RotateCcw, GitBranch, Eye, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const VERSIONS = [
  { id: 'v5', label: 'Version 5', tag: 'Current', time: '2 hours ago', author: 'Ajay Kumar', changes: 'Updated payment terms, added discount field', color: 'bg-blue-600' },
  { id: 'v4', label: 'Version 4', tag: null, time: 'Yesterday, 4:30 PM', author: 'Ajay Kumar', changes: 'Added company logo, changed font to Inter', color: 'bg-slate-400' },
  { id: 'v3', label: 'Version 3', tag: null, time: 'Yesterday, 11:00 AM', author: 'Ajay Kumar', changes: 'Fixed GST calculation for IGST', color: 'bg-slate-400' },
  { id: 'v2', label: 'Version 2', tag: null, time: '2 days ago', author: 'Ajay Kumar', changes: 'Initial design changes, updated template', color: 'bg-slate-400' },
  { id: 'v1', label: 'Version 1', tag: 'Original', time: '3 days ago', author: 'Ajay Kumar', changes: 'Document created from Invoice template', color: 'bg-slate-300' },
]

const HISTORY_ITEMS = [
  { date: 'Today', items: [
    { time: '2:45 PM', action: 'Edited', doc: 'INV-2024-001', detail: 'Updated payment due date' },
    { time: '11:30 AM', action: 'Generated', doc: 'Offer Letter - Priya Nair', detail: 'New document created from template' },
    { time: '9:15 AM', action: 'Downloaded', doc: 'Certificate - Web Dev', detail: 'Exported as PDF' },
  ]},
  { date: 'Yesterday', items: [
    { time: '5:00 PM', action: 'Shared', doc: 'INV-2024-002', detail: 'Sent to client via email' },
    { time: '3:20 PM', action: 'Edited', doc: 'HR Policy', detail: 'Added remote work clause' },
    { time: '1:00 PM', action: 'Generated', doc: 'Question Paper - Maths', detail: 'Generated with AI assistance' },
  ]},
  { date: '2 days ago', items: [
    { time: '4:30 PM', action: 'Archived', doc: 'Resume Analyzer', detail: 'Moved to archive' },
    { time: '10:45 AM', action: 'Edited', doc: 'Salary Slip', detail: 'Updated HRA component' },
  ]},
]

const ACTION_COLORS: Record<string, string> = {
  Edited: 'bg-amber-50 text-amber-600',
  Generated: 'bg-blue-50 text-blue-600',
  Downloaded: 'bg-emerald-50 text-emerald-600',
  Shared: 'bg-violet-50 text-violet-600',
  Archived: 'bg-slate-100 text-slate-500',
}

export default function HistoryPage() {
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
            <Badge className="ml-auto text-xs bg-slate-50 text-slate-600 border-slate-200">INV-2024-001</Badge>
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
          <div className="space-y-6">
            {HISTORY_ITEMS.map((group, gi) => (
              <div key={group.date}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-xs font-semibold text-slate-500 bg-white px-2">{group.date}</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="space-y-2">
                  {group.items.map((item, ii) => (
                    <motion.div key={ii} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: gi * 0.1 + ii * 0.05 }}
                      className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                      <span className="text-xs text-slate-400 w-16 flex-shrink-0 pt-0.5">{item.time}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded-md', ACTION_COLORS[item.action] || 'bg-slate-50 text-slate-600')}>
                            {item.action}
                          </span>
                          <span className="text-xs font-medium text-slate-800">{item.doc}</span>
                        </div>
                        <p className="text-xs text-slate-500">{item.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
