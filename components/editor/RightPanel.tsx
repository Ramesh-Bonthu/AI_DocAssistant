'use client'

import { useState } from 'react'
import { type Editor } from '@tiptap/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  FileText, Sparkles, Send, RefreshCw, AlignLeft, Languages,
  Wand2, Zap, ChevronRight, Plus, Loader2, Bot, User, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface RightPanelProps {
  appId: string
  editor: ReturnType<typeof import('@tiptap/react').useEditor>
  onGenerate: (data: Record<string, string>) => void
  invoiceData?: any
  onInvoiceDataChange?: (data: any) => void
}

type TabType = 'form' | 'ai'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

const AI_QUICK_ACTIONS = [
  { label: 'Rewrite', icon: RefreshCw, prompt: 'Rewrite the selected text to be more professional and clear.' },
  { label: 'Summarize', icon: AlignLeft, prompt: 'Summarize the document in 3-4 bullet points.' },
  { label: 'Improve', icon: Wand2, prompt: 'Improve the tone and readability of this document.' },
  { label: 'Translate', icon: Languages, prompt: 'Translate this document to Hindi.' },
  { label: 'Auto Fill', icon: Zap, prompt: 'Auto-fill the form fields based on the document context.' },
  { label: 'Generate', icon: Sparkles, prompt: 'Generate a complete professional document based on the provided details.' },
]

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your AI document assistant. I can help you write, improve, and generate professional documents. What would you like to do?',
    time: 'Just now',
  }
]

const AI_RESPONSES: Record<string, string> = {
  rewrite: 'I\'ve rewritten the selected text to be more professional and concise. The new version maintains all the key information while improving clarity and tone.',
  summarize: 'Here\'s a summary of the document:\n\n• The invoice details services worth ₹80,000\n• GST of 18% applies, totaling ₹94,400\n• Payment is due within 30 days\n• All standard terms and conditions apply',
  improve: 'I\'ve improved the document\'s tone and readability. The language is now more formal and professional, suitable for business communication.',
  translate: 'Document translated to Hindi successfully. The translation maintains the professional tone and all technical terms have been appropriately localized.',
  default: 'I\'ve processed your request. The document has been updated based on your instructions. Would you like me to make any additional changes?',
}

