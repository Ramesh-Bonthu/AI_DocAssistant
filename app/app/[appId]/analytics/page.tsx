'use client'

import { motion } from 'framer-motion'
import { TrendingUp, FileText, Users, Layout, BarChart2, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, Legend
} from 'recharts'
import { CHART_DATA, CLIENTS, TEMPLATES } from '@/lib/mock-data'

const topClients = CLIENTS.sort((a, b) => b.documentsCount - a.documentsCount).slice(0, 5)
const topTemplates = TEMPLATES.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const revenueData = CHART_DATA.monthly.slice(0, 6)

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Performance insights for your workspace</p>
        </div>
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-sm px-3 py-1">Last 12 Months</Badge>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: '1,154', change: '+23.4%', color: 'text-blue-600', bg: 'bg-blue-50', icon: FileText },
          { label: 'Total Revenue', value: '₹32.4L', change: '+18.7%', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: TrendingUp },
          { label: 'Active Clients', value: '25', change: '+12%', color: 'text-violet-600', bg: 'bg-violet-50', icon: Users },
          { label: 'Templates Used', value: '20', change: '+5%', color: 'text-amber-600', bg: 'bg-amber-50', icon: Layout },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon className={`${s.color}`} size={17} />
              </div>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight size={11} /> {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Documents Generated</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly document generation trend</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={CHART_DATA.monthly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="docsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="documents" stroke="#2563EB" strokeWidth={2.5} fill="url(#docsGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Revenue Growth</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly revenue in ₹</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(v: any) => [`₹${(v / 1000).toFixed(0)}K`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Client Growth */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Client Growth</h3>
          <p className="text-xs text-slate-500 mb-4">Cumulative clients acquired</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={CHART_DATA.clientGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Line type="monotone" dataKey="clients" stroke="#059669" strokeWidth={2.5} dot={{ fill: '#059669', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Document type distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Document Mix</h3>
          <p className="text-xs text-slate-500 mb-3">Distribution by type</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CHART_DATA.docTypes} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {CHART_DATA.docTypes.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {CHART_DATA.docTypes.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-xs text-slate-500 truncate">{d.name}</span>
                <span className="text-xs font-medium text-slate-700 ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top templates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Top Templates</h3>
          <div className="space-y-3">
            {topTemplates.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{t.name}</p>
                  <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(t.usageCount / topTemplates[0].usageCount) * 100}%` }} />
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-600 w-10 text-right">{t.usageCount}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top clients */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Most Active Clients</h3>
            <p className="text-xs text-slate-500 mt-0.5">Clients by document count and revenue</p>
          </div>
        </div>
        <div className="space-y-3">
          {topClients.map((client, i) => (
            <div key={client.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <span className="text-sm font-bold text-slate-300 w-5">{i + 1}</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                {client.logo}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{client.company}</p>
                <p className="text-xs text-slate-500">{client.city} · {client.contactPerson}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{client.documentsCount} docs</p>
                <p className="text-xs text-emerald-600 font-medium">₹{(client.revenue / 1000).toFixed(0)}K</p>
              </div>
              <div className="w-20">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(client.documentsCount / topClients[0].documentsCount) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
