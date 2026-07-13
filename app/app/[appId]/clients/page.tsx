'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Filter, LayoutGrid, List, ArrowRight,
  Mail, Phone, Building2, FileText, ChevronDown, SlidersHorizontal,
  Star, MoreHorizontal, Edit, Trash2, ExternalLink, Check, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { CLIENTS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const CLIENT_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
  'bg-indigo-500', 'bg-green-500', 'bg-red-500', 'bg-pink-500',
]

export default function ClientsPage() {
  const params = useParams()
  const appId = params?.appId as string

  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showModal, setShowModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<typeof CLIENTS[0] | null>(null)
  const [clients, setClients] = useState(CLIENTS)
  const [sortBy, setSortBy] = useState('name')
  const [filterStatus, setFilterStatus] = useState('all')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const filtered = clients
    .filter((c) => {
      const q = search.toLowerCase()
      const matchSearch = c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.contactPerson.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'all' || c.status === filterStatus
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.company.localeCompare(b.company)
      if (sortBy === 'docs') return b.documentsCount - a.documentsCount
      if (sortBy === 'revenue') return b.revenue - a.revenue
      return 0
    })

  const onSubmit = (data: any) => {
    const newClient = {
      ...data,
      id: String(clients.length + 1),
      logo: data.company.slice(0, 2).toUpperCase(),
      documentsCount: 0,
      status: 'active' as const,
      revenue: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setClients((prev) => [...prev, newClient])
    setShowModal(false)
    reset()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-sm text-slate-500 mt-0.5">{clients.length} total clients · {clients.filter((c) => c.status === 'active').length} active</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-blue h-9">
          <Plus size={15} className="mr-1.5" /> Add Client
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..." className="pl-9 h-9 rounded-xl border-slate-200 text-sm" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32 h-9 rounded-xl border-slate-200 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-36 h-9 rounded-xl border-slate-200 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="docs">Sort by Docs</SelectItem>
            <SelectItem value="revenue">Sort by Revenue</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5">
          <button onClick={() => setViewMode('grid')} className={cn('p-1.5 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600')}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} className={cn('p-1.5 rounded-lg transition-colors', viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600')}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Grid view */}
      {viewMode === 'grid' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((client, i) => (
            <motion.div key={client.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg hover:border-slate-200 transition-all hover:-translate-y-0.5 group cursor-pointer"
                onClick={() => setSelectedClient(client)}>
                <div className="flex items-start justify-between mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className={cn('text-white text-sm font-bold', CLIENT_COLORS[parseInt(client.id) % CLIENT_COLORS.length])}>
                      {client.logo}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', client.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300')} />
                    <span className="text-xs text-slate-500 capitalize">{client.status}</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{client.company}</h3>
                <p className="text-xs text-slate-500 mb-3">{client.contactPerson}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={11} className="flex-shrink-0" /> <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={11} className="flex-shrink-0" /> {client.phone}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <FileText size={11} /> {client.documentsCount} docs
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    ₹{(client.revenue / 1000).toFixed(0)}K
                  </div>
                </div>
                <Button size="sm" className="w-full mt-3 h-8 text-xs rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all font-medium">
                  Open Workspace <ArrowRight size={12} className="ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
          {/* Add client card */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <button onClick={() => setShowModal(true)}
              className="w-full h-full min-h-[200px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
              <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                <Plus className="text-slate-400 group-hover:text-blue-600" size={20} />
              </div>
              <span className="text-sm text-slate-500 group-hover:text-blue-600 font-medium transition-colors">Add New Client</span>
            </button>
          </motion.div>
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
            <span>Company</span><span>Contact</span><span>Status</span><span>Documents</span><span>Actions</span>
          </div>
          {filtered.map((client, i) => (
            <motion.div key={client.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarFallback className={cn('text-white text-xs font-bold', CLIENT_COLORS[parseInt(client.id) % CLIENT_COLORS.length])}>
                    {client.logo}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-900">{client.company}</p>
                  <p className="text-xs text-slate-500">{client.email}</p>
                </div>
              </div>
              <span className="text-sm text-slate-600">{client.contactPerson}</span>
              <span>
                <Badge className={cn('text-xs rounded-full', client.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200')}>
                  {client.status}
                </Badge>
              </span>
              <span className="text-sm text-slate-600">{client.documentsCount} docs</span>
              <button onClick={() => setSelectedClient(client)} className="text-blue-600 text-xs font-medium hover:text-blue-700 flex items-center gap-1">
                View <ExternalLink size={12} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="text-slate-400" size={22} />
          </div>
          <p className="text-slate-500 font-medium">No clients found</p>
          <p className="text-sm text-slate-400 mt-1">Try a different search or add a new client</p>
        </div>
      )}

      {/* Add Client Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Company Name *</Label>
                <Input {...register('company', { required: true })} placeholder="TechNova Solutions" className={cn('rounded-xl', errors.company && 'border-red-300')} />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Contact Person *</Label>
                <Input {...register('contactPerson', { required: true })} placeholder="Arjun Sharma" className="rounded-xl" />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Email Address *</Label>
                <Input {...register('email', { required: true })} type="email" placeholder="arjun@technova.in" className="rounded-xl" />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone Number</Label>
                <Input {...register('phone')} placeholder="+91 98765 43210" className="rounded-xl" />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">GST Number</Label>
                <Input {...register('gstNumber')} placeholder="27AAPCA1234B1Z1" className="rounded-xl" />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Payment Terms</Label>
                <Select onValueChange={(v) => {}}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Immediate'].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Country</Label>
                <Input {...register('country')} placeholder="India" className="rounded-xl" defaultValue="India" />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">City</Label>
                <Input {...register('city')} placeholder="Bengaluru" className="rounded-xl" />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Postal Code</Label>
                <Input {...register('postalCode')} placeholder="560001" className="rounded-xl" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Company Address</Label>
              <Input {...register('address')} placeholder="42 Tech Park, Whitefield" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Notes</Label>
              <Textarea {...register('notes')} placeholder="Any additional notes about this client..." className="rounded-xl resize-none" rows={3} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 shadow-blue">
                <Check size={15} className="mr-1.5" /> Save Client
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1 rounded-xl h-10 border-slate-200">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Client profile modal */}
      <AnimatePresence>
        {selectedClient && (
          <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
            <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className={cn('text-white font-bold text-lg', CLIENT_COLORS[parseInt(selectedClient.id) % CLIENT_COLORS.length])}>
                      {selectedClient.logo}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl font-bold">{selectedClient.company}</DialogTitle>
                    <p className="text-sm text-slate-500">{selectedClient.contactPerson} · {selectedClient.city}, {selectedClient.country}</p>
                    <Badge className={cn('mt-1 text-xs', selectedClient.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600')}>
                      {selectedClient.status}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: 'Documents', value: selectedClient.documentsCount },
                  { label: 'Revenue', value: `₹${(selectedClient.revenue / 1000).toFixed(0)}K` },
                  { label: 'Since', value: selectedClient.createdAt },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 mt-4">
                <h4 className="text-sm font-semibold text-slate-700">Contact Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Email', value: selectedClient.email },
                    { label: 'Phone', value: selectedClient.phone },
                    { label: 'GST Number', value: selectedClient.gstNumber },
                    { label: 'Payment Terms', value: selectedClient.paymentTerms },
                    { label: 'Address', value: selectedClient.address },
                    { label: 'Postal Code', value: selectedClient.postalCode },
                  ].map((field) => (
                    <div key={field.label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-0.5">{field.label}</p>
                      <p className="font-medium text-slate-800">{field.value}</p>
                    </div>
                  ))}
                </div>
                {selectedClient.notes && (
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <p className="text-xs text-amber-600 font-medium mb-0.5">Notes</p>
                    <p className="text-sm text-amber-800">{selectedClient.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-4">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  <FileText size={14} className="mr-1.5" /> Create Document
                </Button>
                <Button variant="outline" className="rounded-xl border-slate-200">
                  <Edit size={14} className="mr-1.5" /> Edit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
