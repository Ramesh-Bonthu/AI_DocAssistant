'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FileText, Users, Layout, TrendingUp, Clock, ArrowRight,
  Plus, FolderOpen, BarChart2, Receipt, ArrowUpRight,
  CheckCircle2, Edit3, Download, Share2, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { APPLICATIONS, DOCUMENTS, CLIENTS, ACTIVITIES, CHART_DATA } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const activityIcons = {
  create: { icon: Plus, color: 'bg-blue-50 text-blue-600' },
  edit: { icon: Edit3, color: 'bg-amber-50 text-amber-600' },
  download: { icon: Download, color: 'bg-emerald-50 text-emerald-600' },
  share: { icon: Share2, color: 'bg-violet-50 text-violet-600' },
  delete: { icon: Clock, color: 'bg-slate-50 text-slate-500' },
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-amber-100 text-amber-700',
  shared: 'bg-blue-100 text-blue-700',
  archived: 'bg-slate-100 text-slate-600',
}

export default function DashboardPage() {
  const params = useParams()
  const appId = params?.appId as string
  const app = APPLICATIONS.find((a) => a.id === appId)

  const appDocs = DOCUMENTS.filter((d) => d.type === appId).slice(0, 5)
  const recentDocs = appDocs.length > 0 ? appDocs : DOCUMENTS.slice(0, 5)

  const stats = [
    { label: 'Documents Generated', value: '248', change: '+12%', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'up' },
    { label: 'Templates Used', value: '18', change: '+5%', icon: Layout, color: 'text-violet-600', bg: 'bg-violet-50', trend: 'up' },
    { label: 'Active Clients', value: '25', change: '+8%', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'up' },
    { label: 'Revenue (₹)', value: '₹4.2L', change: '+21%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'up' },
    { label: 'Drafts', value: '7', change: '-2', icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'down' },
  ]

  const quickActions = [
    { label: 'New Document', icon: Plus, href: `/app/${appId}/editor`, color: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue' },
    { label: 'Add Client', icon: Users, href: `/app/${appId}/clients`, color: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200' },
    { label: 'Templates', icon: Layout, href: `/app/${appId}/templates`, color: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {app?.name || 'Dashboard'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back, Ajay. Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button className={cn('rounded-xl h-9 px-4 text-sm font-medium transition-all', action.color)}>
                <action.icon size={15} className="mr-1.5" /> {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', s.bg)}>
                <s.icon className={cn('w-4.5 h-4.5', s.color)} size={18} />
              </div>
              <span className={cn('text-xs font-semibold flex items-center gap-0.5', s.trend === 'up' ? 'text-emerald-600' : 'text-rose-500')}>
                <ArrowUpRight size={12} className={s.trend === 'down' ? 'rotate-90' : ''} /> {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Area chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Monthly Activity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Documents generated over time</p>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">2024</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CHART_DATA.monthly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="documents" stroke="#2563EB" strokeWidth={2.5} fill="url(#colorDocs)" dot={false} activeDot={{ r: 4, fill: '#2563EB' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-900">Document Types</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution by category</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CHART_DATA.docTypes} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {CHART_DATA.docTypes.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {CHART_DATA.docTypes.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-slate-500 truncate">{d.name}</span>
                <span className="text-xs font-medium text-slate-700 ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent docs + Activities */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent documents */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Recent Documents</h3>
            <Link href={`/app/${appId}/documents`}>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7 px-2">View All <ArrowRight size={12} className="ml-1" /></Button>
            </Link>
          </div>
          <div className="space-y-2">
            {recentDocs.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group cursor-pointer border border-transparent hover:border-slate-100">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                  <FileText className="text-blue-600" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{doc.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{doc.client} · {doc.updatedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusColors[doc.status])}>{doc.status}</span>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
            <Badge className="text-xs bg-slate-50 text-slate-600 border-slate-200">{ACTIVITIES.length} items</Badge>
          </div>
          <div className="space-y-3">
            {ACTIVITIES.slice(0, 6).map((act, i) => {
              const { icon: Icon, color } = activityIcons[act.type]
              return (
                <motion.div key={act.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.05 }}
                  className="flex gap-3 items-start">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
                    <Icon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700">
                      <span className="capitalize">{act.action}</span>
                    </p>
                    <p className="text-xs text-slate-400 truncate">{act.document}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{act.time}</span>
                </motion.div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50">
            <Link href={`/app/${appId}/history`}>
              <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500 h-8">View full history</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
