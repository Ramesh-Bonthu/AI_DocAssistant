'use client'

// Force rebuild to sync card enhancements
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, LayoutGrid, List, ArrowRight,
  Mail, Phone, Building2, FileText, Check, Loader2, Edit, ExternalLink,
  Sparkles, UploadCloud, CheckCircle2, AlertTriangle, XCircle, RefreshCw, FileDown, Info, ChevronRight, ChevronDown, UserCircle,
  Cpu, UserCheck, PenTool, TrendingUp, Trash2
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
import { cn } from '@/lib/utils'
import { analyzeResume, calculateCosineSimilarity } from '@/lib/ats-scanner'

const CLIENT_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
  'bg-indigo-500', 'bg-green-500', 'bg-red-500', 'bg-pink-500',
]

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode }> = {
  ats_essentials: { label: 'ATS Essentials', icon: <Cpu size={14} /> },
  ats_design: { label: 'ATS Design', icon: <LayoutGrid size={14} /> },
  cv_tailoring: { label: 'CV Tailoring', icon: <Sparkles size={14} /> },
  professionalism: { label: 'Professionalism', icon: <UserCheck size={14} /> },
  writing_quality: { label: 'Writing Quality', icon: <PenTool size={14} /> },
  impact_metrics: { label: 'Impact & Metrics', icon: <TrendingUp size={14} /> },
  red_flags: { label: 'Red Flags', icon: <AlertTriangle size={14} /> }
}

const CHECKS_CONFIG = [
  {
    id: 'ats_parse_rate',
    title: 'ATS Parse Rate',
    category: 'CONTENT',
    iconName: 'Cpu',
    description: 'Employers and recruiters use an Applicant Tracking System (ATS) to scan job applications at scale. A high parse rate means the ATS reads your experience and skills clearly, so more recruiters see your resume.',
    getIssuesCount: (res: any) => {
      let count = 0;
      res.categories.ats_essentials.checks.forEach((c: any) => {
        if (c.status !== 'passed') count++;
      });
      return count;
    },
    getScorePercent: (res: any) => res.atsParsabilityScore,
    getChecks: (res: any) => res.categories.ats_essentials.checks,
    successMsg: (res: any) => `Great! We parsed ${res.atsParsabilityScore}% of your resume successfully using an industry-leading ATS.`
  },
  {
    id: 'quantifying_impact',
    title: 'Quantifying Impact',
    category: 'CONTENT',
    iconName: 'TrendingUp',
    description: 'Resumes without metrics represent tasks, not results. Recruiters prioritize outcomes (e.g. "Increased sales by 15%", "Optimized database speeds by 40%") to measure real-world competency.',
    getIssuesCount: (res: any) => {
      let count = 0;
      res.categories.impact_metrics.checks.forEach((c: any) => {
        if (c.status !== 'passed') count++;
      });
      return count;
    },
    getScorePercent: (res: any) => res.contentImpactScore,
    getChecks: (res: any) => res.categories.impact_metrics.checks,
    successMsg: (res: any) => res.metricsFoundCount >= 5 
      ? `Excellent! Found ${res.metricsFoundCount} quantified metrics in your descriptions.`
      : `Found only ${res.metricsFoundCount} metrics. Adding concrete numbers boosts credibility.`
  },
  {
    id: 'repetition_buzzwords',
    title: 'Repetition & Buzzwords',
    category: 'CONTENT',
    iconName: 'AlertTriangle',
    description: 'Vague clichés (like "go-getter" or "synergy") and repetitive terminology weaken recruiter interest. Use clear, descriptive action items instead.',
    getIssuesCount: (res: any) => {
      let count = 0;
      res.categories.red_flags.checks.forEach((c: any) => {
        if (c.status !== 'passed') count++;
      });
      return count;
    },
    getScorePercent: (res: any) => {
      const issues = res.categories.red_flags.checks.filter((c: any) => c.status !== 'passed').length;
      return Math.max(0, 100 - (issues * 30));
    },
    getChecks: (res: any) => res.categories.red_flags.checks,
    successMsg: (res: any) => `Checked word redundancy and corporate buzzwords successfully.`
  },
  {
    id: 'spelling_grammar',
    title: 'Spelling & Grammar',
    category: 'CONTENT',
    iconName: 'PenTool',
    description: 'Perfect grammar and formatting indicate professional diligence. Typographical errors and run-on sentences compromise first impressions.',
    getIssuesCount: (res: any) => {
      let count = 0;
      res.categories.writing_quality.checks.forEach((c: any) => {
        if (c.status !== 'passed') count++;
      });
      return count;
    },
    getScorePercent: (res: any) => {
      const hasIssue = res.categories.writing_quality.checks.some((c: any) => c.status !== 'passed');
      return hasIssue ? 75 : 100;
    },
    getChecks: (res: any) => res.categories.writing_quality.checks,
    successMsg: (res: any) => `Completed grammar check and structural sentence flow analysis.`
  },
  {
    id: 'skills_match',
    title: 'Skills Match Matrix',
    category: 'SECTIONS',
    iconName: 'Sparkles',
    description: 'Applicant Tracking Systems screen candidates by cross-referencing keywords from the job description. The higher your keyword density overlap, the higher your relevance matching rank.',
    getIssuesCount: (res: any) => res.skillsMissing.length,
    getScorePercent: (res: any) => res.cosineSimilarity,
    getChecks: (res: any) => res.categories.cv_tailoring.checks,
    successMsg: (res: any) => `Your semantic Cosine Similarity match score with the job requirements is ${res.cosineSimilarity}%.`
  },
  {
    id: 'formatting_layout',
    title: 'Formatting & Layout',
    category: 'SECTIONS',
    iconName: 'LayoutGrid',
    description: 'Clean design layouts and standardized header structures enable both human eyes and machine parsers to extract candidate details effortlessly.',
    getIssuesCount: (res: any) => {
      let count = 0;
      res.categories.ats_design.checks.forEach((c: any) => {
        if (c.status !== 'passed') count++;
      });
      return count;
    },
    getScorePercent: (res: any) => {
      const hasIssue = res.categories.ats_design.checks.some((c: any) => c.status !== 'passed');
      return hasIssue ? 70 : 100;
    },
    getChecks: (res: any) => res.categories.ats_design.checks,
    successMsg: (res: any) => `Heading tags and paragraph block spacing checks complete.`
  },
  {
    id: 'contact_links',
    title: 'Contact Info & Links',
    category: 'SECTIONS',
    iconName: 'UserCheck',
    description: 'Providing valid phone numbers, professional emails, and verified online portfolio pages (e.g. LinkedIn, GitHub) is essential for recruiting pipeline routing.',
    getIssuesCount: (res: any) => {
      let count = 0;
      res.categories.professionalism.checks.forEach((c: any) => {
        if (c.status !== 'passed') count++;
      });
      return count;
    },
    getScorePercent: (res: any) => {
      const issues = res.categories.professionalism.checks.filter((c: any) => c.status !== 'passed').length;
      return Math.max(0, 100 - (issues * 40));
    },
    getChecks: (res: any) => res.categories.professionalism.checks,
    successMsg: (res: any) => `Contact accessibility verification completed successfully.`
  }
]

const getCheckIcon = (name: string, size = 14) => {
  switch (name) {
    case 'Cpu': return <Cpu size={size} />
    case 'TrendingUp': return <TrendingUp size={size} />
    case 'AlertTriangle': return <AlertTriangle size={size} />
    case 'PenTool': return <PenTool size={size} />
    case 'Sparkles': return <Sparkles size={size} />
    case 'LayoutGrid': return <LayoutGrid size={size} />
    case 'UserCheck': return <UserCheck size={size} />
    default: return <Cpu size={size} />
  }
}

const findSentenceContaining = (text: string, keyword: string): string => {
  if (!text) return 'Mentioned in skills list.'
  const cleanKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const sentences = text.split(/[.!?]\s+/)
  const match = sentences.find((s) => new RegExp(`\\b${cleanKeyword}\\b`, 'i').test(s))
  return match ? `"${match.trim()}."` : 'Mentioned in skills list.'
}

