'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { APPLICATIONS } from '@/lib/mock-data'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { RightPanel } from '@/components/editor/RightPanel'
import { cn } from '@/lib/utils'
import { Save, CheckCircle, Loader2 } from 'lucide-react'
import InvoiceCanvas from '@/components/InvoiceCanvas'

export default function EditorPage() {
  const params = useParams()
  const appId = params?.appId as string
  const app = APPLICATIONS.find((a) => a.id === appId)
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')
  const [customTemplate, setCustomTemplate] = useState<any>(null)

  useEffect(() => {
    if (!templateId) {
      router.replace(`/templates?selectForApp=${appId}`)
    }
  }, [templateId, appId, router])

  useEffect(() => {
    if (templateId) {
      fetch(`/api/templates/${templateId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setCustomTemplate(data)
          }
        })
        .catch((err) => console.error('Error fetching template:', err))
    }
  }, [templateId])

  // Real-time invoice state modeled after HPS screenshot
  const [invoiceData, setInvoiceData] = useState<any>({
    refNo: 'HPS/MVGR/Dev/2026',
    invoiceNo: 'IVHPS-0626-5032',
    invoiceDate: '2026-06-25',
    companyName: 'Harsha Perfect Solutions (OPC) Pvt Ltd',
    companyAddress: '31-7-67, Assam Gardens, Visakhapatnam, Andhra Pradesh - 530004, India',
    companyGst: '37AAGCH2004L1ZP',
    customerName: 'The Director',
    customerAddress: 'MVGR College of Engineering(A),\nChintalavalasa, Vizianagaram, 535005',
    customerGst: '',
    customerPhone: '',
    customerEmail: '',
    items: [
      { id: '1', requirement: 'ESSL FP+FACE+ID\nMB160 +ID+B\n(With Battery)', hsn: '85437099', unitPrice: 13000, quantity: 3 },
      { id: '2', requirement: 'Epson TM-m30III\n(Wi-Fi + Bluetooth )', hsn: '', unitPrice: 23000, quantity: 2 },
      { id: '3', requirement: 'IOS (CLOUD & SERVER)', hsn: '', unitPrice: 12712, quantity: 1 },
      { id: '4', requirement: 'ANDROID(CLOUD & SERVER)', hsn: '', unitPrice: 5932, quantity: 1 },
    ],
    terms: `1. The quoted price includes only the hardware & installation for the hardware mentioned in the invoice; additional accessories, if any, will be charged separately.
2. Warranty for biometric devices and printers shall be as per the manufacturer's standard warranty policy.
3. Any physical damage, mishandling, power fluctuations, or unauthorized repairs will void the warranty.
4. Goods once delivered and accepted cannot be returned or exchanged except for manufacturing defects covered under warranty.
We hope the above quotation meets your requirements and look forward to your positive response.`,
    authorizedSignature: 'HPS(OPC) Pvt. Ltd.'
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: getInitialContent(appId),
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
    onUpdate: () => {
      setSaved(false)
    },
  })

  const handleSave = useCallback(() => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 800)
  }, [])

  const handleExport = useCallback(() => {
    if (appId === 'invoice') {
      window.print()
    }
  }, [appId])

  const handleGenerate = useCallback((formData: Record<string, string>) => {
    if (!editor) return
    const content = generateDocument(appId, formData)
    editor.commands.setContent(content)
  }, [editor, appId])

  if (!templateId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-50 gap-2.5 z-[9999] fixed inset-0">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="text-sm font-semibold text-slate-500">Redirecting to Template Library...</span>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-slate-100 overflow-hidden">
      {/* Paper area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Editor toolbar */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
          <EditorToolbar editor={editor} onSave={handleSave} saving={saving} saved={saved} appId={appId} onExport={handleExport} />
        </div>

        {/* Paper */}
        <div className="flex-1 overflow-y-auto bg-slate-100 flex justify-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "w-[794px] min-h-[1123px] bg-white paper-shadow rounded-sm mb-8 relative",
              appId === 'invoice' && "invoice-print-container"
            )}
            style={{ maxWidth: '100%' }}
          >
            {customTemplate ? (
              customTemplate.originalFile.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={`${customTemplate.originalFile}#toolbar=0&navpanes=0`}
                  className="w-full h-full min-h-[1123px] border-none rounded-sm"
                />
              ) : (
                <img
                  src={customTemplate.originalFile}
                  alt={customTemplate.templateName}
                  className="w-full h-auto min-h-[1123px] object-contain rounded-sm"
                />
              )
            ) : appId === 'invoice' ? (
              <InvoiceCanvas data={invoiceData} />
            ) : (
              <EditorContent editor={editor} />
            )}
          </motion.div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-80 flex-shrink-0 bg-white border-l border-slate-100 overflow-hidden flex flex-col">
        <RightPanel 
          appId={appId} 
          editor={editor} 
          onGenerate={handleGenerate} 
          invoiceData={invoiceData} 
          onInvoiceDataChange={setInvoiceData} 
        />
      </div>
    </div>
  )
}

