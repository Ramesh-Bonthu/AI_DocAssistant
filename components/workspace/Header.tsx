'use client'

import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, HelpCircle, Settings, ChevronRight,
  FileText, User, LogOut, LayoutGrid, Check, Info, AlertTriangle, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { APPLICATIONS, NOTIFICATIONS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  clients: 'Clients',
  templates: 'Templates',
  documents: 'Documents',
  history: 'History',
  analytics: 'Analytics',
  editor: 'Editor',
  settings: 'Settings',
}

const notifIcons = { info: Info, success: Check, warning: AlertTriangle }
const notifColors = { info: 'text-blue-500 bg-blue-50', success: 'text-emerald-500 bg-emerald-50', warning: 'text-amber-500 bg-amber-50' }

export function WorkspaceHeader() {
  const params = useParams()
  const pathname = usePathname()
  const appId = params?.appId as string
  const app = APPLICATIONS.find((a) => a.id === appId)

  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifs, setNotifs] = useState(NOTIFICATIONS)
  const [searchFocused, setSearchFocused] = useState(false)

  const [userName, setUserName] = useState('Ajay Kumar')
  const [userEmail, setUserEmail] = useState('ajay@docflow.ai')
  const [userRole, setUserRole] = useState('Super Admin')

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (role) {
      setUserRole(role)
      if (role === 'Super Admin') {
        setUserName('Super Admin')
        setUserEmail('superadmin@example.com')
      } else if (role === 'Admin') {
        setUserName('Workspace Admin')
        setUserEmail('admin@example.com')
      } else if (role === 'Users') {
        setUserName('Standard User')
        setUserEmail('user@example.com')
      }
    }
  }, [])

  const segment = pathname?.split('/').pop() || 'dashboard'
  const page = BREADCRUMB_MAP[segment] || segment
  const unreadCount = notifs.filter((n) => !n.read).length

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-4 gap-4 sticky top-0 z-30">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        <Link href="/applications" className="text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap">Apps</Link>
        <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
        <span className="text-slate-500 truncate max-w-[120px]">{app?.name}</span>
        <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
        <span className="text-slate-900 font-medium">{page}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className={cn('relative hidden sm:block transition-all duration-200', searchFocused ? 'w-72' : 'w-52')}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <Input
          placeholder="Search documents..."
          className="pl-9 h-8 text-sm rounded-lg border-slate-200 bg-slate-50 focus:bg-white"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* Help */}
      <button className="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors hidden sm:flex">
        <HelpCircle size={17} />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false) }}
          className="w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors relative"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <AnimatePresence>
          {showNotifs && (
            <motion.div initial={{ opacity: 0, y: 4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.97 }} transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 w-80 bg-white rounded-xl border border-slate-100 shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.map((n) => {
                  const Icon = notifIcons[n.type]
                  return (
                    <div key={n.id} className={cn('flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50', !n.read && 'bg-blue-50/30')}>
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', notifColors[n.type])}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                      </div>
                      {!n.read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />}
                    </div>
                  )
                })}
              </div>
              <div className="px-4 py-3 text-center border-t border-slate-100">
                <button className="text-xs text-blue-600 font-medium">View all notifications</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => { setShowProfile(!showProfile); setShowNotifs(false) }}
          className="flex items-center gap-2 hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors"
        >
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
              {userName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">{userName}</span>
        </button>
        <AnimatePresence>
          {showProfile && (
            <motion.div initial={{ opacity: 0, y: 4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.97 }} transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 w-56 bg-white rounded-xl border border-slate-100 shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">{userEmail}</p>
                <Badge className="mt-1 text-xs bg-blue-50 text-blue-700 border-blue-100">{userRole}</Badge>
              </div>
              {[
                { icon: User, label: 'My Profile' },
                { icon: LayoutGrid, label: 'All Applications' },
                { icon: Settings, label: 'Settings' },
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <item.icon size={15} className="text-slate-500" /> {item.label}
                </button>
              ))}
              <div className="border-t border-slate-100">
                <Link href="/">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut size={15} /> Sign Out
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click away */}
      {(showNotifs || showProfile) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotifs(false); setShowProfile(false) }} />
      )}
    </header>
  )
}
