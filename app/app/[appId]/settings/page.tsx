'use client'

import { motion } from 'framer-motion'
import { Settings, User, Bell, Shield, Palette, Database, CreditCard, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const SETTING_SECTIONS = [
  { icon: User, label: 'Profile' },
  { icon: Bell, label: 'Notifications' },
  { icon: Shield, label: 'Security' },
  { icon: Palette, label: 'Appearance' },
  { icon: Database, label: 'Storage' },
  { icon: CreditCard, label: 'Billing' },
]

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account and workspace preferences</p>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        {/* Side nav */}
        <div className="bg-white rounded-2xl border border-slate-100 p-3 space-y-0.5 h-fit">
          {SETTING_SECTIONS.map((s, i) => (
            <button key={s.label}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${i === 0 ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <s.icon size={16} /> {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-5">
          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="text-slate-500" size={18} />
              <h2 className="text-base font-semibold text-slate-900">Profile Information</h2>
            </div>
            <div className="flex items-center gap-5 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">AK</AvatarFallback>
              </Avatar>
              <div>
                <Button size="sm" variant="outline" className="rounded-xl text-sm border-slate-200 mr-2">Change Photo</Button>
                <Button size="sm" variant="ghost" className="rounded-xl text-sm text-red-500">Remove</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'First Name', value: 'Ajay', name: 'first_name' },
                { label: 'Last Name', value: 'Kumar', name: 'last_name' },
                { label: 'Email Address', value: 'ajay@docflow.ai', name: 'email' },
                { label: 'Phone Number', value: '+91 98765 43210', name: 'phone' },
              ].map((f) => (
                <div key={f.name}>
                  <Label className="text-xs font-medium text-slate-600 mb-1.5 block">{f.label}</Label>
                  <Input defaultValue={f.value} className="rounded-xl border-slate-200 h-9 text-sm" />
                </div>
              ))}
              <div className="col-span-2">
                <Label className="text-xs font-medium text-slate-600 mb-1.5 block">Company / Organization</Label>
                <Input defaultValue="DocFlow AI" className="rounded-xl border-slate-200 h-9 text-sm" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-5 shadow-blue text-sm">Save Changes</Button>
              <Button variant="outline" className="rounded-xl h-9 px-5 border-slate-200 text-sm">Cancel</Button>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell className="text-slate-500" size={18} />
              <h2 className="text-base font-semibold text-slate-900">Notification Preferences</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Document Generated', desc: 'When a document is successfully generated', defaultChecked: true },
                { label: 'Template Updated', desc: 'When your templates are updated', defaultChecked: true },
                { label: 'Client Activity', desc: 'When a client views or downloads a document', defaultChecked: false },
                { label: 'Storage Alert', desc: 'When storage reaches 80% capacity', defaultChecked: true },
                { label: 'Weekly Summary', desc: 'Weekly digest of activity', defaultChecked: false },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{n.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.defaultChecked} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Plan */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="text-slate-500" size={18} />
                <h2 className="text-base font-semibold text-slate-900">Billing & Plan</h2>
              </div>
              <Badge className="bg-blue-600 text-white border-blue-600">Pro Plan</Badge>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Pro Plan — ₹2,499/month</span>
                <span className="text-xs text-blue-600">Renews July 15, 2024</span>
              </div>
              <div className="space-y-1.5">
                {['Unlimited documents', '200+ templates', 'AI assistance', 'Priority support', 'Custom branding'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-blue-800">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl border-slate-200 text-sm h-9">Manage Subscription</Button>
              <Button variant="ghost" className="rounded-xl text-sm h-9 text-red-500">Cancel Plan</Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
