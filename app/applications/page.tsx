'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ArrowRight, FileText, Receipt, Users, HelpCircle, Award, UserCircle, BarChart2, Briefcase, ClipboardList, Banknote, CreditCard, ChevronLeft, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { APPLICATIONS } from '@/lib/mock-data'

const ICONS: Record<string, React.ElementType> = {
  Receipt, FileText, Users, HelpCircle, Award, UserCircle,
  BarChart2, Briefcase, ClipboardList, Banknote, CreditCard
}

const CATEGORIES = ['All', 'Finance', 'HR', 'Education', 'Career', 'Design']

export default function ApplicationsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = useMemo(() => {
    return APPLICATIONS.filter((app) => {
      const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = activeCategory === 'All' || app.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="text-white" size={16} />
            </div>
            <span className="text-lg font-bold text-slate-900">DocFlow <span className="text-blue-600">AI</span></span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ChevronLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-100 rounded-full px-4 py-1 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> 11 Applications Available
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Choose Your Application</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Select the document automation tool that best fits your current need.</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-lg mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applications..."
              className="pl-11 h-12 rounded-xl border-slate-200 bg-white shadow-sm text-slate-800 focus-visible:ring-blue-500"
            />
          </div>
        </motion.div>

        {/* Category filter */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((app, i) => {
            const Icon = ICONS[app.icon] || FileText
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/app/${app.id}/dashboard`} className="group block">
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    {/* Gradient bg */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                    <div className="relative">
                      {/* Icon + Arrow */}
                      <div className="flex items-start justify-between mb-5">
                        <div className={`w-14 h-14 bg-gradient-to-br ${app.gradient} rounded-2xl flex items-center justify-center shadow-sm`}>
                          <Icon className="text-white" size={26} />
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                          <ArrowRight className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" size={16} />
                        </div>
                      </div>

                      {/* Content */}
                      <Badge variant="outline" className="mb-3 text-xs text-slate-500 border-slate-200">{app.category}</Badge>
                      <h3 className="text-base font-semibold text-slate-900 mb-2">{app.name}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{app.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={24} />
            </div>
            <p className="text-slate-500 text-lg mb-2">No applications found</p>
            <p className="text-slate-400 text-sm">Try a different search term</p>
          </motion.div>
        )}
      </main>
    </div>
  )
}