const highlightResumeText = (text: string, matched: string[]) => {
  if (!text) return <p className="text-slate-400 italic">No resume content available.</p>
  const lines = text.split('\n')
  return (
    <div className="space-y-2 font-sans text-[11px] text-slate-800 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={idx} className="h-1.5" />
        const isHeader = /^(work experience|experience|education|skills|summary|projects|certifications|contact)/i.test(trimmed) && trimmed.length < 35
        if (isHeader) {
          return (
            <h4 key={idx} className="text-xs font-black text-slate-900 border-b border-slate-100 pb-0.5 pt-2 uppercase tracking-wider">
              {trimmed}
            </h4>
          )
        }
        let highlightedElement: React.ReactNode = trimmed
        matched.forEach((keyword) => {
          const cleanKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
          const regex = new RegExp(`\\b(${cleanKeyword})\\b`, 'gi')
          if (regex.test(trimmed)) {
            const parts = trimmed.split(new RegExp(`\\b(${cleanKeyword})\\b`, 'i'))
            highlightedElement = parts.map((part, pIdx) => {
              if (part.toLowerCase() === keyword.toLowerCase()) {
                return (
                  <span key={pIdx} className="bg-emerald-100/90 text-emerald-800 border border-emerald-200/50 px-1 py-0.5 rounded font-bold mx-0.5">
                    {part}
                  </span>
                )
              }
              return part
            })
          }
        })
        return <p key={idx} className="text-slate-700">{highlightedElement}</p>
      })}
    </div>
  )
}


interface ClientItem {
  id: string
  company: string
  contactPerson: string
  email: string
  phone: string
  gstNumber: string
  address: string
  city: string
  country: string
  postalCode: string
  paymentTerms: string
  notes: string
  logo: string
  documentsCount: number
  status: 'active' | 'inactive'
  revenue: number
  createdAt: string
  resumeText?: string
  targetJob?: string
  atsScore?: number | null
  atsAnalysis?: string | null
}

const DEMO_RESUMES = {
  priya: `Priya Nair
priya@email.com | +91 87654 32109 | LinkedIn

Professional Summary:
Experienced software engineer with 6+ years building scalable web applications using React, Node.js, and AWS. Passionate about clean code and user experience.

Work Experience:
Senior Frontend Engineer — GlobalEdge Consulting (2021–Present)
- Led a team of 5 engineers to rebuild the core platform, increasing user retention by 25%.
- Reduced page load time by 60% through bundle optimization, code splitting, and caching.
- Implemented CI/CD pipeline with GitHub Actions, achieving 99.9% uptime.
- Collaborated with product owners to deliver key features in Agile environment.

Software Engineer — TechNova Solutions (2018–2021)
- Developed and launched 3 web applications using React, TypeScript, and PostgreSQL.
- Streamlined state management, reducing code complexity by 30%.
- Integrated REST APIs and GraphQL endpoints for real-time dashboard data.

Education:
B.Tech Computer Science — NIT Calicut (2017)

Skills:
React, Next.js, TypeScript, JavaScript, Node.js, PostgreSQL, AWS, Docker, Git, Agile, system design, UI/UX, communication, leadership`,

  intern: `Vishnu Vardhan
email: vishnu@email.com

Objective:
Looking for an internship in software development to learn new skills.

Projects:
Student Portal Website
- Made a simple website for college using HTML and CSS.
- Stored user names in a basic database.
- Worked on simple UI designs.

Education:
B.Tech Student (3rd Year)

Skills:
HTML, CSS, basic JavaScript`
}

const parsePdfText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
      try {
        const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'] || (window as any)['pdfjsLib'];
        if (!pdfjsLib) {
          throw new Error('PDF.js library not loaded yet');
        }
        
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        }

        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        resolve(fullText);
      } catch (err) {
        console.error('PDF parsing error:', err);
        reject(err);
      }
    };
    fileReader.onerror = () => reject(new Error('File reading failed'));
    fileReader.readAsArrayBuffer(file);
  });
};

