'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  FileText, Zap, Shield, Edit3, Layout, Cloud,
  ArrowRight, ChevronRight, CheckCircle, Star,
  Receipt, Users, HelpCircle, Award, UserCircle, BarChart2,
  Menu, X, Sparkles, TrendingUp, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const features = [
  { icon: Sparkles, title: 'AI Powered', desc: 'Generate documents in seconds using advanced AI models that understand your business context.', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Zap, title: 'Fast Generation', desc: 'Create professional documents 10x faster than traditional methods with smart automation.', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Shield, title: 'Secure Storage', desc: 'Enterprise-grade encryption and compliance to keep your sensitive business documents safe.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Edit3, title: 'Rich Editor', desc: 'Full-featured document editor with Google Docs-level functionality and real-time collaboration.', color: 'text-violet-600', bg: 'bg-violet-50' },
  { icon: Layout, title: 'Reusable Templates', desc: '200+ professional templates crafted by experts for every business document need.', color: 'text-rose-600', bg: 'bg-rose-50' },
  { icon: Cloud, title: 'Cloud Ready', desc: 'Access your documents anywhere, anytime, across all your devices seamlessly.', color: 'text-cyan-600', bg: 'bg-cyan-50' },
]

const apps = [
  { icon: Receipt, name: 'Invoice Automation', desc: 'GST invoices with auto calculations', color: 'text-blue-600', bg: 'from-blue-50 to-blue-100', href: '/app/invoice' },
  { icon: FileText, name: 'Offer Letter Generator', desc: 'Professional employment offers', color: 'text-emerald-600', bg: 'from-emerald-50 to-emerald-100', href: '/app/offer-letter' },
  { icon: Users, name: 'HR Documents', desc: 'Complete HR documentation suite', color: 'text-violet-600', bg: 'from-violet-50 to-violet-100', href: '/app/hr-documents' },
  { icon: HelpCircle, name: 'Question Generator', desc: 'AI-powered exam paper creation', color: 'text-amber-600', bg: 'from-amber-50 to-amber-100', href: '/app/question-generator' },
  { icon: Award, name: 'Certificates', desc: 'Design elegant certificates', color: 'text-rose-600', bg: 'from-rose-50 to-rose-100', href: '/app/certificates' },
  { icon: UserCircle, name: 'Resume Builder', desc: 'ATS-optimized professional resumes', color: 'text-cyan-600', bg: 'from-cyan-50 to-cyan-100', href: '/app/resume-builder' },
]

const stats = [
  { value: '50,000+', label: 'Documents Generated', icon: FileText },
  { value: '5,000+', label: 'Happy Businesses', icon: TrendingUp },
  { value: '200+', label: 'Professional Templates', icon: Layout },
  { value: '99.9%', label: 'Uptime Guaranteed', icon: Globe },
]

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/applications', label: 'Applications' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, -60])

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setScrolled(v > 20))
    return unsub
  }, [scrollY])

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-white" size={18} />
              </div>
              <span className="text-lg font-bold text-slate-900">DocFlow <span className="text-blue-600">AI</span></span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/applications">
                <Button variant="ghost" size="sm" className="text-slate-600">Login</Button>
              </Link>
              <Link href="/applications">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 shadow-blue">
                  Get Started <ArrowRight className="ml-1.5" size={14} />
                </Button>
              </Link>
            </div>

            {/* Mobile menu */}
            <button className="md:hidden p-2 rounded-lg text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden glass border-t border-slate-100 px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/applications" onClick={() => setMenuOpen(false)}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">Get Started</Button>
            </Link>
          </motion.div>
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:44px_44px]" />

        <motion.div style={{ y: heroY }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200 px-4 py-1.5 text-sm font-medium rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI-Powered Document Automation
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight tracking-tight max-w-4xl mx-auto"
          >
            Generate Professional{' '}
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Business Documents</span>
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full opacity-30" />
            </span>{' '}
            with AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Automate invoices, offer letters, HR documents, certificates, resumes and much more using an intelligent document automation platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/applications">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base rounded-xl shadow-blue transition-all hover:shadow-lg hover:-translate-y-0.5">
                Explore Applications <ChevronRight className="ml-2" size={18} />
              </Button>
            </Link>
            <Link href="/applications">
              <Button size="lg" variant="outline" className="px-8 py-6 text-base rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 transition-all hover:-translate-y-0.5">
                Get Started Free
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500"
          >
            {['No credit card required', 'Free 14-day trial', 'Cancel anytime'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />{t}
              </span>
            ))}
          </motion.div>

          {/* Hero illustration */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 relative max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-white">
              {/* Mock dashboard screenshot */}
              <div className="bg-slate-100 h-8 flex items-center gap-2 px-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md h-5 w-64 mx-auto flex items-center justify-center">
                    <span className="text-xs text-slate-400">app.docflow.ai/dashboard</span>
                  </div>
                </div>
              </div>
              <div className="flex h-72 bg-white">
                {/* Fake sidebar */}
                <div className="w-48 bg-slate-50 border-r border-slate-100 p-3 hidden sm:block">
                  <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`h-8 rounded-lg mb-1.5 flex items-center gap-2 px-2 ${i === 0 ? 'bg-blue-50' : ''}`}>
                      <div className={`w-4 h-4 rounded ${i === 0 ? 'bg-blue-300' : 'bg-slate-200'}`} />
                      <div className={`h-2.5 rounded flex-1 ${i === 0 ? 'bg-blue-200' : 'bg-slate-200'}`} />
                    </div>
                  ))}
                </div>
                {/* Fake content */}
                <div className="flex-1 p-4">
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { color: 'bg-blue-100', accent: 'bg-blue-500' },
                      { color: 'bg-emerald-100', accent: 'bg-emerald-500' },
                      { color: 'bg-amber-100', accent: 'bg-amber-500' },
                      { color: 'bg-violet-100', accent: 'bg-violet-500' },
                    ].map((card, i) => (
                      <div key={i} className={`${card.color} rounded-xl p-3`}>
                        <div className={`w-6 h-6 ${card.accent} rounded-lg mb-2 opacity-70`} />
                        <div className="h-4 w-12 bg-white/60 rounded mb-1" />
                        <div className="h-2.5 w-8 bg-white/40 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 h-28">
                      <div className="h-2.5 w-20 bg-slate-200 rounded mb-3" />
                      <div className="flex items-end gap-1 h-16">
                        {[40, 65, 45, 80, 60, 90, 70, 85, 75, 95, 88, 100].map((h, i) => (
                          <div key={i} className="flex-1 bg-blue-500 rounded-sm opacity-70" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 h-28">
                      <div className="h-2.5 w-24 bg-slate-200 rounded mb-3" />
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-slate-200" />
                          <div className="flex-1 h-2 bg-slate-200 rounded" />
                          <div className="w-8 h-2 bg-slate-200 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating cards */}
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -left-6 top-12 bg-white rounded-xl shadow-lg border border-slate-100 p-3 hidden lg:flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Invoice Generated</p>
                <p className="text-xs text-slate-500">INV-2024-001 • Just now</p>
              </div>
            </motion.div>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -right-6 top-20 bg-white rounded-xl shadow-lg border border-slate-100 p-3 hidden lg:block">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex -space-x-1">
                  {['bg-blue-400', 'bg-emerald-400', 'bg-amber-400'].map((c, i) => (
                    <div key={i} className={`w-5 h-5 ${c} rounded-full border-2 border-white`} />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-700">AI Processing</span>
              </div>
              <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div animate={{ width: ['20%', '100%'] }} transition={{ duration: 2, repeat: Infinity }} className="h-full bg-blue-500 rounded-full" />
              </div>
            </motion.div>
            <motion.div animate={{ y: [0, -7, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
              className="absolute -right-4 bottom-12 bg-white rounded-xl shadow-lg border border-slate-100 p-3 hidden lg:flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">5,024 documents</p>
                <p className="text-xs text-emerald-600">+12% this month</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <stat.icon className="w-6 h-6 text-blue-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-100 rounded-full px-4 py-1">Features</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need to automate documents</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Powerful tools built for modern businesses to create, manage, and distribute professional documents at scale.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group p-6 bg-white border border-slate-100 rounded-2xl hover:border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="py-24 bg-slate-50" id="applications">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-100 rounded-full px-4 py-1">Applications</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Specialized for every business need</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">From invoices to resumes, from certificates to HR documents — one platform handles everything.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {apps.map((app, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link href={app.href} className="group block">
                  <div className={`bg-gradient-to-br ${app.bg} rounded-2xl p-6 border border-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        <app.icon className={`w-6 h-6 ${app.color}`} />
                      </div>
                      <ArrowRight className={`w-5 h-5 ${app.color} opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1`} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">{app.name}</h3>
                    <p className="text-sm text-slate-600">{app.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/applications">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl">
                View All Applications <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden" id="about">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Start automating your documents today</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Join thousands of businesses already saving hours every week with DocFlow AI's intelligent document automation platform.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/applications">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 text-base rounded-xl font-semibold">
                  Start Free Trial <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Link href="/applications">
                <Button size="lg" variant="outline" className="border-blue-400 text-white hover:bg-blue-700 px-8 py-6 text-base rounded-xl">
                  View Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={16} />
                </div>
                <span className="text-white font-bold">DocFlow AI</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">AI Powered Business Document Automation Platform for modern enterprises.</p>
              <div className="flex gap-3">
                {['Twitter', 'LinkedIn', 'GitHub'].map((s) => (
                  <div key={s} className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                    <span className="text-xs font-bold">{s[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Applications', 'Templates', 'Pricing', 'Changelog'] },
              { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Press', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security', 'GDPR'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2024 DocFlow AI. All rights reserved.</p>
            <p className="text-sm">Built with Next.js, TypeScript & Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