function getInitialContent(appId: string): string {
  const contents: Record<string, string> = {
    invoice: `<h1>Tax Invoice</h1><p><strong>Invoice No:</strong> INV-2024-001</p><p><strong>Date:</strong> June 15, 2024</p><p><strong>Due Date:</strong> July 15, 2024</p><br/><p><strong>Bill To:</strong></p><p>TechNova Solutions<br/>42 Tech Park, Whitefield<br/>Bengaluru - 560066</p><br/><table><tbody><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr><tr><td>Software Development Services</td><td>1</td><td>₹50,000</td><td>₹50,000</td></tr><tr><td>UI/UX Design</td><td>1</td><td>₹30,000</td><td>₹30,000</td></tr></tbody></table><br/><p><strong>Subtotal:</strong> ₹80,000</p><p><strong>GST (18%):</strong> ₹14,400</p><p><strong>Total:</strong> ₹94,400</p>`,
    'offer-letter': `<div style="margin: -48px -48px 25px -48px; position: relative; overflow: hidden; height: 110px;">
  <svg viewBox="0 0 794 110" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; display: block;">
    <!-- Light Blue Wave -->
    <path d="M0 0 L794 0 L794 90 C600 120, 350 50, 0 95 Z" fill="#008BE3" opacity="0.8" />
    <!-- Dark Blue Wave -->
    <path d="M0 0 L794 0 L794 75 C620 105, 380 45, 0 80 Z" fill="#024B80" />
  </svg>
</div>

<div style="display: flex; justify-content: flex-end; align-items: center; margin-right: 20px; margin-bottom: 20px;">
  <div style="display: flex; align-items: center; gap: 10px;">
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="white" stroke="#008be3" stroke-width="4" />
      <path d="M30 25 V75 H42 V53 H58 V75 H70 V25 H58 V47 H42 V25 H30 Z" fill="#008be3" />
    </svg>
    <div style="font-family: 'Arial', sans-serif; line-height: 1.1; text-align: left;">
      <div style="font-size: 26px; font-weight: 900; color: #008be3; letter-spacing: 0.5px;">HPS</div>
      <div style="font-size: 10px; font-weight: bold; color: #008be3; letter-spacing: 1px;">HARSHA PERFECT</div>
      <div style="font-size: 10px; font-weight: bold; color: #008be3; letter-spacing: 1px;">SOLUTIONS</div>
    </div>
  </div>
</div>

<div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
  <span style="font-size: 24px; font-weight: bold; font-family: 'Times New Roman', Times, serif; color: #000000; letter-spacing: 0.5px;">Internship Offer Letter - SDE Intern</span>
</div>

<div style="font-family: 'Times New Roman', Times, serif; color: #000000; font-size: 14px; line-height: 1.35; padding: 0 10px;">
  <div style="margin-bottom: 25px;">
    <strong>HPS OPC Pvt. Ltd</strong><br/>
    <strong>31-7-67, Assam Gardens,</strong><br/>
    <strong>Visakhapatnam,</strong><br/>
    <strong>Andhra Pradesh - 530020</strong><br/>
    <strong>+91 92466 15251</strong><br/>
    <strong>director@thehps.in</strong><br/>
    <strong>Website: thehps.in</strong><br/>
    <strong>Date: 11/04/2026</strong><br/>
    <strong>Subject: Offer Letter for SDE Intern</strong>
  </div>

  <p style="margin-bottom: 12px;">Dear <strong>Boddeda Vishnu Vardhan</strong>,</p>
  
  <p style="text-align: justify; margin-bottom: 12px;">
    We are pleased to offer you the position of <strong>Software Development Engineer (SDE) Intern</strong> at HPS (OPC) Pvt. Ltd., commencing from <strong>13-05-2026</strong> to <strong>08-10-2026</strong>. This internship is part of our initiative to nurture emerging talent in software engineering and modern development practices.
  </p>
  
  <p style="margin-bottom: 8px;">
    During your internship, you will work closely with our Engineering Team on real-world software development projects involving:
  </p>
  <ul style="margin-left: 20px; margin-bottom: 15px; list-style-type: disc;">
    <li style="margin-bottom: 4px;">Designing and developing scalable applications</li>
    <li style="margin-bottom: 4px;">Writing clean, efficient, and maintainable code</li>
    <li style="margin-bottom: 4px;">Working on data structures, algorithms, and system design fundamentals</li>
    <li style="margin-bottom: 4px;">Debugging, testing, and optimizing application performance</li>
    <li style="margin-bottom: 4px;">Collaborating with cross-functional teams to deliver high-quality software solutions</li>
  </ul>

  <p style="text-align: justify; margin-bottom: 15px;">
    This opportunity will provide hands-on experience in building robust systems and exposure to industry-standard development workflows and tools. You are expected to dedicate 20 hours per week, maintain a high level of professionalism, meet project deadlines, and actively collaborate with the team.
  </p>

  <p style="margin-bottom: 8px;">
    Internship Details:
  </p>
  <ul style="margin-left: 20px; margin-bottom: 15px; list-style-type: disc;">
    <li style="margin-bottom: 4px;"><strong>Location:</strong> Hybrid</li>
    <li style="margin-bottom: 4px;"><strong>Start Date:</strong> 13-05-2026</li>
    <li style="margin-bottom: 4px;"><strong>End Date:</strong> 08-10-2026</li>
  </ul>

  <p style="margin-bottom: 8px;">
    <strong>Terms & Conditions:</strong>
  </p>
  <ol style="margin-left: 20px; margin-bottom: 15px; list-style-type: decimal;">
    <li style="margin-bottom: 4px;">You are required to maintain confidentiality of all company marketing strategies and data.</li>
    <li style="margin-bottom: 4px;">A final report and presentation summarizing your contributions must be submitted at the end of the internship.</li>
    <li style="margin-bottom: 4px;">Based on your performance and contribution, the internship may be extended, and you may be considered for a full-time role at HPS(OPC) Pvt. Ltd.</li>
  </ol>

  <p style="text-align: justify; margin-bottom: 30px;">
    To confirm your acceptance of this offer, please visit our office in person at your earliest convenience. This will allow us to complete the onboarding formalities and provide further instructions for your internship.
  </p>

  <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; margin-bottom: 30px;">
    <div>
      <strong>Warm regards,</strong><br/><br/>
      <strong>Dr. P. Satheesh</strong><br/>
      <strong>Director</strong><br/>
      <strong>Harsha Perfect Solutions OPC Pvt. Ltd.</strong>
    </div>
    <div style="text-align: right; min-width: 150px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
      <strong>Candidate Signature</strong>
    </div>
  </div>
</div>

<div style="margin: 40px -48px -48px -48px; position: relative; overflow: hidden; height: 110px;">
  <svg viewBox="0 0 794 110" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; display: block;">
    <!-- Light Blue Wave -->
    <path d="M0 110 L794 110 L794 20 C600 -10, 350 60, 0 15 Z" fill="#008BE3" opacity="0.8" />
    <!-- Dark Blue Wave -->
    <path d="M0 110 L794 110 L794 35 C620 5, 380 55, 0 30 Z" fill="#024B80" />
  </svg>
</div>`,
    certificates: `<h1 style="text-align: center;">Certificate of Completion</h1><br/><p style="text-align: center;">This is to certify that</p><br/><h2 style="text-align: center;">Priya Nair</h2><br/><p style="text-align: center;">has successfully completed the</p><br/><h2 style="text-align: center;">Full Stack Web Development Program</h2><br/><p style="text-align: center;">Duration: 6 Months | June 2024</p><br/><p style="text-align: center;">Issued by <strong>EduSpark Institute</strong></p>`,
  }
  return contents[appId] || `<h1>New Document</h1><p>Start typing your document here...</p>`
}

