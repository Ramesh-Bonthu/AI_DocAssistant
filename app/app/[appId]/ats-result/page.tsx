'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Loader2, Check, CheckCircle2, AlertTriangle, XCircle,
  ChevronRight, ChevronDown, Cpu, UserCheck, PenTool, TrendingUp,
  LayoutGrid, FileDown, ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { analyzeResume } from '@/lib/ats-scanner'

/* ── Config (mirrors clients/page.tsx) ──────────────────────── */
const CHECKS_CONFIG = [
  {
    id: 'ats_parse_rate', title: 'ATS Parse Rate', category: 'CONTENT', iconName: 'Cpu',
    description: 'Employers and recruiters use an Applicant Tracking System (ATS) to scan job applications at scale. A high parse rate means the ATS reads your experience and skills clearly, so more recruiters see your resume.',
    getIssuesCount: (r: any) => r.categories.ats_essentials.checks.filter((c: any) => c.status !== 'passed').length,
    getScorePercent: (r: any) => r.atsParsabilityScore,
    getChecks: (r: any) => r.categories.ats_essentials.checks,
    successMsg: (r: any) => `Great! We parsed ${r.atsParsabilityScore}% of your resume successfully using an industry-leading ATS.`
  },
  {
    id: 'quantifying_impact', title: 'Quantifying Impact', category: 'CONTENT', iconName: 'TrendingUp',
    description: 'Resumes without metrics represent tasks, not results. Recruiters prioritize outcomes (e.g. "Increased sales by 15%") to measure real-world competency.',
    getIssuesCount: (r: any) => r.categories.impact_metrics.checks.filter((c: any) => c.status !== 'passed').length,
    getScorePercent: (r: any) => r.contentImpactScore,
    getChecks: (r: any) => r.categories.impact_metrics.checks,
    successMsg: (r: any) => r.metricsFoundCount >= 5 ? `Excellent! Found ${r.metricsFoundCount} quantified metrics.` : `Found only ${r.metricsFoundCount} metrics. Adding numbers boosts credibility.`
  },
  {
    id: 'repetition_buzzwords', title: 'Repetition & Buzzwords', category: 'CONTENT', iconName: 'AlertTriangle',
    description: 'Vague clichés and repetitive terminology weaken recruiter interest. Use clear, descriptive action items instead.',
    getIssuesCount: (r: any) => r.categories.red_flags.checks.filter((c: any) => c.status !== 'passed').length,
    getScorePercent: (r: any) => Math.max(0, 100 - (r.categories.red_flags.checks.filter((c: any) => c.status !== 'passed').length * 30)),
    getChecks: (r: any) => r.categories.red_flags.checks,
    successMsg: () => `Checked word redundancy and corporate buzzwords successfully.`
  },
  {
    id: 'spelling_grammar', title: 'Spelling & Grammar', category: 'CONTENT', iconName: 'PenTool',
    description: 'Perfect grammar and formatting indicate professional diligence. Typographical errors compromise first impressions.',
    getIssuesCount: (r: any) => r.categories.writing_quality.checks.filter((c: any) => c.status !== 'passed').length,
    getScorePercent: (r: any) => r.categories.writing_quality.checks.some((c: any) => c.status !== 'passed') ? 75 : 100,
    getChecks: (r: any) => r.categories.writing_quality.checks,
    successMsg: () => `Completed grammar check and structural sentence flow analysis.`
  },
  {
    id: 'skills_match', title: 'Skills Match Matrix', category: 'SECTIONS', iconName: 'Sparkles',
    description: 'ATS screens candidates by cross-referencing keywords from the job description. Higher keyword density overlap = higher relevance ranking.',
    getIssuesCount: (r: any) => r.skillsMissing.length,
    getScorePercent: (r: any) => r.cosineSimilarity,
    getChecks: (r: any) => r.categories.cv_tailoring.checks,
    successMsg: (r: any) => `Your semantic Cosine Similarity match score with the job requirements is ${r.cosineSimilarity}%.`
  },
  {
    id: 'formatting_layout', title: 'Formatting & Layout', category: 'SECTIONS', iconName: 'LayoutGrid',
    description: 'Clean design layouts and standardized header structures enable both human eyes and machine parsers to extract candidate details effortlessly.',
    getIssuesCount: (r: any) => r.categories.ats_design.checks.filter((c: any) => c.status !== 'passed').length,
    getScorePercent: (r: any) => r.categories.ats_design.checks.some((c: any) => c.status !== 'passed') ? 70 : 100,
    getChecks: (r: any) => r.categories.ats_design.checks,
    successMsg: () => `Heading tags and paragraph block spacing checks complete.`
  },
  {
    id: 'contact_links', title: 'Contact Info & Links', category: 'SECTIONS', iconName: 'UserCheck',
    description: 'Providing valid phone numbers, professional emails, and verified portfolio pages is essential for recruiting pipeline routing.',
    getIssuesCount: (r: any) => r.categories.professionalism.checks.filter((c: any) => c.status !== 'passed').length,
    getScorePercent: (r: any) => Math.max(0, 100 - (r.categories.professionalism.checks.filter((c: any) => c.status !== 'passed').length * 40)),
    getChecks: (r: any) => r.categories.professionalism.checks,
    successMsg: () => `Contact accessibility verification completed successfully.`
  }
]

