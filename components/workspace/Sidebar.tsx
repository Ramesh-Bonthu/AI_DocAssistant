'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Layout, FileText, History,
  BarChart2, Settings, Receipt, HelpCircle, Award, UserCircle, BarChart,
  Briefcase, ClipboardList, Banknote, CreditCard, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { APPLICATIONS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: 'dashboard' },
  { label: 'Clients', icon: Users, href: 'clients' },
  { label: 'Templates', icon: Layout, href: 'templates' },
  { label: 'Documents', icon: FileText, href: 'documents' },
  { label: 'History', icon: History, href: 'history' },
  { label: 'Analytics', icon: BarChart2, href: 'analytics' },
]

const BOTTOM_ITEMS = [
  { label: 'Settings', icon: Settings, href: 'settings' },
]

const APP_ICONS: Record<string, React.ElementType> = {
  invoice: Receipt,
  'offer-letter': FileText,
  'hr-documents': Users,
  'question-generator': HelpCircle,
  certificates: Award,
  'resume-builder': UserCircle,
  'resume-analyzer': BarChart,
  'experience-letter': Briefcase,
  'appointment-letter': ClipboardList,
  'salary-slip': Banknote,
  'id-card': CreditCard,
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const params = useParams()
  const pathname = usePathname()
  const appId = params?.appId as string
  const app = APPLICATIONS.find((a) => a.id === appId)
  const AppIcon = APP_ICONS[appId] || FileText

  const [userRole, setUserRole] = useState<string>('Super Admin')

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (role) {
      setUserRole(role)
    }
  }, [])

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (userRole === 'Users') {
      return ['Dashboard', 'Documents', 'History'].includes(item.label)
    }
    if (userRole === 'Admin') {
      return ['Dashboard', 'Templates', 'Documents', 'History', 'Analytics'].includes(item.label)
    }
    return true // Super Admin has access to all
  })

  const isActive = (href: string) => pathname?.includes(`/${href}`)

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-full bg-white border-r border-slate-100 overflow-hidden flex-shrink-0"
    >
      {/* App brand */}
      <div className={cn('flex items-center gap-3 px-4 py-4 border-b border-slate-100 min-h-[64px]', collapsed && 'justify-center px-0')}>
        {app && (
          <div className={`w-9 h-9 bg-gradient-to-br ${app.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <AppIcon className="text-white" size={18} />
          </div>
        )}
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 leading-tight whitespace-nowrap">{app?.name || 'DocFlow AI'}</p>
              <p className="text-xs text-slate-400 whitespace-nowrap">Workspace</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={`/app/${appId}/${item.href}`}>
              <div className={cn(
                'sidebar-item',
                active ? 'sidebar-item-active' : 'sidebar-item-inactive',
                collapsed && 'justify-center px-0 py-3'
              )} title={collapsed ? item.label : undefined}>
                <item.icon size={18} className={cn('flex-shrink-0', active ? 'text-white' : 'text-slate-500')} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && active && (
                  <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-slate-100 space-y-0.5">
        <Link href={`/app/${appId}/editor`}>
          <div className={cn('sidebar-item bg-blue-600 text-white hover:bg-blue-700 justify-center gap-2', collapsed && 'px-0')}>
            <FileText size={16} className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="text-xs font-medium whitespace-nowrap">
                  New Document
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>
        <button
          onClick={onToggle}
          className="w-full sidebar-item sidebar-item-inactive"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={18} className="mx-auto text-slate-500" /> : (
            <>
              <PanelLeftClose size={18} className="text-slate-500" />
              <AnimatePresence>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-slate-600">Collapse</motion.span>
              </AnimatePresence>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