function generateDocument(appId: string, data: Record<string, string>): string {
  const templates: Record<string, (d: Record<string, string>) => string> = {
    invoice: (d) => `<h1>Tax Invoice</h1><p><strong>Invoice No:</strong> INV-2024-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}</p><p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p><p><strong>Due Date:</strong> ${d.dueDate || 'N/A'}</p><br/><p><strong>Bill To:</strong><br/>${d.company || 'Client Name'}<br/>${d.email || ''}</p><br/><table><tbody><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr><tr><td>${d.products || 'Service'}</td><td>1</td><td>₹${d.amount || '0'}</td><td>₹${d.amount || '0'}</td></tr></tbody></table><br/><p><strong>Subtotal:</strong> ₹${d.amount || '0'}</p><p><strong>GST (18%):</strong> ₹${Math.round(parseFloat(d.amount || '0') * 0.18)}</p><p><strong>Total:</strong> ₹${Math.round(parseFloat(d.amount || '0') * 1.18)}</p>`,
    'offer-letter': (d) => `<div style="margin: -48px -48px 25px -48px; position: relative; overflow: hidden; height: 110px;">
  <svg viewBox="0 0 794 110" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; display: block;">
    <!-- Light Blue Wave -->
    <path d="M0 0 L794 0 L794 90 C600 120, 350 50, 0 95 Z" fill="#008BE3" opacity="0.8" />
    <!-- Dark Blue Wave -->
    <path d="M0 0 L794 0 L794 75 C620 105, 380 45, 0 80 Z" fill="#024B80" />
  </svg>
</div>

<div style="display: flex; justify-content: flex-end; align-items: center; margin-right: 20px; margin-bottom: 20px;">
  <div style="display: flex; align-items: center; gap: 10px;">
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="white" stroke="#008be3" stroke-width="4" />
      <path d="M30 25 V75 H42 V53 H58 V75 H70 V25 H58 V47 H42 V25 H30 Z" fill="#008be3" />
    </svg>
    <div style="font-family: 'Arial', sans-serif; line-height: 1.1; text-align: left;">
      <div style="font-size: 26px; font-weight: 900; color: #008be3; letter-spacing: 0.5px;">HPS</div>
      <div style="font-size: 10px; font-weight: bold; color: #008be3; letter-spacing: 1px;">HARSHA PERFECT</div>
      <div style="font-size: 10px; font-weight: bold; color: #008be3; letter-spacing: 1px;">SOLUTIONS</div>
    </div>
  </div>
</div>

<div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
  <span style="font-size: 24px; font-weight: bold; font-family: 'Times New Roman', Times, serif; color: #000000; letter-spacing: 0.5px;">Internship Offer Letter - ${d.designation || 'SDE Intern'}</span>
</div>

<div style="font-family: 'Times New Roman', Times, serif; color: #000000; font-size: 14px; line-height: 1.35; padding: 0 10px;">
  <div style="margin-bottom: 25px;">
    <strong>HPS OPC Pvt. Ltd</strong><br/>
    <strong>31-7-67, Assam Gardens,</strong><br/>
    <strong>Visakhapatnam,</strong><br/>
    <strong>Andhra Pradesh - 530020</strong><br/>
    <strong>+91 92466 15251</strong><br/>
    <strong>director@thehps.in</strong><br/>
    <strong>Website: thehps.in</strong><br/>
    <strong>Date: ${new Date().toLocaleDateString('en-IN')}</strong><br/>
    <strong>Subject: Offer Letter for ${d.designation || 'SDE Intern'}</strong>
  </div>

  <p style="margin-bottom: 12px;">Dear <strong>${d.employeeName || 'Boddeda Vishnu Vardhan'}</strong>,</p>
  
  <p style="text-align: justify; margin-bottom: 12px;">
    We are pleased to offer you the position of <strong>${d.designation || 'Software Development Engineer (SDE) Intern'}</strong> at HPS (OPC) Pvt. Ltd., commencing from <strong>${d.joiningDate || '13-05-2026'}</strong> to <strong>${d.endDate || '08-10-2026'}</strong>. This internship is part of our initiative to nurture emerging talent in software engineering and modern development practices.
  </p>
  
  <p style="margin-bottom: 8px;">
    During your internship, you will work closely with our Engineering Team on real-world software development projects involving:
  </p>
  <ul style="margin-left: 20px; margin-bottom: 15px; list-style-type: disc;">
    <li style="margin-bottom: 4px;">Designing and developing scalable applications</li>
    <li style="margin-bottom: 4px;">Writing clean, efficient, and maintainable code</li>
    <li style="margin-bottom: 4px;">Working on data structures, algorithms, and system design fundamentals</li>
    <li style="margin-bottom: 4px;">Debugging, testing, and optimizing application performance</li>
    <li style="margin-bottom: 4px;">Collaborating with cross-functional teams to deliver high-quality software solutions</li>
  </ul>

  <p style="text-align: justify; margin-bottom: 15px;">
    This opportunity will provide hands-on experience in building robust systems and exposure to industry-standard development workflows and tools. You are expected to dedicate 20 hours per week, maintain a high level of professionalism, meet project deadlines, and actively collaborate with the team.
  </p>

  <p style="margin-bottom: 8px;">
    Internship Details:
  </p>
  <ul style="margin-left: 20px; margin-bottom: 15px; list-style-type: disc;">
    <li style="margin-bottom: 4px;"><strong>Location:</strong> ${d.location || 'Hybrid'}</li>
    <li style="margin-bottom: 4px;"><strong>Start Date:</strong> ${d.joiningDate || '13-05-2026'}</li>
    <li style="margin-bottom: 4px;"><strong>End Date:</strong> ${d.endDate || '08-10-2026'}</li>
  </ul>

  <p style="margin-bottom: 8px;">
    <strong>Terms & Conditions:</strong>
  </p>
  <ol style="margin-left: 20px; margin-bottom: 15px; list-style-type: decimal;">
    <li style="margin-bottom: 4px;">You are required to maintain confidentiality of all company marketing strategies and data.</li>
    <li style="margin-bottom: 4px;">A final report and presentation summarizing your contributions must be submitted at the end of the internship.</li>
    <li style="margin-bottom: 4px;">Based on your performance and contribution, the internship may be extended, and you may be considered for a full-time role at HPS(OPC) Pvt. Ltd.</li>
  </ol>

  <p style="text-align: justify; margin-bottom: 30px;">
    To confirm your acceptance of this offer, please visit our office in person at your earliest convenience. This will allow us to complete the onboarding formalities and provide further instructions for your internship.
  </p>

  <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; margin-bottom: 30px;">
    <div>
      <strong>Warm regards,</strong><br/><br/>
      <strong>${d.manager || 'Dr. P. Satheesh'}</strong><br/>
      <strong>Director</strong><br/>
      <strong>Harsha Perfect Solutions OPC Pvt. Ltd.</strong>
    </div>
    <div style="text-align: right; min-width: 150px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
      <strong>Candidate Signature</strong>
    </div>
  </div>
</div>

<div style="margin: 40px -48px -48px -48px; position: relative; overflow: hidden; height: 110px;">
  <svg viewBox="0 0 794 110" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; display: block;">
    <!-- Light Blue Wave -->
    <path d="M0 110 L794 110 L794 20 C600 -10, 350 60, 0 15 Z" fill="#008BE3" opacity="0.8" />
    <!-- Dark Blue Wave -->
    <path d="M0 110 L794 110 L794 35 C620 5, 380 55, 0 30 Z" fill="#024B80" />
  </svg>
</div>`,
    certificates: (d) => `<h1 style="text-align:center;">Certificate of ${d.certificateType || 'Completion'}</h1><br/><p style="text-align:center;">This is to certify that</p><br/><h2 style="text-align:center;">${d.studentName || 'Student Name'}</h2><br/><p style="text-align:center;">has successfully completed the</p><br/><h2 style="text-align:center;">${d.course || 'Course Name'}</h2><br/><p style="text-align:center;">Duration: ${d.duration || 'N/A'}</p><br/><p style="text-align:center;">Issued on ${new Date().toLocaleDateString('en-IN')}</p>`,
  }
  const fn = templates[appId]
  if (fn) return fn(data)
  return `<h1>Generated Document</h1><p>Document generated on ${new Date().toLocaleDateString('en-IN')}</p>`
}