export function RightPanel({ appId, editor, onGenerate, invoiceData, onInvoiceDataChange }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('form')
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputMsg, setInputMsg] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const onSubmit = (data: any) => {
    onGenerate(data)
  }

  const addItem = () => {
    const items = [...(invoiceData?.items || [])]
    items.push({
      id: Date.now().toString(),
      requirement: 'New Item Description',
      hsn: '',
      unitPrice: 0,
      quantity: 1
    })
    onInvoiceDataChange?.({ ...invoiceData, items })
  }

  const deleteItem = (id: string) => {
    const items = (invoiceData?.items || []).filter((item: any) => item.id !== id)
    onInvoiceDataChange?.({ ...invoiceData, items })
  }

  const updateItem = (id: string, key: string, value: any) => {
    const items = (invoiceData?.items || []).map((item: any) => {
      if (item.id === id) {
        return { ...item, [key]: value }
      }
      return item
    })
    onInvoiceDataChange?.({ ...invoiceData, items })
  }

  const sendMessage = (content: string) => {
    if (!content.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, time: 'Just now' }
    setMessages((prev) => [...prev, userMsg])
    setInputMsg('')
    setIsTyping(true)
    setTimeout(() => {
      const key = content.toLowerCase()
      const responseText = Object.keys(AI_RESPONSES).find((k) => key.includes(k))
        ? AI_RESPONSES[Object.keys(AI_RESPONSES).find((k) => key.includes(k))!]
        : AI_RESPONSES.default
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText, time: 'Just now' }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickAction = (action: typeof AI_QUICK_ACTIONS[0]) => {
    setActiveTab('ai')
    setTimeout(() => sendMessage(action.prompt), 100)
  }

  const formFields = getFormFields(appId)

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-100 flex-shrink-0">
        {[
          { key: 'form', label: 'Form', icon: FileText },
          { key: 'ai', label: 'AI Assistant', icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all border-b-2',
              activeTab === tab.key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'form' ? (
            <motion.div key="form" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto p-4">
              {appId === 'invoice' ? (
                // Real-time custom invoice inputs
                <div className="space-y-4">
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice Details</p>
                    <p className="text-xs text-slate-400 mt-0.5">Fill in the details to update your invoice preview in real-time</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-600 mb-1 block">Ref Number</Label>
                      <Input value={invoiceData?.refNo || ''} onChange={(e) => onInvoiceDataChange?.({ ...invoiceData, refNo: e.target.value })} className="text-xs rounded-lg h-9 border-slate-200 focus-visible:ring-blue-500" />
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-slate-600 mb-1 block">Invoice Number</Label>
                      <Input value={invoiceData?.invoiceNo || ''} onChange={(e) => onInvoiceDataChange?.({ ...invoiceData, invoiceNo: e.target.value })} className="text-xs rounded-lg h-9 border-slate-200 focus-visible:ring-blue-500" />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-[11px] font-semibold text-slate-600 mb-1 block">Invoice Date</Label>
                    <Input type="date" value={invoiceData?.invoiceDate || ''} onChange={(e) => onInvoiceDataChange?.({ ...invoiceData, invoiceDate: e.target.value })} className="text-xs rounded-lg h-9 border-slate-200 focus-visible:ring-blue-500" />
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">From (Company)</span>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Company Name</Label>
                        <Input value={invoiceData?.companyName || ''} onChange={(e) => onInvoiceDataChange?.({ ...invoiceData, companyName: e.target.value })} className="text-xs rounded-lg h-9 border-slate-200 focus-visible:ring-blue-500" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Company Address</Label>
                        <Textarea value={invoiceData?.companyAddress || ''} onChange={(e) => onInvoiceDataChange?.({ ...invoiceData, companyAddress: e.target.value })} className="text-xs rounded-lg resize-none border-slate-200 focus-visible:ring-blue-500" rows={2} />
                      </div>
                      <div>
                        <Label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Company GSTIN</Label>
                        <Input value={invoiceData?.companyGst || ''} onChange={(e) => onInvoiceDataChange?.({ ...invoiceData, companyGst: e.target.value })} className="text-xs rounded-lg h-9 border-slate-200 focus-visible:ring-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">To (Customer)</span>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Customer Name</Label>
                        <Input value={invoiceData?.customerName || ''} onChange={(e) => onInvoiceDataChange?.({ ...invoiceData, customerName: e.target.value })} className="text-xs rounded-lg h-9 border-slate-200 focus-visible:ring-blue-500" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Customer Address</Label>
                        <Textarea value={invoiceData?.customerAddress || ''} onChange={(e) => onInvoiceDataChange?.({ ...invoiceData, customerAddress: e.target.value })} className="text-xs rounded-lg resize-none border-slate-200 focus-visible:ring-blue-500" rows={2} />
                      </div>
                      <div>
                        <Label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Customer GSTIN (Optional)</Label>
                        <Input value={invoiceData?.customerGst || ''} onChange={(e) => onInvoiceDataChange?.({ ...invoiceData, customerGst: e.target.value })} className="text-xs rounded-lg h-9 border-slate-200 focus-visible:ring-blue-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Phone (Optional)</Label>
                          <Input value={invoiceData?.customerPhone || ''} onChange={(e) => onInvoiceDataChange?.({ ...invoiceData, customerPhone: e.target.value })} className="text-xs rounded-lg h-9 border-slate-200 focus-visible:ring-blue-500" />
                        </div>
                        <div>
                          <Label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Email (Optional)</Label>
                          <Input type="email" value={invoiceData?.customerEmail || ''} onChange={(e) => onInvoiceDataChange?.({ ...invoiceData, customerEmail: e.target.value })} className="text-xs rounded-lg h-9 border-slate-200 focus-visible:ring-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Items Table</span>
                      <Button type="button" size="sm" variant="ghost" onClick={addItem} className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-transparent p-0 flex items-center gap-1">
                        <Plus size={13} className="mr-0.5" /> Add Item
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {invoiceData?.items?.map((item: any, idx: number) => (
                        <div key={item.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 relative">
                          <button type="button" onClick={() => deleteItem(item.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                          
                          <div>
                            <Label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Requirement / Description</Label>
                            <Input value={item.requirement || ''} onChange={(e) => updateItem(item.id, 'requirement', e.target.value)} className="text-xs rounded-lg h-8 border-slate-200 bg-white focus-visible:ring-blue-500" />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-1.5">
                            <div>
                              <Label className="text-[10px] font-medium text-slate-500 mb-0.5 block">HSN</Label>
                              <Input value={item.hsn || ''} onChange={(e) => updateItem(item.id, 'hsn', e.target.value)} className="text-xs rounded-lg h-8 border-slate-200 bg-white focus-visible:ring-blue-500" />
                            </div>
                            <div>
                              <Label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Unit Price (₹)</Label>
                              <Input type="number" value={item.unitPrice || 0} onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="text-xs rounded-lg h-8 border-slate-200 bg-white focus-visible:ring-blue-500" />
                            </div>
                            <div>
                              <Label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Quantity</Label>
                              <Input type="number" value={item.quantity || 0} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} className="text-xs rounded-lg h-8 border-slate-200 bg-white focus-visible:ring-blue-500" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="space-y-2">
                      <div>
                        <Label className="text-[11px] font-semibold text-slate-600 mb-1 block">Terms & Conditions</Label>
                        <Textarea value={invoiceData?.terms || ''} onChange={(e) => onInvoiceDataChange?.({ ...invoiceData, terms: e.target.value })} className="text-xs rounded-lg resize-none border-slate-200 focus-visible:ring-blue-500" rows={3} />
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-slate-600 mb-1 block">Authorized Signatory</Label>
                        <Input value={invoiceData?.authorizedSignature || ''} onChange={(e) => onInvoiceDataChange?.({ ...invoiceData, authorizedSignature: e.target.value })} className="text-xs rounded-lg h-9 border-slate-200 focus-visible:ring-blue-500" />
                      </div>
                    </div>
                  </div>

                  <Button type="button" onClick={() => onGenerate?.(invoiceData)} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 mt-4 shadow-blue font-medium text-sm">
                    <Sparkles size={14} className="mr-1.5" /> Generate Document
                  </Button>
                </div>
              ) : (
                // Standard form inputs
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{getFormTitle(appId)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Fill in the details to generate your document</p>
                  </div>
                  {formFields.map((field) => (
                    <div key={field.name}>
                      <Label className="text-xs font-medium text-slate-600 mb-1 block">{field.label}</Label>
                      {field.type === 'textarea' ? (
                        <Textarea {...register(field.name)} placeholder={field.placeholder} className="text-sm rounded-xl resize-none border-slate-200 focus-visible:ring-blue-500" rows={2} />
                      ) : field.type === 'select' ? (
                        <Select onValueChange={() => {}}>
                          <SelectTrigger className="text-sm rounded-xl border-slate-200 h-9">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input {...register(field.name)} type={field.inputType || 'text'} placeholder={field.placeholder} className="text-sm rounded-xl border-slate-200 h-9 focus-visible:ring-blue-500" />
                      )}
                    </div>
                  ))}
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 mt-4 shadow-blue font-medium text-sm">
                    {isSubmitting ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Sparkles size={14} className="mr-1.5" />}
                    Generate Document
                  </Button>
                </form>
              )}

              {/* Quick AI actions */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">AI Quick Actions</p>
                <div className="grid grid-cols-3 gap-2">
                  {AI_QUICK_ACTIONS.map((action) => (
                    <button key={action.label} onClick={() => handleQuickAction(action)}
                      className="flex flex-col items-center gap-1.5 p-2.5 bg-slate-50 hover:bg-blue-50 rounded-xl text-center transition-all group">
                      <action.icon size={14} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
                      <span className="text-xs text-slate-600 group-hover:text-blue-600 transition-colors font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="ai" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden">
              {/* Quick actions */}
              <div className="p-3 border-b border-slate-100 flex-shrink-0">
                <div className="flex flex-wrap gap-1.5">
                  {AI_QUICK_ACTIONS.slice(0, 4).map((action) => (
                    <button key={action.label} onClick={() => handleQuickAction(action)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-lg text-xs font-medium transition-all">
                      <action.icon size={11} /> {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-2.5', msg.role === 'user' && 'flex-row-reverse')}>
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      msg.role === 'assistant' ? 'bg-blue-600' : 'bg-slate-200')}>
                      {msg.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-slate-600" />}
                    </div>
                    <div className={cn('max-w-[85%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed',
                      msg.role === 'assistant' ? 'bg-slate-50 text-slate-700 border border-slate-100' : 'bg-blue-600 text-white')}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={cn('text-[10px] mt-1.5 opacity-60', msg.role === 'user' ? 'text-white' : 'text-slate-400')}>{msg.time}</p>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl px-3 py-3 flex gap-1 items-center">
                      {[0, 0.2, 0.4].map((delay) => (
                        <motion.div key={delay} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay }}
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-slate-100 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Ask AI to help..."
                    className="text-sm rounded-xl border-slate-200 h-9 focus-visible:ring-blue-500 flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage(inputMsg)
                      }
                    }}
                  />
                  <Button size="sm" onClick={() => sendMessage(inputMsg)} disabled={!inputMsg.trim()}
                    className="w-9 h-9 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex-shrink-0">
                    <Send size={14} />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function getFormTitle(appId: string): string {
  const titles: Record<string, string> = {
    invoice: 'Invoice Details',
    'offer-letter': 'Offer Letter Details',
    'hr-documents': 'HR Document Details',
    certificates: 'Certificate Details',
    'resume-analyzer': 'Resume Analysis',
    'experience-letter': 'Experience Letter',
    'appointment-letter': 'Appointment Letter',
    'salary-slip': 'Salary Slip Details',
  }
  return titles[appId] || 'Document Details'
}

function getFormFields(appId: string) {
  const forms: Record<string, Array<{name: string; label: string; placeholder: string; type?: string; inputType?: string; options?: string[]}>> = {
    invoice: [
      { name: 'company', label: 'Company Name', placeholder: 'TechNova Solutions' },
      { name: 'contactPerson', label: 'Contact Person', placeholder: 'Arjun Sharma' },
      { name: 'gst', label: 'GST Number', placeholder: '27AAPCA1234B1Z1' },
      { name: 'email', label: 'Email', placeholder: 'arjun@technova.in', inputType: 'email' },
      { name: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
      { name: 'products', label: 'Products / Services', placeholder: 'Software Development', type: 'textarea' },
      { name: 'amount', label: 'Amount (₹)', placeholder: '50000', inputType: 'number' },
      { name: 'tax', label: 'Tax Rate', placeholder: '18%', type: 'select', options: ['0%', '5%', '12%', '18%', '28%'] },
      { name: 'discount', label: 'Discount (%)', placeholder: '0', inputType: 'number' },
      { name: 'invoiceDate', label: 'Invoice Date', placeholder: '', inputType: 'date' },
      { name: 'dueDate', label: 'Due Date', placeholder: '', inputType: 'date' },
      { name: 'paymentTerms', label: 'Payment Terms', placeholder: 'Net 30', type: 'select', options: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Immediate'] },
    ],
    'offer-letter': [
      { name: 'employeeName', label: 'Employee Name', placeholder: 'Boddeda Vishnu Vardhan' },
      { name: 'designation', label: 'Designation / Role', placeholder: 'Software Development Engineer (SDE) Intern' },
      { name: 'joiningDate', label: 'Start Date', placeholder: '', inputType: 'date' },
      { name: 'endDate', label: 'End Date', placeholder: '', inputType: 'date' },
      { name: 'location', label: 'Location', placeholder: 'Hybrid', type: 'select', options: ['Hybrid', 'Remote', 'Onsite'] },
      { name: 'manager', label: 'Director / Signatory', placeholder: 'Dr. P. Satheesh' },
    ],
    'hr-documents': [
      { name: 'employeeName', label: 'Employee Name', placeholder: 'Arjun Sharma' },
      { name: 'employeeId', label: 'Employee ID', placeholder: 'EMP-001' },
      { name: 'documentType', label: 'Document Type', placeholder: '', type: 'select', options: ['Warning Letter', 'Relieving Letter', 'Promotion Letter', 'Transfer Letter', 'Termination Letter'] },
      { name: 'effectiveDate', label: 'Effective Date', placeholder: '', inputType: 'date' },
      { name: 'reason', label: 'Reason / Details', placeholder: 'Describe the reason...', type: 'textarea' },
    ],
    certificates: [
      { name: 'studentName', label: 'Student / Recipient Name', placeholder: 'Priya Nair' },
      { name: 'course', label: 'Course / Program', placeholder: 'Full Stack Web Development' },
      { name: 'duration', label: 'Duration', placeholder: '6 Months' },
      { name: 'certificateType', label: 'Certificate Type', placeholder: '', type: 'select', options: ['Completion', 'Achievement', 'Participation', 'Excellence', 'Merit'] },
      { name: 'issuedBy', label: 'Issued By', placeholder: 'EduSpark Institute' },
    ],
  }

  const defaultFields = [
    { name: 'name', label: 'Full Name', placeholder: 'Enter full name' },
    { name: 'company', label: 'Company', placeholder: 'Company name' },
    { name: 'email', label: 'Email', placeholder: 'Email address', inputType: 'email' },
    { name: 'date', label: 'Date', placeholder: '', inputType: 'date' },
    { name: 'details', label: 'Details', placeholder: 'Enter document details...', type: 'textarea' },
  ]

  return forms[appId] || defaultFields
}
