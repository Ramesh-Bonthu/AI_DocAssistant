'use client'

import { useParams } from 'next/navigation'
import { useState, useCallback } from 'react'
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
import { Save, CheckCircle } from 'lucide-react'

export default function EditorPage() {
  const params = useParams()
  const appId = params?.appId as string
  const app = APPLICATIONS.find((a) => a.id === appId)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

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

  const handleGenerate = useCallback((formData: Record<string, string>) => {
    if (!editor) return
    const content = generateDocument(appId, formData)
    editor.commands.setContent(content)
  }, [editor, appId])

  return (
    <div className="flex h-full bg-slate-100 overflow-hidden">
      {/* Paper area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Editor toolbar */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
          <EditorToolbar editor={editor} onSave={handleSave} saving={saving} saved={saved} appId={appId} />
        </div>

        {/* Paper */}
        <div className="flex-1 overflow-y-auto bg-slate-100 flex justify-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[794px] min-h-[1123px] bg-white paper-shadow rounded-sm mb-8 relative"
            style={{ maxWidth: '100%' }}
          >
            <EditorContent editor={editor} />
          </motion.div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-80 flex-shrink-0 bg-white border-l border-slate-100 overflow-hidden flex flex-col">
        <RightPanel appId={appId} editor={editor} onGenerate={handleGenerate} />
      </div>
    </div>
  )
}

function getInitialContent(appId: string): string {
  const contents: Record<string, string> = {
    invoice: `<h1>Tax Invoice</h1><p><strong>Invoice No:</strong> INV-2024-001</p><p><strong>Date:</strong> June 15, 2024</p><p><strong>Due Date:</strong> July 15, 2024</p><br/><p><strong>Bill To:</strong></p><p>TechNova Solutions<br/>42 Tech Park, Whitefield<br/>Bengaluru - 560066</p><br/><table><tbody><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr><tr><td>Software Development Services</td><td>1</td><td>₹50,000</td><td>₹50,000</td></tr><tr><td>UI/UX Design</td><td>1</td><td>₹30,000</td><td>₹30,000</td></tr></tbody></table><br/><p><strong>Subtotal:</strong> ₹80,000</p><p><strong>GST (18%):</strong> ₹14,400</p><p><strong>Total:</strong> ₹94,400</p>`,
    'offer-letter': `<h1>Offer Letter</h1><p>Date: June 15, 2024</p><br/><p>Dear Arjun Sharma,</p><br/><p>We are pleased to offer you the position of <strong>Senior Software Engineer</strong> at <strong>TechNova Solutions</strong>. After careful consideration of your qualifications and interview performance, we are confident that you will be a valuable addition to our team.</p><br/><h2>Position Details</h2><p><strong>Designation:</strong> Senior Software Engineer</p><p><strong>Department:</strong> Engineering</p><p><strong>Reporting To:</strong> VP of Engineering</p><p><strong>Date of Joining:</strong> July 1, 2024</p><br/><h2>Compensation</h2><p><strong>Annual CTC:</strong> ₹18,00,000</p><p><strong>Monthly In-Hand:</strong> ₹1,20,000 (approx.)</p><br/><p>Please sign and return this letter by June 20, 2024.</p><br/><p>Sincerely,<br/><strong>HR Department</strong><br/>TechNova Solutions</p>`,
    certificates: `<h1 style="text-align: center;">Certificate of Completion</h1><br/><p style="text-align: center;">This is to certify that</p><br/><h2 style="text-align: center;">Priya Nair</h2><br/><p style="text-align: center;">has successfully completed the</p><br/><h2 style="text-align: center;">Full Stack Web Development Program</h2><br/><p style="text-align: center;">Duration: 6 Months | June 2024</p><br/><p style="text-align: center;">Issued by <strong>EduSpark Institute</strong></p>`,
    'resume-builder': `<h1>Priya Nair</h1><p>Senior Software Engineer | priya@email.com | +91 87654 32109 | LinkedIn</p><hr/><h2>Professional Summary</h2><p>Experienced software engineer with 6+ years building scalable web applications using React, Node.js, and AWS. Passionate about clean code and user experience.</p><hr/><h2>Experience</h2><p><strong>Senior Frontend Engineer</strong> — GlobalEdge Consulting (2021–Present)</p><ul><li>Led a team of 5 engineers to rebuild the core platform</li><li>Reduced page load time by 60% through optimization</li><li>Implemented CI/CD pipeline with 99.9% uptime</li></ul><hr/><h2>Education</h2><p><strong>B.Tech Computer Science</strong> — NIT Calicut (2017)</p><hr/><h2>Skills</h2><p>React · TypeScript · Node.js · PostgreSQL · AWS · Docker · Git</p>`,
  }
  return contents[appId] || `<h1>New Document</h1><p>Start typing your document here...</p>`
}

function generateDocument(appId: string, data: Record<string, string>): string {
  const templates: Record<string, (d: Record<string, string>) => string> = {
    invoice: (d) => `<h1>Tax Invoice</h1><p><strong>Invoice No:</strong> INV-2024-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}</p><p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p><p><strong>Due Date:</strong> ${d.dueDate || 'N/A'}</p><br/><p><strong>Bill To:</strong><br/>${d.company || 'Client Name'}<br/>${d.email || ''}</p><br/><table><tbody><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr><tr><td>${d.products || 'Service'}</td><td>1</td><td>₹${d.amount || '0'}</td><td>₹${d.amount || '0'}</td></tr></tbody></table><br/><p><strong>Subtotal:</strong> ₹${d.amount || '0'}</p><p><strong>GST (18%):</strong> ₹${Math.round(parseFloat(d.amount || '0') * 0.18)}</p><p><strong>Total:</strong> ₹${Math.round(parseFloat(d.amount || '0') * 1.18)}</p>`,
    'offer-letter': (d) => `<h1>Offer Letter</h1><p>Date: ${new Date().toLocaleDateString('en-IN')}</p><br/><p>Dear <strong>${d.employeeName || 'Candidate'}</strong>,</p><br/><p>We are delighted to offer you the position of <strong>${d.designation || 'Employee'}</strong> at our organization.</p><br/><p><strong>Department:</strong> ${d.department || 'N/A'}</p><p><strong>Reporting To:</strong> ${d.manager || 'N/A'}</p><p><strong>Annual CTC:</strong> ₹${d.salary || '0'}</p><p><strong>Date of Joining:</strong> ${d.joiningDate || 'N/A'}</p><br/><p>We look forward to having you on our team.</p><br/><p>Sincerely,<br/><strong>HR Department</strong></p>`,
    certificates: (d) => `<h1 style="text-align:center;">Certificate of ${d.certificateType || 'Completion'}</h1><br/><p style="text-align:center;">This is to certify that</p><br/><h2 style="text-align:center;">${d.studentName || 'Student Name'}</h2><br/><p style="text-align:center;">has successfully completed the</p><br/><h2 style="text-align:center;">${d.course || 'Course Name'}</h2><br/><p style="text-align:center;">Duration: ${d.duration || 'N/A'}</p><br/><p style="text-align:center;">Issued on ${new Date().toLocaleDateString('en-IN')}</p>`,
  }
  const fn = templates[appId]
  if (fn) return fn(data)
  return `<h1>Generated Document</h1><p>Document generated on ${new Date().toLocaleDateString('en-IN')}</p>`
}