const extractCandidateDetails = (text: string) => {
  // Find email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // Find phone
  const phoneMatch = text.match(/(?:\+91[\-\s]?)?[6-9]\d{9}/) || text.match(/(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Find name: split by line break, look for the first non-empty line that doesn't contain common words
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let name = '';
  for (const line of lines) {
    if (line.length < 3) continue;
    // Skip common header words
    if (/curriculum|vitae|resume|cv|summary|profile|about|details/i.test(line)) continue;
    // The line must contain at least 2 words and not exceed 5 words
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 5) {
      name = line;
      break;
    }
  }
  if (!name) name = 'Parsed Candidate';

  return { name, email, phone };
};

export default function ClientsPage() {
  const params = useParams()
  const appId = params?.appId as string
  const router = useRouter()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const [userRole, setUserRole] = useState<string>('Super Admin')

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (role) setUserRole(role)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('add') === 'true') {
        setShowModal(true)
      }
    }
  }, [])

  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showModal, setShowModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null)
  const [clients, setClients] = useState<ClientItem[]>([])
  const [sortBy, setSortBy] = useState('name')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  const [isEdit, setIsEdit] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null)

  const handleEditClient = (client: ClientItem) => {
    setIsEdit(true)
    setEditingClient(client)
    setValue('company', client.company)
    setValue('contactPerson', client.contactPerson)
    setValue('email', client.email)
    setValue('phone', client.phone)
    setValue('gstNumber', client.gstNumber || 'None')
    setValue('address', client.address || 'Address')
    setValue('city', client.city || 'Bengaluru')
    setValue('country', client.country || 'India')
    setValue('postalCode', client.postalCode || '560001')
    setValue('paymentTerms', client.paymentTerms || 'Net 30')
    setValue('notes', client.notes || '')
    setValue('status', client.status || 'active')
    setValue('revenue', client.revenue || 0)
    setShowModal(true)
  }

  const handleDeleteClient = async (id: string) => {
    const isCandidate = appId === 'resume-analyzer'
    const confirmMsg = isCandidate 
      ? 'Are you sure you want to delete this candidate profile?' 
      : 'Are you sure you want to delete this client?'
    if (!confirm(confirmMsg)) return

    try {
      const res = await fetch(`/api/app/${appId}/clients/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== id))
        if (selectedClient?.id === id) {
          setSelectedClient(null)
          setAtsResult(null)
        }
      } else {
        alert(isCandidate ? 'Failed to delete candidate' : 'Failed to delete client')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred while deleting')
    }
  }


  // ATS Resume Analyzer States
  const [activeDialogTab, setActiveDialogTab] = useState<'profile' | 'resume'>('profile')
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('Senior Software Engineer with experience in React, TypeScript, and Node.js. Must know Docker, SQL, and AWS. Strong team leadership and problem-solving skills required.')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [atsResult, setAtsResult] = useState<any>(null)
  const [isSavingResume, setIsSavingResume] = useState(false)
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('ats_essentials')
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null)
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [auditorTab, setAuditorTab] = useState<'skills' | 'technical' | 'impact'>('skills')
  const [selectedCheckId, setSelectedCheckId] = useState('ats_parse_rate')
  const [expandedCheckItems, setExpandedCheckItems] = useState<Record<string, boolean>>({
    'sections_check': true,
    'keyword_coverage': true,
    'quantified_metrics': true,
    'buzzwords_cliches': true,
    'wordiness_check': true,
    'heading_labels': true,
    'contact_info': true
  })

  // Drag and Drop PDF Parsing States
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [extractingText, setExtractingText] = useState(false)
  const [parsedDetails, setParsedDetails] = useState<{ name: string; email: string; phone: string }>({ name: '', email: '', phone: '' })
  const [currentCandidateInfo, setCurrentCandidateInfo] = useState<{
    name: string;
    email: string;
    phone: string;
    role: string;
  }>({ name: '', email: '', phone: '', role: '' })
  const [candidateJobDesc, setCandidateJobDesc] = useState('Senior Software Engineer with experience in React, TypeScript, and Node.js. Must know Docker, SQL, and AWS. Strong team leadership and problem-solving skills required.')
  const [candidateRole, setCandidateRole] = useState('')
  const [isSavingCandidate, setIsSavingCandidate] = useState(false)
  const [isAnalyzingCandidate, setIsAnalyzingCandidate] = useState(false)
  const [analysisModalStep, setAnalysisModalStep] = useState(0)

  // Inject PDF.js script tag dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = 'pdfjs-script-cdn'
      if (document.getElementById(id)) return
      const script = document.createElement('script')
      script.id = id
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  // Track if modal is closing because analysis is starting (not cancelling)
  const isLaunchingAnalysis = useRef(false)
  const pageTopRef = useRef<HTMLDivElement>(null)

  // Reset upload states when modal closes (but not when launching analysis)
  useEffect(() => {
    if (!showModal && !isLaunchingAnalysis.current) {
      setUploadedFile(null)
      setExtractedText('')
      setExtractingText(false)
      setParsedDetails({ name: '', email: '', phone: '' })
      setCandidateRole('')
      setIsAnalyzingCandidate(false)
      setAnalysisModalStep(0)
    }
    isLaunchingAnalysis.current = false
  }, [showModal])

  // Load resume data when a client is selected
  useEffect(() => {
    if (selectedClient) {
      setResumeText(selectedClient.resumeText || '')
      setJobDescription(selectedClient.targetJob || 'Senior Software Engineer with experience in React, TypeScript, and Node.js. Must know Docker, SQL, and AWS. Strong team leadership and problem-solving skills required.')
      
      const savedAnalysis = selectedClient.atsAnalysis
      if (savedAnalysis) {
        try {
          setAtsResult(typeof savedAnalysis === 'string' ? JSON.parse(savedAnalysis) : savedAnalysis)
        } catch (e) {
          console.error('Error parsing saved ATS analysis:', e)
          setAtsResult(null)
        }
      } else {
        setAtsResult(null)
      }
    }
  }, [selectedClient])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setResumeText(text)
    }
    reader.readAsText(file)
  }

  const handleResumeFileSelect = async (file: File) => {
    setUploadedFile(file)
    setExtractingText(true)
    try {
      let text = ''
      if (file.type === 'application/pdf') {
        text = await parsePdfText(file)
      } else {
        // Fallback for text files
        text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = () => reject(new Error('Failed to read text file'))
          reader.readAsText(file)
        })
      }

      setExtractedText(text)
      const details = extractCandidateDetails(text)
      setParsedDetails(details)
      // Auto-set default role
      const filenameNoExt = file.name.replace(/\.[^/.]+$/, "")
      setCandidateRole(filenameNoExt.includes('-') ? filenameNoExt.split('-')[1].trim() : 'Software Engineer Candidate')
    } catch (err) {
      console.error('Failed to extract text from resume:', err)
      setExtractedText(`[Text extracted from ${file.name}]`)
      setParsedDetails({
        name: file.name.replace(/\.[^/.]+$/, ""),
        email: '',
        phone: ''
      })
      setCandidateRole('Candidate Profile')
    } finally {
      setExtractingText(false)
    }
  }

  const handleSaveNewCandidate = async () => {
    setIsSavingResume(true)
    try {
      const payload = {
        company: currentCandidateInfo.role || 'Resume Candidate',
        contactPerson: currentCandidateInfo.name || 'Parsed Candidate',
        email: currentCandidateInfo.email || 'no-email@example.com',
        phone: currentCandidateInfo.phone || '0000000000',
        status: 'active',
        resumeText: resumeText,
        targetJob: jobDescription,
        atsScore: atsResult ? atsResult.score : null,
        atsAnalysis: atsResult ? JSON.stringify(atsResult) : null,
        revenue: 0,
        documentsCount: 0,
        city: 'Bengaluru',
        country: 'India',
        postalCode: '560001'
      }

      const res = await fetch(`/api/app/${appId}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const newCandidate = await res.json()
        setClients(prev => [...prev, newCandidate])
        setSelectedClient(newCandidate)
        alert('Candidate profile saved successfully!')
      } else {
        alert('Failed to save candidate to the database.')
      }
    } catch (err) {
      console.error('Error saving candidate:', err)
      alert('Error saving candidate details.')
    } finally {
      setIsSavingResume(false)
    }
  }

  const handleStartModalAnalysis = () => {
    const textToAnalyze = extractedText || 'No Resume Text'
    const jdToAnalyze = candidateJobDesc
    const candidateName = parsedDetails.name || uploadedFile?.name?.replace(/\.[^/.]+$/, '') || 'Parsed Candidate'

    // Store data for the dedicated ATS result page
    sessionStorage.setItem('ats_pending_analysis', JSON.stringify({
      resumeText: textToAnalyze,
      jobDescription: jdToAnalyze,
      candidateInfo: {
        name: candidateName,
        email: parsedDetails.email || 'no-email@example.com',
        phone: parsedDetails.phone || '0000000000',
        role: candidateRole || 'Resume Candidate'
      }
    }))

    // Guard modal-close reset effect
    isLaunchingAnalysis.current = true
    setShowModal(false)

    // Navigate to dedicated ATS result page
    router.push(`/app/${appId}/ats-result`)
  }

  const handleAnalyzeResume = () => {
    if (!resumeText.trim()) return

    setIsAnalyzing(true)
    setAnalysisStep(1) // "Parsing resume content..."

    setTimeout(() => {
      setAnalysisStep(2) // "Extracting details & sections..."
      setTimeout(() => {
        setAnalysisStep(3) // "Matching keywords & metrics..."
        setTimeout(() => {
          setAnalysisStep(4) // "Calculating professional ATS score..."
          setTimeout(() => {
            const result = analyzeResume(resumeText, jobDescription)
            setAtsResult(result)
            setIsAnalyzing(false)
            setAnalysisStep(0)
          }, 800)
        }, 800)
      }, 800)
    }, 800)
  }

  const handleSaveResume = async () => {
    if (!selectedClient) return
    setIsSavingResume(true)
    try {
      const res = await fetch(`/api/app/${appId}/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedClient,
          resumeText,
          targetJob: jobDescription,
          atsScore: atsResult ? atsResult.score : null,
          atsAnalysis: atsResult ? JSON.stringify(atsResult) : null
        })
      })

      if (res.ok) {
        const updated = await res.json()
        setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, ...updated } : c))
        setSelectedClient(prev => prev ? { ...prev, ...updated } : null)
        alert('Resume details and ATS evaluation scores saved successfully!')
      } else {
        alert('Failed to save resume details.')
      }
    } catch (e) {
      console.error('Error saving resume:', e)
      alert('Error saving resume details.')
    } finally {
      setIsSavingResume(false)
    }
  }

  const handleCopyReport = () => {
    if (!atsResult) return
    const categories = atsResult.categories || {}
    let md = `
# ATS Resume Evaluation Report
**Candidate**: ${selectedClient?.contactPerson || 'N/A'}
**Company / Client**: ${selectedClient?.company || 'N/A'}
**Target Job Description**: ${jobDescription}

## Combined Overall Score: ${atsResult.score}/100
- **ATS Technical Parsability**: ${atsResult.atsParsabilityScore || 0}/100
- **Content & Recruiter Impact**: ${atsResult.contentImpactScore || 0}/100
- **Semantic Vector Match (Cosine Similarity)**: ${atsResult.cosineSimilarity !== undefined ? `${atsResult.cosineSimilarity}%` : 'N/A'}
`
    const categoryNames: Record<string, string> = {
      ats_essentials: 'ATS Essentials',
      ats_design: 'ATS-Friendly Design',
      cv_tailoring: 'CV Content & Tailoring',
      professionalism: 'Professionalism & Formatting',
      writing_quality: 'Writing Quality',
      impact_metrics: 'Impact & Metrics',
      red_flags: 'Strategy & Red Flags'
    }

    Object.entries(categoryNames).forEach(([key, label]) => {
      const cat = categories[key]
      if (cat && cat.checks && cat.checks.length > 0) {
        md += `\n### ${label}\n`
        cat.checks.forEach((check: any) => {
          const icon = check.status === 'passed' ? '✅' : check.status === 'warning' ? '⚠️' : '❌'
          md += `#### ${icon} ${check.title} (${check.status.toUpperCase()})\n`
          md += `- **Findings**: ${check.foundText}\n`
          md += `- **Why it matters**: ${check.explanation}\n`
          md += `- **Action Step**: ${check.actionStep}\n\n`
        })
      }
    })

    navigator.clipboard.writeText(md.trim())
    alert('ATS Report copied to clipboard in Markdown format!')
  }

  const handleDownloadReport = () => {
    if (!atsResult) return
    const categories = atsResult.categories || {}
    let md = `
# ATS Resume Evaluation Report
**Candidate**: ${selectedClient?.contactPerson || 'N/A'}
**Target Job / Position**: ${selectedClient?.company || 'N/A'}
**Target Job Description**: ${jobDescription}

## ATS Match Score: ${atsResult.score}/100
- **ATS Technical Parsability**: ${atsResult.atsParsabilityScore || 0}/100
- **Content & Recruiter Impact**: ${atsResult.contentImpactScore || 0}/100
- **Semantic Vector Match (Cosine Similarity)**: ${atsResult.cosineSimilarity !== undefined ? `${atsResult.cosineSimilarity}%` : 'N/A'}
`
    const categoryNames: Record<string, string> = {
      ats_essentials: 'ATS Essentials',
      ats_design: 'ATS-Friendly Design',
      cv_tailoring: 'CV Content & Tailoring',
      professionalism: 'Professionalism & Formatting',
      writing_quality: 'Writing Quality',
      impact_metrics: 'Impact & Metrics',
      red_flags: 'Strategy & Red Flags'
    }

    Object.entries(categoryNames).forEach(([key, label]) => {
      const cat = categories[key]
      if (cat && cat.checks && cat.checks.length > 0) {
        md += `\n### ${label}\n`
        cat.checks.forEach((check: any) => {
          const icon = check.status === 'passed' ? '✅' : check.status === 'warning' ? '⚠️' : '❌'
          md += `#### ${icon} ${check.title} (${check.status.toUpperCase()})\n`
          md += `- **Findings**: ${check.foundText}\n`
          md += `- **Why it matters**: ${check.explanation}\n`
          md += `- **Action Step**: ${check.actionStep}\n\n`
        })
      }
    })

    const blob = new Blob([md.trim()], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${(selectedClient?.contactPerson || 'Candidate').replace(/\s+/g, '_')}_ATS_Report.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (appId !== 'resume-analyzer' && userRole !== 'Super Admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-2">
          <Building2 size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          You do not have the required permissions to view the Clients database. Please contact a Super Admin if you believe this is an error.
        </p>
      </div>
    )
  }

  useEffect(() => {
    if (!appId) return
    
    setLoading(true)
    fetch(`/api/app/${appId}/clients`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch clients')
        return res.json()
      })
      .then((data) => {
        setClients(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [appId])

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

  const onSubmit = async (data: any) => {
    try {
      if (isEdit && editingClient) {
        const res = await fetch(`/api/app/${appId}/clients/${editingClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (res.ok) {
          const updated = await res.json()
          setClients((prev) => prev.map((c) => c.id === editingClient.id ? { ...c, ...updated } : c))
          setShowModal(false)
          setEditingClient(null)
          setIsEdit(false)
          reset()
        } else {
          console.error('Failed to update client in database')
        }
      } else {
        const res = await fetch(`/api/app/${appId}/clients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (res.ok) {
          const newClient = await res.json()
          setClients((prev) => [...prev, newClient])
          setShowModal(false)
          reset()
        } else {
          console.error('Failed to create client in database')
        }
      }
    } catch (err) {
      console.error('Error saving client:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading clients...</p>
      </div>
    )
  }

  return (
    <>
      {appId === 'resume-analyzer' ? (
        <div ref={pageTopRef} className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="text-blue-600 fill-blue-50" size={24} />
              ATS Resume Analyzer
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify resume keyword matches, formatting compliance, and recruiter impact with Cosine Similarity algorithms.
            </p>
          </div>
        </div>

        {/* Full-page ATS Analysis Loader */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-8"
          >
            {/* Central pulsing icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-200">
                <Sparkles className="text-white fill-white/20" size={36} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center">
                <Loader2 className="text-blue-600 animate-spin" size={12} />
              </span>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">Running ATS Diagnostic Scan</h3>
              <p className="text-sm text-slate-500">Analyzing resume against target job requirements...</p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>ATS Parser Pipeline</span>
                <span>{Math.round((analysisStep / 4) * 100)}% Completed</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(analysisStep / 4) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </div>
            </div>

            {/* Step checklist */}
            <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
              {[
                'Parsing resume document structures...',
                'Extracting target keywords & skills matrix...',
                'Verifying contact details & action verbs...',
                'Executing advanced scoring algorithms...',
              ].map((stepMsg, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 transition-all',
                    analysisStep > idx
                      ? 'bg-emerald-500 text-white border-emerald-400 scale-110'
                      : analysisStep === idx + 1
                        ? 'bg-blue-50 text-blue-600 border-blue-300 animate-pulse'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                  )}>
                    {analysisStep > idx ? '✓' : idx + 1}
                  </div>
                  <span className={cn(
                    'text-sm font-medium transition-colors',
                    analysisStep > idx ? 'text-emerald-700' :
                    analysisStep === idx + 1 ? 'text-blue-700 font-semibold' : 'text-slate-400'
                  )}>
                    {stepMsg}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}





        {/* ATS Results View (Top of the page) */}
        {atsResult && !isAnalyzing && (() => {
          const totalIssues = CHECKS_CONFIG.reduce((acc, curr) => acc + curr.getIssuesCount(atsResult), 0)
          const activeCheck = CHECKS_CONFIG.find(c => c.id === selectedCheckId) || CHECKS_CONFIG[0]
          const activeChecksList = activeCheck.getChecks(atsResult)
          const activeScorePercent = activeCheck.getScorePercent(atsResult)
          const catIssues = CHECKS_CONFIG.filter(c => c.category === activeCheck.category).reduce((acc, curr) => acc + curr.getIssuesCount(atsResult), 0)

          return (
            <div className="max-w-5xl mx-auto w-full text-left space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                
                {/* Enhancv Left: 'Your Score' Navigation Card */}
                <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
                  <div className="text-center pb-3 border-b border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Score</h3>
                    <div className={cn(
                      "text-4xl font-black mt-2 tracking-tight",
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
                                <button
                                  key={check.id}
                                  type="button"
                                  onClick={() => setSelectedCheckId(check.id)}
                                  className={cn(
                                    "w-full flex items-center justify-between p-2 rounded-xl text-left transition-all text-xs font-semibold border",
                                    isSelected
                                      ? "bg-blue-50/50 border-blue-200 text-blue-700 shadow-sm"
                                      : "bg-white hover:bg-slate-50 border-transparent text-slate-600"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px]",
                                      issues === 0 ? "bg-emerald-500" : "bg-rose-500"
                                    )}>
                                      {issues === 0 ? "✓" : "!"}
                                    </div>
                                    <span className="truncate max-w-[90px]">{check.title}</span>
                                  </div>
                                  <span className={cn(
                                    "text-[8px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap",
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

                  <Button
                    onClick={handleDownloadReport}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm h-9 text-xs font-bold flex items-center justify-center gap-1.5 mt-2"
                  >
                    <FileDown size={14} className="animate-bounce" /> Export Detailed PDF
                  </Button>
                </div>

                {/* Enhancv Right: Active Check Detail Card */}
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
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      {activeCheck.title.toUpperCase()}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {activeCheck.description}
                    </p>

                    {/* Custom Horizontal Progress Bar with Pin */}
                    <div className="pt-6 pb-2 relative px-2">
                      <div className="w-full bg-slate-200 h-2.5 rounded-full relative">
                        <div 
                          className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${activeScorePercent}%` }}
                        />
                        {/* Marker pin */}
                        <div 
                          className="absolute -top-7 transform -translate-x-1/2 flex flex-col items-center transition-all duration-1000 ease-out"
                          style={{ left: `${activeScorePercent}%` }}
                        >
                          <span className="bg-emerald-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
                            {activeScorePercent}%
                          </span>
                          <div className="w-1.5 h-1.5 bg-emerald-600 rotate-45 -mt-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-center text-xs font-bold text-emerald-800">
                      {activeCheck.successMsg(atsResult)}
                    </div>

                    {/* Detailed list / accordions */}
                    <div className="space-y-2.5 mt-2">
                      
                      {/* Custom render for Skills Match Matrix keyword badges */}
                      {selectedCheckId === 'skills_match' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                          <div className="space-y-2">
                            <h5 className="text-xs font-extrabold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              Missing Skills ({atsResult.skillsMissing.length})
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {atsResult.skillsMissing.length > 0 ? (
                                atsResult.skillsMissing.map((skill: string) => (
                                  <Badge key={skill} variant="outline" className="bg-rose-50/50 text-rose-700 border-rose-200 text-[10px] rounded-lg px-2 py-0.5 capitalize">
                                    {skill}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 italic">No missing skills detected.</span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h5 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Matched Skills ({atsResult.skillsMatched.length})
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {atsResult.skillsMatched.length > 0 ? (
                                atsResult.skillsMatched.map((skill: string) => (
                                  <Badge key={skill} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] rounded-lg px-2 py-0.5 capitalize">
                                    {skill}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 italic">No matching skills identified.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Accordion check items */}
                      <div className="space-y-2">
                        {activeChecksList.map((checkItem: any) => {
                          const isExpanded = !!expandedCheckItems[checkItem.id]
                          return (
                            <div key={checkItem.id} className="border border-slate-200 bg-white rounded-xl overflow-hidden transition-all shadow-sm">
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedCheckItems(prev => ({ ...prev, [checkItem.id]: !prev[checkItem.id] }))
                                }}
                                className="w-full flex items-center justify-between p-3 text-left font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-4 h-4 rounded-full flex items-center justify-center text-white",
                                    checkItem.status === 'passed' ? "bg-emerald-500" : checkItem.status === 'warning' ? "bg-amber-500" : "bg-rose-500"
                                  )}>
                                    {checkItem.status === 'passed' ? "✓" : "!"}
                                  </div>
                                  <span>{checkItem.title}</span>
                                </div>
                                {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                              </button>

                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t border-slate-100 bg-slate-50/50 p-3.5 space-y-3 text-xs leading-relaxed text-left"
                                  >
                                    <div>
                                      <span className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider block">Findings</span>
                                      <p className="text-slate-700 font-semibold mt-0.5">{checkItem.foundText}</p>
                                    </div>
                                    <div>
                                      <span className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider block">Why it matters</span>
                                      <p className="text-slate-500 mt-0.5">{checkItem.explanation}</p>
                                    </div>
                                    <div>
                                      <span className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider block">Action step</span>
                                      <p className="text-blue-700 font-semibold mt-0.5">{checkItem.actionStep}</p>
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

              </div>

              {/* Footer Save & Download Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200">
                {selectedClient ? (
                  <Button
                    type="button"
                    onClick={handleSaveResume}
                    disabled={isSavingResume}
                    className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-xs font-bold shadow-md shadow-emerald-100 flex items-center justify-center gap-1.5 px-4"
                  >
                    {isSavingResume ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Save to Candidate Profile
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSaveNewCandidate}
                    disabled={isSavingResume}
                    className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-xs font-bold shadow-md shadow-emerald-100 flex items-center justify-center gap-1.5 px-4"
                  >
                    {isSavingResume ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Save Candidate Profile
                      </>
                    )}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleCopyReport}
                  className="flex-grow bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-10 text-xs font-bold shadow-md shadow-blue-100"
                >
                  Copy Markdown Report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadReport}
                  className="rounded-xl border-slate-200 h-10 text-xs p-2.5 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                  title="Download Report"
                >
                  <FileDown size={15} /> Download Text Report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAtsResult(null)
                    setSelectedClient(null)
                  }}
                  className="rounded-xl border-slate-200 h-10 text-xs text-red-600 hover:bg-red-50 px-4 font-semibold border-red-200"
                >
                  Clear Results
                </Button>
              </div>
            </div>
          );
        })()}

        {/* Candidates List Section (Always visible at the bottom of the page) */}
        <div className="space-y-4 pt-8 border-t border-slate-200 mt-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCircle size={18} className="text-slate-500" />
                Candidate Profiles
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {`${clients.length} total candidates saved`}
              </p>
            </div>
            
            {/* Filters bar */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative min-w-[150px] max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidates..." className="pl-8 h-8 rounded-lg border-slate-200 text-xs" />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 h-8 rounded-lg border-slate-200 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="docs">Sort by Docs</SelectItem>
                  <SelectItem value="revenue">Sort by Revenue</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                <button onClick={() => setViewMode('grid')} className={cn('p-1 rounded-md transition-colors', viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600')}>
                  <LayoutGrid size={14} />
                </button>
                <button onClick={() => setViewMode('list')} className={cn('p-1 rounded-md transition-colors', viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600')}>
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Grid view */}
          {viewMode === 'grid' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((client, i) => (
                <motion.div key={client.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div className={cn(
                    "bg-white border rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 group cursor-pointer relative overflow-hidden",
                    selectedClient?.id === client.id ? "border-blue-400 ring-2 ring-blue-50" : "border-slate-100"
                  )}
                    onClick={() => {
                      setSelectedClient(client)
                      if (client.atsAnalysis) {
                        try {
                          setAtsResult(JSON.parse(client.atsAnalysis))
                        } catch (e) {
                          console.error(e)
                        }
                      } else {
                        setAtsResult(null)
                      }
                    }}>
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClient(client);
                        }}
                        className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-blue-600 shadow-sm transition-colors"
                        title="Edit Candidate"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client.id);
                        }}
                        className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 shadow-sm transition-colors"
                        title="Delete Candidate"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="flex items-start justify-between mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className={cn('text-white text-sm font-bold', CLIENT_COLORS[i % CLIENT_COLORS.length])}>
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
                    {client.atsScore !== undefined && client.atsScore !== null && (
                      <div className="mt-3 p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">ATS Score</span>
                        <span className={cn(
                          "text-xs font-black px-2 py-0.5 rounded-lg border",
                          client.atsScore >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          client.atsScore >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-rose-50 text-rose-700 border-rose-200"
                        )}>
                          {client.atsScore}/100
                        </span>
                      </div>
                    )}
                    <Button size="sm" className="w-full mt-3 h-8 text-xs rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all font-medium">
                      Load Profile & ATS <ArrowRight size={12} className="ml-1" />
                    </Button>
                  </div>
                </motion.div>
              ))}
              {/* Add Candidate card */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <button onClick={() => setShowModal(true)}
                  className="w-full h-full min-h-[220px] border-2 border-dashed border-slate-250 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                  <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                    <Plus className="text-slate-400 group-hover:text-blue-600" size={20} />
                  </div>
                  <span className="text-sm text-slate-500 group-hover:text-blue-600 font-medium transition-colors">
                    Add & Analyze Candidate
                  </span>
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
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarFallback className={cn('text-white text-xs font-bold', CLIENT_COLORS[i % CLIENT_COLORS.length])}>
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
                    <Badge className={cn('text-xs rounded-full mr-1.5', client.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600')}>
                      {client.status}
                    </Badge>
                    {client.atsScore !== undefined && client.atsScore !== null && (
                      <Badge className={cn('text-xs rounded-full font-bold ml-1', 
                        client.atsScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        client.atsScore >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-rose-50 text-rose-700 border-rose-200'
                      )}>
                        ATS: {client.atsScore}%
                      </Badge>
                    )}
                  </span>
                  <span className="text-sm text-slate-600">{client.documentsCount} docs</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => {
                      setSelectedClient(client)
                      if (client.atsAnalysis) {
                        try {
                          setAtsResult(JSON.parse(client.atsAnalysis))
                        } catch (e) {
                          console.error(e)
                        }
                      } else {
                        setAtsResult(null)
                      }
                    }} className="text-blue-600 text-xs font-medium hover:text-blue-700 flex items-center gap-1">
                      Load ATS <ExternalLink size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClient(client);
                      }}
                      className="text-slate-500 hover:text-blue-600 text-xs font-medium flex items-center gap-0.5"
                    >
                      <Edit size={11} /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client.id);
                      }}
                      className="text-slate-500 hover:text-red-600 text-xs font-medium flex items-center gap-0.5"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-10 bg-slate-50/50 border border-slate-100 rounded-xl">
              <p className="text-slate-400 text-xs font-medium">No candidates found matching the query</p>
            </div>
          )}
        </div>
      </div>
    ) : (
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Clients
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {`${clients.length} total clients · ${clients.filter((c) => c.status === 'active').length} active`}
          </p>
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
              <div className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg hover:border-slate-200 transition-all hover:-translate-y-0.5 group cursor-pointer relative overflow-hidden"
                onClick={() => {
                  setActiveDialogTab('profile')
                  setSelectedClient(client)
                }}>
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClient(client);
                    }}
                    className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-blue-600 shadow-sm transition-colors"
                    title="Edit Client"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClient(client.id);
                    }}
                    className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 shadow-sm transition-colors"
                    title="Delete Client"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className={cn('text-white text-sm font-bold', CLIENT_COLORS[i % CLIENT_COLORS.length])}>
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
                {client.atsScore !== undefined && client.atsScore !== null && (
                  <div className="mt-3 p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">ATS Score</span>
                    <span className={cn(
                      "text-xs font-black px-2 py-0.5 rounded-lg border",
                      client.atsScore >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      client.atsScore >= 50 ? "bg-amber-50 text-amber-750 border-amber-200" :
                      "bg-rose-50 text-rose-700 border-rose-200"
                    )}>
                      {client.atsScore}/100
                    </span>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <FileText size={11} /> {client.documentsCount} docs
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    ₹{client.revenue >= 100000 ? `${(client.revenue / 100000).toFixed(1)}L` : `${(client.revenue / 1000).toFixed(0)}K`}
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
              className="w-full h-full min-h-[200px] border-2 border-dashed border-slate-300/80 bg-slate-50/40 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-sm transition-all group">
              <div className="w-10 h-10 bg-slate-100/80 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                <Plus className="text-slate-500 group-hover:text-blue-600" size={20} />
              </div>
              <span className="text-sm text-slate-600 group-hover:text-blue-600 font-semibold transition-colors">Add New Client</span>
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
              className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarFallback className={cn('text-white text-xs font-bold', CLIENT_COLORS[i % CLIENT_COLORS.length])}>
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
                <Badge className={cn('text-xs rounded-full mr-1.5', client.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600')}>
                  {client.status}
                </Badge>
                {client.atsScore !== undefined && client.atsScore !== null && (
                  <Badge className={cn('text-xs rounded-full font-bold ml-1', 
                    client.atsScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    client.atsScore >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    'bg-rose-50 text-rose-700 border-rose-200'
                  )}>
                    ATS: {client.atsScore}%
                  </Badge>
                )}
              </span>
              <span className="text-sm text-slate-600">{client.documentsCount} docs</span>
              <div className="flex items-center gap-3">
                <button onClick={() => {
                  setActiveDialogTab('profile')
                  setSelectedClient(client)
                }} className="text-blue-600 text-xs font-medium hover:text-blue-700 flex items-center gap-1">
                  View <ExternalLink size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClient(client);
                  }}
                  className="text-slate-500 hover:text-blue-600 text-xs font-medium flex items-center gap-0.5"
                >
                  <Edit size={11} /> Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClient(client.id);
                  }}
                  className="text-slate-500 hover:text-red-600 text-xs font-medium flex items-center gap-0.5"
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
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
    </div>
  )}

      {/* Add Client / Candidate Modal */}
      <Dialog open={showModal} onOpenChange={(open) => {
        setShowModal(open)
        if (!open) {
          setIsEdit(false)
          setEditingClient(null)
          reset()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
          {appId === 'resume-analyzer' ? (
            isEdit ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Edit Candidate Details</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Candidate Name *</Label>
                      <Input {...register('contactPerson', { required: true })} placeholder="Arjun Sharma" className="rounded-xl" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Target Position / Company *</Label>
                      <Input {...register('company', { required: true })} placeholder="TechNova Solutions" className="rounded-xl" />
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
                      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Status</Label>
                      <Select onValueChange={(v) => setValue('status', v)} defaultValue={editingClient?.status || 'active'}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {['active', 'inactive'].map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 shadow-blue">
                      <Check size={15} className="mr-1.5" /> Save Candidate
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowModal(false); setIsEdit(false); setEditingClient(null); reset(); }} className="flex-1 rounded-xl h-10 border-slate-200">
                      Cancel
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="space-y-4">

              <DialogHeader className="mb-2">
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
                  <Sparkles className="text-blue-600 fill-blue-50" size={20} />
                  Add & Analyze New Candidate
                </DialogTitle>
                <p className="text-xs text-slate-500">
                  Upload a candidate's resume PDF and define target job description to auto-calculate their Cosine Similarity score.
                </p>
              </DialogHeader>

              {!uploadedFile ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Target Job Description / Requirements *
                    </Label>
                    <Textarea
                      value={candidateJobDesc}
                      onChange={(e) => setCandidateJobDesc(e.target.value)}
                      placeholder="Paste the target job description here..."
                      className="text-xs rounded-xl border-slate-200 resize-none font-sans p-3 bg-slate-50/50"
                      rows={5}
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Candidate Resume (PDF or TXT) *
                    </Label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleResumeFileSelect(file);
                      }}
                      onClick={() => document.getElementById('candidate-resume-input')?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3",
                        isDragOver
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/30"
                      )}
                    >
                      <input
                        id="candidate-resume-input"
                        type="file"
                        accept=".pdf,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleResumeFileSelect(file);
                        }}
                      />
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        {extractingText ? (
                          <Loader2 className="animate-spin" size={24} />
                        ) : (
                          <UploadCloud size={24} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {extractingText ? "Scanning & Parsing Resume..." : "Drag & drop resume PDF here, or click to browse"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Supports PDF or TXT up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowModal(false)}
                      className="flex-1 rounded-xl h-10 border-slate-200 text-xs font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Step 2: Review & Analyze Candidate */}
                  {isAnalyzingCandidate ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4 py-3"
                    >
                      <div className="text-center space-y-2">
                        <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
                        <h4 className="text-sm font-bold text-slate-800">Analyzing Resume Alignment</h4>
                        <p className="text-xs text-slate-400">Please wait while we run our diagnostic audit scans...</p>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(analysisModalStep / 5) * 100}%` }}
                        />
                      </div>

                      {/* Diagnostic Steps Checklist */}
                      <div className="space-y-2.5 pt-2">
                        {[
                          'Parsing resume content & formatting...',
                          'Scanning for ATS critical sections...',
                          'Analyzing target skills overlap...',
                          'Calculating Cosine vector similarity...',
                          'Running Enhancv-style diagnostic checks...'
                        ].map((stepMsg, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-xs">
                            <div className={cn(
                              "w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                              analysisModalStep > idx
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 font-black'
                                : analysisModalStep === idx + 1
                                  ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse'
                                  : 'bg-slate-100 text-slate-400 border-slate-200'
                            )}>
                              {analysisModalStep > idx ? '✓' : idx + 1}
                            </div>
                            <span className={cn(
                              analysisModalStep > idx ? 'text-emerald-700 font-medium' : analysisModalStep === idx + 1 ? 'text-blue-700 font-semibold' : 'text-slate-400'
                            )}>
                              {stepMsg}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {/* Scanned Card */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50/30 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 text-left">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-100">
                          <Check size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-emerald-800">Resume Loaded Successfully</p>
                          <p className="text-[11px] text-emerald-600 font-medium truncate mt-0.5">{uploadedFile.name}</p>
                          <p className="text-[9px] text-slate-400 mt-1 font-mono">Size: {(uploadedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUploadedFile(null)}
                          className="h-8 text-[10px] text-slate-600 border-slate-200 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl px-2.5 font-bold"
                        >
                          Change File
                        </Button>
                      </div>

                      {/* Target Job Description Selection */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-xs font-bold text-slate-700">Target Position Criteria</Label>
                          <span className="text-[9px] bg-slate-200/60 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            ATS Benchmark
                          </span>
                        </div>
                        <Textarea
                          value={candidateJobDesc}
                          onChange={(e) => setCandidateJobDesc(e.target.value)}
                          placeholder="Verify or paste target job description requirements here..."
                          className="text-xs rounded-xl border-slate-200 resize-none font-sans bg-white leading-relaxed"
                          rows={4}
                        />
                      </div>

                      {/* Large prominent Analyze Button */}
                      <div className="flex flex-col gap-2 pt-2">
                        <Button
                          type="button"
                          onClick={handleStartModalAnalysis}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-11 shadow-lg shadow-blue-100 text-xs font-extrabold flex items-center justify-center gap-1.5 tracking-wider uppercase transition-all duration-300 transform active:scale-[0.99]"
                        >
                          <Sparkles size={14} className="text-yellow-300 fill-yellow-200" />
                          <span>Analyze Candidate Resume</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setUploadedFile(null)}
                          className="w-full h-10 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            )
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{isEdit ? 'Edit Client Details' : 'Add New Client'}</DialogTitle>
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
                    <Select onValueChange={(v) => setValue('paymentTerms', v)}>
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
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Initial Revenue (₹)</Label>
                    <Input {...register('revenue')} placeholder="0" type="number" className="rounded-xl" defaultValue="0" />
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
                    <Check size={15} className="mr-1.5" /> {isEdit ? 'Save Changes' : 'Save Client'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowModal(false); setIsEdit(false); setEditingClient(null); reset(); }} className="flex-1 rounded-xl h-10 border-slate-200">
                    Cancel
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Client profile modal */}
      <AnimatePresence>
        {selectedClient && appId !== 'resume-analyzer' && (
          <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
            <DialogContent className={cn(
              "rounded-2xl max-h-[95vh] overflow-y-auto transition-all duration-300",
              (atsResult && !isAnalyzing && activeDialogTab === 'resume') ? "max-w-6xl w-[94vw]" : "max-w-2xl w-full"
            )}>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className={cn('text-white font-bold text-lg', CLIENT_COLORS[clients.indexOf(selectedClient) % CLIENT_COLORS.length])}>
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
              {/* Tab Selector */}
              {appId === 'resume-analyzer' && (
                <div className="flex border-b border-slate-100 mt-4 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveDialogTab('profile')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition-all border-b-2',
                      activeDialogTab === 'profile'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    )}
                  >
                    <UserCircle size={16} /> Candidate Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDialogTab('resume')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition-all border-b-2',
                      activeDialogTab === 'resume'
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    )}
                  >
                    <Sparkles size={16} className="text-yellow-500 fill-yellow-100" /> ATS Resume Score
                  </button>
                </div>
              )}

              {appId !== 'resume-analyzer' || activeDialogTab === 'profile' ? (
                <>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: 'Documents', value: selectedClient.documentsCount },
                      { label: 'Revenue', value: selectedClient.revenue >= 100000 ? `₹${(selectedClient.revenue / 100000).toFixed(1)}L` : `₹${selectedClient.revenue.toLocaleString()}` },
                      { label: 'Since', value: new Date(selectedClient.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
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
                          <p className="font-medium text-slate-800">{field.value || 'None'}</p>
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
                  <div className="flex gap-3 mt-6 border-t pt-4">
                    <Link href={`/app/${appId}/editor`} className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                        <FileText size={14} className="mr-1.5" /> Create Document
                      </Button>
                    </Link>
                    <Button variant="outline" className="rounded-xl border-slate-200">
                      Edit
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-6 mt-4">
                  {/* Step loading screen */}
                  {isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col gap-3 text-left"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>ATS Parser Pipeline</span>
                        <span>{analysisStep * 25}% Completed</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className="bg-blue-600 h-1.5 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: `${analysisStep * 25}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        {[
                          'Parsing resume document structures...',
                          'Extracting target keywords & skills matrix...',
                          'Verifying contact details & action verbs...',
                          'Executing advanced scoring algorithms...'
                        ].map((stepMsg, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <div className={cn(
                              'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border',
                              analysisStep > idx
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : analysisStep === idx + 1
                                  ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse'
                                  : 'bg-slate-100 text-slate-400 border-slate-200'
                            )}>
                              {analysisStep > idx ? '✓' : idx + 1}
                            </div>
                            <span className={cn(
                              analysisStep > idx ? 'text-emerald-700 font-medium' : analysisStep === idx + 1 ? 'text-blue-700 font-semibold' : 'text-slate-400'
                            )}>
                              {stepMsg}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* ATS Results View (Top of the page) */}
                  {atsResult && !isAnalyzing && (() => {
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
                        {/* LEFT PANEL: Live Resume View */}
                        <div className="lg:col-span-5 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-150 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Document Preview</span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                              ATS Scanned
                            </span>
                          </div>
                          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm max-h-[500px] overflow-y-auto font-mono text-[11px] leading-relaxed relative scrollbar-thin">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                            {highlightResumeText(resumeText, atsResult.skillsMatched || [])}
                          </div>
                        </div>

                        {/* RIGHT PANEL: Scores & Skills Auditor */}
                        <div className="lg:col-span-7 space-y-4">
                          {/* Radial Scores Banner (Clean Light-Themed) */}
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 text-slate-800 rounded-2xl p-5 border border-slate-200 relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
                            <div className="grid grid-cols-3 gap-3 items-center relative z-10 text-center">
                              {/* Overall score */}
                              <div className="flex flex-col items-center">
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                                  <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="32" cy="32" r="26" stroke="#f1f5f9" strokeWidth="5" fill="transparent" />
                                    <circle
                                      cx="32"
                                      cy="32"
                                      r="26"
                                      stroke={atsResult.score >= 80 ? '#10B981' : atsResult.score >= 50 ? '#F59E0B' : '#EF4444'}
                                      strokeWidth="5"
                                      fill="transparent"
                                      strokeDasharray={2 * Math.PI * 26}
                                      strokeDashoffset={2 * Math.PI * 26 * (1 - atsResult.score / 100)}
                                      strokeLinecap="round"
                                      className="transition-all duration-1000 ease-out"
                                    />
                                  </svg>
                                  <span className="absolute text-xs sm:text-sm font-extrabold text-slate-800">{atsResult.score}%</span>
                                </div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mt-1.5 block">Overall Match</span>
                              </div>

                              {/* ATS technical */}
                              <div className="flex flex-col items-center">
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                                  <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="32" cy="32" r="26" stroke="#f1f5f9" strokeWidth="5" fill="transparent" />
                                    <circle
                                      cx="32"
                                      cy="32"
                                      r="26"
                                      stroke={(atsResult.atsParsabilityScore || 0) >= 80 ? '#10B981' : (atsResult.atsParsabilityScore || 0) >= 50 ? '#F59E0B' : '#EF4444'}
                                      strokeWidth="5"
                                      fill="transparent"
                                      strokeDasharray={2 * Math.PI * 26}
                                      strokeDashoffset={2 * Math.PI * 26 * (1 - (atsResult.atsParsabilityScore || 0) / 100)}
                                      strokeLinecap="round"
                                      className="transition-all duration-1000 ease-out"
                                    />
                                  </svg>
                                  <span className="absolute text-xs sm:text-sm font-extrabold text-slate-800">{atsResult.atsParsabilityScore || 0}%</span>
                                </div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mt-1.5 block">ATS Parsability</span>
                              </div>

                              {/* Content impact */}
                              <div className="flex flex-col items-center">
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                                  <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="32" cy="32" r="26" stroke="#f1f5f9" strokeWidth="5" fill="transparent" />
                                    <circle
                                      cx="32"
                                      cy="32"
                                      r="26"
                                      stroke={(atsResult.contentImpactScore || 0) >= 80 ? '#10B981' : (atsResult.contentImpactScore || 0) >= 50 ? '#F59E0B' : '#EF4444'}
                                      strokeWidth="5"
                                      fill="transparent"
                                      strokeDasharray={2 * Math.PI * 26}
                                      strokeDashoffset={2 * Math.PI * 26 * (1 - (atsResult.contentImpactScore || 0) / 100)}
                                      strokeLinecap="round"
                                      className="transition-all duration-1000 ease-out"
                                    />
                                  </svg>
                                  <span className="absolute text-xs sm:text-sm font-extrabold text-slate-800">{atsResult.contentImpactScore || 0}%</span>
                                </div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mt-1.5 block">Recruiter Impact</span>
                              </div>
                            </div>
                          </div>

                          {/* Sub-tabs inside Auditor Panel */}
                          <div className="flex gap-1 border-b border-slate-100 pb-1.5 overflow-x-auto scrollbar-none">
                            <button
                              type="button"
                              onClick={() => setAuditorTab('skills')}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border whitespace-nowrap",
                                auditorTab === 'skills'
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-100"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              )}
                            >
                              <Sparkles size={13} />
                              <span>🎯 Skills Match Matrix</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAuditorTab('technical')}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border whitespace-nowrap",
                                auditorTab === 'technical'
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-100"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              )}
                            >
                              <Cpu size={13} />
                              <span>📋 ATS Parsability</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAuditorTab('impact')}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border whitespace-nowrap",
                                auditorTab === 'impact'
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-100"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              )}
                            >
                              <TrendingUp size={13} />
                              <span>⚡ Recruiter Impact</span>
                            </button>
                          </div>

                          {/* Tab Content 1: SKILLS MATCH MATRIX */}
                          {auditorTab === 'skills' && (
                            <div className="space-y-4">
                              {/* Linear Progress bar */}
                              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-bold text-slate-700">Target Skill Keyword Overlap</span>
                                  <span className="text-xs font-extrabold text-blue-600">
                                    {Math.round((atsResult.skillsMatched.length / (atsResult.skillsMatched.length + atsResult.skillsMissing.length || 1)) * 100)}% Match
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(atsResult.skillsMatched.length / (atsResult.skillsMatched.length + atsResult.skillsMissing.length || 1)) * 100}%` }}
                                  />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                  We scanned {atsResult.skillsMatched.length + atsResult.skillsMissing.length} target skills from the Job Description. Expand any skill to review context details or recommendations.
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Column A: Missing Skills */}
                                <div className="space-y-2.5">
                                  <h5 className="text-[11px] font-extrabold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                    Missing Skills ({atsResult.skillsMissing.length})
                                  </h5>
                                  <div className="space-y-2">
                                    {atsResult.skillsMissing.map((skill, idx) => {
                                      const isExpanded = expandedSkill === `missing-${idx}`
                                      return (
                                        <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden bg-white hover:border-slate-200 transition-all">
                                          <button
                                            type="button"
                                            onClick={() => setExpandedSkill(isExpanded ? null : `missing-${idx}`)}
                                            className="w-full px-3 py-2.5 flex items-center justify-between text-left"
                                          >
                                            <span className="text-xs font-bold text-slate-700 capitalize flex items-center gap-2">
                                              <span className="w-4 h-4 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-[10px] font-black">×</span>
                                              {skill}
                                            </span>
                                            <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isExpanded && "rotate-180")} />
                                          </button>
                                          {isExpanded && (
                                            <div className="px-3 pb-3 border-t border-slate-50 pt-2.5 space-y-2 bg-slate-50/50 text-[11px] text-slate-500">
                                              <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Recruiter Recommendation</p>
                                                <p className="mt-0.5 leading-relaxed">This core keyword is required by the target job description. Add this capability to the technical stack or experiences section if applicable.</p>
                                              </div>
                                              <div className="p-2 bg-white rounded border border-slate-150 text-[10px] text-slate-700 flex items-center justify-between gap-2">
                                                <code className="font-mono bg-slate-50 px-1 py-0.5 rounded text-blue-600 font-semibold truncate">
                                                  "Leveraged {skill} to optimize systems..."
                                                </code>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-6 text-[9px] px-1.5 font-bold hover:bg-slate-100 shrink-0"
                                                  onClick={() => navigator.clipboard.writeText(`Leveraged ${skill} to optimize systems...`)}
                                                >
                                                  Copy Tip
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                    {atsResult.skillsMissing.length === 0 && (
                                      <p className="text-xs text-slate-400 font-medium italic p-4 text-center border border-dashed rounded-xl bg-slate-50/30">
                                        No missing skills! Excellent matching.
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Column B: Matched Skills */}
                                <div className="space-y-2.5">
                                  <h5 className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Matched Skills ({atsResult.skillsMatched.length})
                                  </h5>
                                  <div className="space-y-2">
                                    {atsResult.skillsMatched.map((skill, idx) => {
                                      const isExpanded = expandedSkill === `matched-${idx}`
                                      return (
                                        <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden bg-white hover:border-slate-200 transition-all">
                                          <button
                                            type="button"
                                            onClick={() => setExpandedSkill(isExpanded ? null : `matched-${idx}`)}
                                            className="w-full px-3 py-2.5 flex items-center justify-between text-left"
                                          >
                                            <span className="text-xs font-bold text-slate-700 capitalize flex items-center gap-2">
                                              <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-[10px] font-black">✓</span>
                                              {skill}
                                            </span>
                                            <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isExpanded && "rotate-180")} />
                                          </button>
                                          {isExpanded && (
                                            <div className="px-3 pb-3 border-t border-slate-50 pt-2.5 space-y-1.5 bg-slate-50/50 text-[11px] text-slate-500">
                                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sentence Context Found</p>
                                              <p className="italic leading-relaxed text-slate-600 bg-white p-2 rounded border border-slate-100">
                                                "{findSentenceContaining(resumeText, skill) || `Mentioned ${skill} in technical skills listing.`}"
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                    {atsResult.skillsMatched.length === 0 && (
                                      <p className="text-xs text-slate-400 font-medium italic p-4 text-center border border-dashed rounded-xl bg-slate-50/30">
                                        No matching skills identified.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Tab Content 2: ATS PARSABILITY */}
                          {auditorTab === 'technical' && (
                            <div className="space-y-3 text-left">
                              {atsResult.technicalChecks.map((check) => {
                                const isExpanded = expandedCheck === check.id
                                return (
                                  <div
                                    key={check.id}
                                    className="border border-slate-100 rounded-xl overflow-hidden bg-white hover:border-slate-200 transition-all hover:shadow-sm"
                                  >
                                    <div
                                      onClick={() => setExpandedCheck(isExpanded ? null : check.id)}
                                      className="p-3 flex items-center justify-between cursor-pointer select-none"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={cn(
                                          "w-5 h-5 rounded-lg flex items-center justify-center shrink-0",
                                          check.status === 'critical' ? "bg-red-50 text-red-600" : check.status === 'warning' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                        )}>
                                          {check.status === 'critical' ? <XCircle size={13} /> : check.status === 'warning' ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold text-slate-800">{check.title}</p>
                                          <p className="text-[10px] text-slate-500 mt-0.5">{check.foundText}</p>
                                        </div>
                                      </div>
                                      <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isExpanded && "rotate-180")} />
                                    </div>
                                    {isExpanded && (
                                      <div className="px-3.5 pb-3 border-t border-slate-50 pt-2.5 space-y-2 bg-slate-50/50 text-xs">
                                        <div>
                                          <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Why it matters</p>
                                          <p className="text-slate-600 leading-relaxed font-sans">{check.explanation}</p>
                                        </div>
                                        <div className={cn(
                                          "p-2.5 rounded-lg border",
                                          check.status === 'critical' ? "bg-red-50/40 border-red-100 text-red-900" : check.status === 'warning' ? "bg-amber-50/40 border-amber-100 text-amber-900" : "bg-emerald-50/40 border-emerald-100 text-emerald-900"
                                        )}>
                                          <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5">How to fix it</p>
                                          <p className="leading-relaxed font-semibold">{check.actionStep}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Tab Content 3: RECRUITER IMPACT */}
                          {auditorTab === 'impact' && (
                            <div className="space-y-3 text-left">
                              {atsResult.recruiterImpactChecks.map((check) => {
                                const isExpanded = expandedCheck === check.id
                                return (
                                  <div
                                    key={check.id}
                                    className="border border-slate-100 rounded-xl overflow-hidden bg-white hover:border-slate-200 transition-all hover:shadow-sm"
                                  >
                                    <div
                                      onClick={() => setExpandedCheck(isExpanded ? null : check.id)}
                                      className="p-3 flex items-center justify-between cursor-pointer select-none"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={cn(
                                          "w-5 h-5 rounded-lg flex items-center justify-center shrink-0",
                                          check.status === 'critical' ? "bg-red-50 text-red-600" : check.status === 'warning' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                        )}>
                                          {check.status === 'critical' ? <XCircle size={13} /> : check.status === 'warning' ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold text-slate-800">{check.title}</p>
                                          <p className="text-[10px] text-slate-500 mt-0.5">{check.foundText}</p>
                                        </div>
                                      </div>
                                      <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isExpanded && "rotate-180")} />
                                    </div>
                                    {isExpanded && (
                                      <div className="px-3.5 pb-3 border-t border-slate-50 pt-2.5 space-y-2 bg-slate-50/50 text-xs">
                                        <div>
                                          <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Why it matters</p>
                                          <p className="text-slate-600 leading-relaxed font-sans">{check.explanation}</p>
                                        </div>
                                        <div className={cn(
                                          "p-2.5 rounded-lg border",
                                          check.status === 'critical' ? "bg-red-50/40 border-red-100 text-red-900" : check.status === 'warning' ? "bg-amber-50/40 border-amber-100 text-amber-900" : "bg-emerald-50/40 border-emerald-100 text-emerald-900"
                                        )}>
                                          <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5">How to fix it</p>
                                          <p className="leading-relaxed font-semibold">{check.actionStep}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Save & download actions */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                            <Button
                              type="button"
                              onClick={handleSaveResume}
                              disabled={isSavingResume}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-10 text-xs font-bold shadow-md shadow-blue-100"
                            >
                              {isSavingResume ? (
                                <>
                                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Check size={14} className="mr-1.5" />
                                  Save to Candidate Profile
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCopyReport}
                              className="rounded-xl border-slate-200 h-10 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                              Copy Report
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleDownloadReport}
                              className="rounded-xl border-slate-200 h-10 text-xs p-2.5 text-slate-600 hover:bg-slate-50"
                              title="Download Report"
                            >
                              <FileDown size={15} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Step 1 & Step 2 Parameters Editor (Bottom of page, down of results view) */}
                  {!isAnalyzing && (
                    <div className={cn("space-y-4 pt-6 text-left", atsResult && "border-t border-slate-200 mt-8")}>
                      {atsResult && (
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                            Modify Target Requirements & Resume text
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Adjust criteria below and re-run to recalculate the ATS Match Score
                          </span>
                        </div>
                      )}
                      
                      {/* Step 1: Define Target Job Description */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Building2 size={14} className="text-blue-500" />
                          Step 1: Define Target Job Description
                        </Label>
                        <Textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the target job description here..."
                          className="text-xs rounded-xl border-slate-200 resize-none font-sans p-3 bg-slate-50/30 leading-relaxed"
                          rows={3}
                        />
                      </div>

                      {/* Step 2: Add Candidate Resume */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <FileText size={14} className="text-blue-500" />
                            Step 2: Add Candidate Resume
                          </Label>
                          <div className="flex gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setResumeText(DEMO_RESUMES.priya)
                                setAtsResult(null)
                              }}
                              className="h-6 text-[10px] text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg px-2 font-semibold"
                            >
                              Load Priya's Resume
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setResumeText(DEMO_RESUMES.intern)
                                setAtsResult(null)
                              }}
                              className="h-6 text-[10px] text-amber-600 border-amber-200 hover:bg-amber-50 rounded-lg px-2 font-semibold"
                            >
                              Load Intern Resume
                            </Button>
                          </div>
                        </div>

                        <Textarea
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          placeholder="Paste the raw text of the resume here, or drop a text file below..."
                          className="text-xs rounded-xl border-slate-200 resize-none font-mono h-36 p-3 bg-slate-50/30"
                          rows={6}
                        />

                        <div className="flex items-center justify-between border border-dashed border-slate-200 rounded-xl p-3 bg-slate-50/50 mt-2">
                          <div className="flex items-center gap-2">
                            <UploadCloud size={16} className="text-slate-400" />
                            <div className="text-left">
                              <p className="text-[11px] font-semibold text-slate-700">Upload Resume File</p>
                              <p className="text-[9px] text-slate-400">Supports .txt, .md files (UTF-8)</p>
                            </div>
                          </div>
                          <input
                            type="file"
                            accept=".txt,.md"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="resume-file-upload"
                          />
                          <Label
                            htmlFor="resume-file-upload"
                            className="cursor-pointer text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 shadow-sm"
                          >
                            Choose File
                          </Label>
                        </div>
                      </div>

                      {/* Evaluate and Reset buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          type="button"
                          onClick={handleAnalyzeResume}
                          disabled={isAnalyzing || !resumeText.trim()}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md h-10 font-bold text-xs"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 size={16} className="mr-2 animate-spin" />
                              Analyzing Resume...
                            </>
                          ) : (
                            <>
                              <Sparkles size={15} className="mr-2 text-yellow-300 fill-yellow-200" />
                              Evaluate ATS Match Score
                            </>
                          )}
                        </Button>
                        {resumeText.trim() && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setResumeText('')
                              setAtsResult(null)
                            }}
                            className="rounded-xl border-slate-200 h-10 font-semibold text-xs text-slate-600 hover:bg-slate-50 px-4"
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