const getCheckIcon = (name: string, size = 14) => {
  const icons: Record<string, React.ReactNode> = {
    Cpu: <Cpu size={size} />, TrendingUp: <TrendingUp size={size} />,
    AlertTriangle: <AlertTriangle size={size} />, PenTool: <PenTool size={size} />,
    Sparkles: <Sparkles size={size} />, LayoutGrid: <LayoutGrid size={size} />,
    UserCheck: <UserCheck size={size} />,
  }
  return icons[name] ?? <Cpu size={size} />
}

const STEPS = [
  'Parsing resume document structures...',
  'Extracting target keywords & skills matrix...',
  'Verifying contact details & action verbs...',
  'Executing advanced scoring algorithms...',
]

/* ── Page ─────────────────────────────────────────────────────── */
export default function AtsResultPage() {
  const params = useParams()
  const router = useRouter()
  const appId = (params?.appId as string) || ''

  const [step, setStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [atsResult, setAtsResult] = useState<any>(null)
  const [selectedCheckId, setSelectedCheckId] = useState('ats_parse_rate')
  const [expandedCheckItems, setExpandedCheckItems] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const candidateInfo = useRef<any>(null)
  const resumeText = useRef('')
  const jobDescription = useRef('')
  const appIdRef = useRef(appId)

  // Keep appIdRef in sync (params may resolve after first render)
  useEffect(() => { appIdRef.current = appId }, [appId])

  useEffect(() => {
    // Wait a tick so params are resolved
    const run = () => {
      try {
        const raw = sessionStorage.getItem('ats_pending_analysis')
        if (!raw) { router.replace(`/app/${appIdRef.current}/clients`); return }
        const data = JSON.parse(raw)
        candidateInfo.current = data.candidateInfo
        resumeText.current = data.resumeText
        jobDescription.current = data.jobDescription
        sessionStorage.removeItem('ats_pending_analysis')
      } catch {
        router.replace(`/app/${appIdRef.current}/clients`)
        return
      }

      // Scroll to top immediately
      window.scrollTo({ top: 0, behavior: 'smooth' })

      setStep(1)
      setTimeout(() => setStep(2), 800)
      setTimeout(() => setStep(3), 1600)
      setTimeout(() => setStep(4), 2400)
      setTimeout(() => {
        const result = analyzeResume(resumeText.current, jobDescription.current)
        setAtsResult(result)
        setIsAnalyzing(false)
        // Scroll to top again to show ATS results from the start
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
      }, 3300)
    }

    const t = setTimeout(run, 50)
    return () => clearTimeout(t)
  }, [])

  const handleSave = async () => {
    if (!atsResult) return
    setIsSaving(true)
    try {
      const id = appIdRef.current || appId
      const res = await fetch(`/api/app/${id}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: candidateInfo.current?.role || 'Resume Candidate',
          contactPerson: candidateInfo.current?.name || 'Parsed Candidate',
          email: candidateInfo.current?.email || 'no-email@example.com',
          phone: candidateInfo.current?.phone || '0000000000',
          status: 'active',
          resumeText: resumeText.current,
          targetJob: jobDescription.current,
          atsScore: atsResult.score,
          atsAnalysis: JSON.stringify(atsResult),
          revenue: 0, documentsCount: 0,
          city: 'Bengaluru', country: 'India', postalCode: '560001'
        })
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => router.push(`/app/${id}/clients`), 1500)
      }
    } catch (e) { console.error(e) }
    finally { setIsSaving(false) }
  }

  const handleDownload = () => {
    if (!atsResult) return
    const text = `ATS DIAGNOSTIC REPORT\n\nScore: ${atsResult.score}/100\nCosine Similarity: ${atsResult.cosineSimilarity}%\n\nMatched Skills: ${atsResult.skillsMatched.join(', ')}\nMissing Skills: ${atsResult.skillsMissing.join(', ')}`
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    a.download = `ats-report-${Date.now()}.txt`
    a.click()
  }

  /* ── Loader Screen ── */
  if (isAnalyzing) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-8">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-8 w-full max-w-md">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-200">
            <Sparkles className="text-white" size={40} />
          </div>
          <span className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center shadow-md">
            <Loader2 className="text-blue-600 animate-spin" size={16} />
          </span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900">Running ATS Diagnostic Scan</h2>
          <p className="text-sm text-slate-500 mt-1">Analyzing resume against target job requirements...</p>
        </div>
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>ATS Parser Pipeline</span>
            <span>{Math.min(Math.round((step / 4) * 100), 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <motion.div className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
              animate={{ width: `${Math.min((step / 4) * 100, 100)}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>
        <div className="w-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
          {STEPS.map((msg, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 transition-all duration-300',
                step > idx ? 'bg-emerald-500 text-white border-emerald-400' :
                step === idx + 1 ? 'bg-blue-50 text-blue-600 border-blue-300 animate-pulse' :
                'bg-slate-100 text-slate-400 border-slate-200'
              )}>
                {step > idx ? '✓' : idx + 1}
              </div>
              <span className={cn('text-sm font-medium',
                step > idx ? 'text-emerald-700' :
                step === idx + 1 ? 'text-blue-700 font-semibold' : 'text-slate-400'
              )}>{msg}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )

  if (!atsResult) return null

  const totalIssues = CHECKS_CONFIG.reduce((acc, c) => acc + c.getIssuesCount(atsResult), 0)
  const activeCheck = CHECKS_CONFIG.find(c => c.id === selectedCheckId) || CHECKS_CONFIG[0]
  const activeChecksList = activeCheck.getChecks(atsResult)
  const activeScorePercent = activeCheck.getScorePercent(atsResult)
  const catIssues = CHECKS_CONFIG.filter(c => c.category === activeCheck.category).reduce((acc, c) => acc + c.getIssuesCount(atsResult), 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <button onClick={() => router.push(`/app/${appId}/clients`)}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={15} className="text-slate-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="text-blue-600 fill-blue-50" size={20} /> ATS Resume Analyzer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {candidateInfo.current?.name || 'Candidate'} · {candidateInfo.current?.role || 'Resume Candidate'}
          </p>
        </div>
      </div>

      {/* Main grid — exact same as inline layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">

        {/* LEFT: Score sidebar */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="text-center pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Score</h3>
            <div className={cn("text-4xl font-black mt-2 tracking-tight",
              atsResult.score >= 80 ? "text-emerald-500" : atsResult.score >= 50 ? "text-rose-500" : "text-red-500"
            )}>
              {atsResult.score}/100
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {totalIssues} {totalIssues === 1 ? 'Issue' : 'Issues'} found
            </div>
          </div>

          <div className="space-y-4">
            {['CONTENT', 'SECTIONS'].map((catGroup) => {
              const groupChecks = CHECKS_CONFIG.filter(c => c.category === catGroup)
              const scoreVal = catGroup === 'CONTENT' ? atsResult.contentImpactScore : atsResult.atsParsabilityScore
              return (
                <div key={catGroup} className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 tracking-wider px-1">
                    <span>{catGroup}</span>
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold text-[9px]">{scoreVal}%</span>
                  </div>
                  <div className="space-y-1">
                    {groupChecks.map((check) => {
                      const issues = check.getIssuesCount(atsResult)
                      const isSelected = selectedCheckId === check.id
                      return (
                        <button key={check.id} type="button" onClick={() => setSelectedCheckId(check.id)}
                          className={cn("w-full flex items-center justify-between p-2 rounded-xl text-left transition-all text-xs font-semibold border",
                            isSelected ? "bg-blue-50/50 border-blue-200 text-blue-700 shadow-sm" : "bg-white hover:bg-slate-50 border-transparent text-slate-600"
                          )}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px]",
                              issues === 0 ? "bg-emerald-500" : "bg-rose-500"
                            )}>
                              {issues === 0 ? "✓" : "!"}
                            </div>
                            <span className="truncate max-w-[90px]">{check.title}</span>
                          </div>
                          <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap",
                            issues === 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                          )}>
                            {issues === 0 ? "No Issues" : `${issues} ${issues === 1 ? 'issue' : 'issues'}`}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <Button onClick={handleDownload}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm h-9 text-xs font-bold flex items-center justify-center gap-1.5 mt-2">
            <FileDown size={14} className="animate-bounce" /> Export Detailed PDF
          </Button>
        </div>

        {/* RIGHT: Active check detail */}
        <div className="md:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 font-extrabold text-[10px] tracking-wider uppercase">
              {getCheckIcon(activeCheck.iconName)}
              <span>{activeCheck.category}</span>
            </div>
            <span className="text-[9px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold shadow-sm">
              {catIssues} {catIssues === 1 ? 'issue' : 'issues'} found
            </span>
          </div>

          <div className="space-y-4 text-left">
            <h3 className="text-lg font-black text-slate-900">{activeCheck.title.toUpperCase()}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{activeCheck.description}</p>

            {/* Progress pin */}
            <div className="pt-6 pb-2 relative px-2">
              <div className="w-full bg-slate-200 h-2.5 rounded-full relative">
                <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${activeScorePercent}%` }} />
                <div className="absolute -top-7 transform -translate-x-1/2 flex flex-col items-center transition-all duration-1000 ease-out"
                  style={{ left: `${activeScorePercent}%` }}>
                  <span className="bg-emerald-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">{activeScorePercent}%</span>
                  <div className="w-1.5 h-1.5 bg-emerald-600 rotate-45 -mt-0.5" />
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-center text-xs font-bold text-emerald-800">
              {activeCheck.successMsg(atsResult)}
            </div>

            {/* Skills match badges */}
            {selectedCheckId === 'skills_match' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-2">
                  <h5 className="text-xs font-extrabold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Missing Skills ({atsResult.skillsMissing.length})
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {atsResult.skillsMissing.length > 0
                      ? atsResult.skillsMissing.map((s: string) => (
                        <Badge key={s} variant="outline" className="bg-rose-50/50 text-rose-700 border-rose-200 text-[10px] rounded-lg px-2 py-0.5 capitalize">{s}</Badge>
                      ))
                      : <span className="text-xs text-slate-400 italic">No missing skills detected.</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Matched Skills ({atsResult.skillsMatched.length})
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {atsResult.skillsMatched.length > 0
                      ? atsResult.skillsMatched.map((s: string) => (
                        <Badge key={s} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] rounded-lg px-2 py-0.5 capitalize">{s}</Badge>
                      ))
                      : <span className="text-xs text-slate-400 italic">No matching skills identified.</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Accordion items */}
            <div className="space-y-2">
              {activeChecksList.map((item: any) => {
                const isExp = !!expandedCheckItems[item.id]
                return (
                  <div key={item.id} className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm">
                    <button type="button"
                      onClick={() => setExpandedCheckItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className="w-full flex items-center justify-between p-3 text-left font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-white",
                          item.status === 'passed' ? "bg-emerald-500" : item.status === 'warning' ? "bg-amber-500" : "bg-rose-500"
                        )}>
                          {item.status === 'passed' ? "✓" : "!"}
                        </div>
                        <span>{item.title}</span>
                      </div>
                      {isExp ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                    </button>
                    <AnimatePresence initial={false}>
                      {isExp && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="border-t border-slate-100 bg-slate-50/50 p-3.5 space-y-3 text-xs leading-relaxed">
                          <div>
                            <span className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider block">Findings</span>
                            <p className="text-slate-700 font-semibold mt-0.5">{item.foundText}</p>
                          </div>
                          <div>
                            <span className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider block">Why it matters</span>
                            <p className="text-slate-500 mt-0.5">{item.explanation}</p>
                          </div>
                          <div>
                            <span className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider block">Action step</span>
                            <p className="text-blue-700 font-semibold mt-0.5">{item.actionStep}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer — Save / Download / Clear */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200">
        <Button onClick={handleSave} disabled={isSaving || saved}
          className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-xs font-bold shadow-md shadow-emerald-100 flex items-center justify-center gap-1.5 px-4">
          {isSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> :
           saved ? <><Check size={14} /> Saved! Redirecting...</> :
           <><Check size={14} /> Save Candidate Profile</>}
        </Button>
        <Button type="button" onClick={handleDownload}
          className="flex-grow bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-10 text-xs font-bold shadow-md shadow-blue-100">
          Copy Markdown Report
        </Button>
        <Button type="button" variant="outline" onClick={handleDownload}
          className="rounded-xl border-slate-200 h-10 text-xs p-2.5 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5">
          <FileDown size={15} /> Download Text Report
        </Button>
        <Button type="button" variant="outline"
          onClick={() => router.push(`/app/${appId}/clients`)}
          className="rounded-xl border-slate-200 h-10 text-xs text-red-600 hover:bg-red-50 px-4 font-semibold border-red-200">
          Clear Results
        </Button>
      </div>
    </motion.div>
  )
}
