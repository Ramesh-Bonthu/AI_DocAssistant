'use client'

import { type Editor } from '@tiptap/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Quote, Code, Minus,
  Undo2, Redo2, Table, Download, Share2, Save, CheckCircle, Loader2,
  Heading1, Heading2, Highlighter, Link2, Type, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { APPLICATIONS } from '@/lib/mock-data'

interface EditorToolbarProps {
  editor: ReturnType<typeof import('@tiptap/react').useEditor>
  onSave: () => void
  saving: boolean
  saved: boolean
  appId: string
  onExport?: () => void
}

const ToolBtn = ({ onClick, active, disabled, title, children }: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center transition-all text-slate-600 hover:bg-slate-100',
            active && 'bg-blue-100 text-blue-700',
            disabled && 'opacity-30 cursor-not-allowed'
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{title}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

export function EditorToolbar({ editor, onSave, saving, saved, appId, onExport }: EditorToolbarProps) {
  const app = APPLICATIONS.find((a) => a.id === appId)

  if (!editor) return null

  const toolGroups = [
    {
      tools: [
        { icon: Undo2, title: 'Undo', action: () => editor.chain().focus().undo().run(), active: false, disabled: !editor.can().undo() },
        { icon: Redo2, title: 'Redo', action: () => editor.chain().focus().redo().run(), active: false, disabled: !editor.can().redo() },
      ]
    },
    {
      tools: [
        { icon: Heading1, title: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
        { icon: Heading2, title: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
        { icon: Type, title: 'Paragraph', action: () => editor.chain().focus().setParagraph().run(), active: editor.isActive('paragraph') },
      ]
    },
    {
      tools: [
        { icon: Bold, title: 'Bold', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
        { icon: Italic, title: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
        { icon: Underline, title: 'Underline', action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
        { icon: Strikethrough, title: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
        { icon: Highlighter, title: 'Highlight', action: () => editor.chain().focus().toggleHighlight().run(), active: editor.isActive('highlight') },
      ]
    },
    {
      tools: [
        { icon: AlignLeft, title: 'Align Left', action: () => editor.chain().focus().setTextAlign('left').run(), active: editor.isActive({ textAlign: 'left' }) },
        { icon: AlignCenter, title: 'Align Center', action: () => editor.chain().focus().setTextAlign('center').run(), active: editor.isActive({ textAlign: 'center' }) },
        { icon: AlignRight, title: 'Align Right', action: () => editor.chain().focus().setTextAlign('right').run(), active: editor.isActive({ textAlign: 'right' }) },
        { icon: AlignJustify, title: 'Justify', action: () => editor.chain().focus().setTextAlign('justify').run(), active: editor.isActive({ textAlign: 'justify' }) },
      ]
    },
    {
      tools: [
        { icon: List, title: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
        { icon: ListOrdered, title: 'Ordered List', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
        { icon: CheckSquare, title: 'Task List', action: () => editor.chain().focus().toggleTaskList().run(), active: editor.isActive('taskList') },
        { icon: Quote, title: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
        { icon: Code, title: 'Code Block', action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
        { icon: Minus, title: 'Divider', action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
      ]
    },
    {
      tools: [
        { icon: Table, title: 'Insert Table', action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), active: false },
      ]
    }
  ]

  return (
    <div className="flex items-center gap-1 px-4 py-2 flex-wrap overflow-x-auto">
      {/* Doc title */}
      <div className="flex items-center gap-2 mr-3 min-w-0">
        <div className={`w-5 h-5 bg-gradient-to-br ${app?.gradient || 'from-blue-500 to-blue-700'} rounded flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-[8px] font-bold">{app?.name?.[0] || 'D'}</span>
        </div>
        <span className="text-xs font-medium text-slate-600 truncate max-w-[140px]">New Document</span>
      </div>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {toolGroups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {group.tools.map((tool) => (
            <ToolBtn key={tool.title} onClick={tool.action} active={tool.active} disabled={(tool as any).disabled} title={tool.title}>
              <tool.icon size={14} />
            </ToolBtn>
          ))}
          {gi < toolGroups.length - 1 && <div className="w-px h-4 bg-slate-200 mx-1" />}
        </div>
      ))}

      <div className="ml-auto flex items-center gap-2">
        {/* Save status */}
        <AnimatePresence mode="wait">
          {saving ? (
            <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-xs text-slate-500">
              <Loader2 size={13} className="animate-spin" /> Saving...
            </motion.div>
          ) : saved ? (
            <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-xs text-emerald-600">
              <CheckCircle size={13} /> Saved
            </motion.div>
          ) : (
            <span key="unsaved" className="text-xs text-slate-400">Unsaved changes</span>
          )}
        </AnimatePresence>

        <div className="w-px h-4 bg-slate-200" />
        <Button size="sm" onClick={onSave} className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          <Save size={13} className="mr-1" /> Save
        </Button>
        <Button size="sm" variant="outline" onClick={onExport} className="h-7 px-3 text-xs rounded-lg border-slate-200 text-slate-700">
          <Download size={13} className="mr-1" /> Export
        </Button>
        <Button size="sm" variant="outline" className="h-7 px-3 text-xs rounded-lg border-slate-200 text-slate-700">
          <Share2 size={13} className="mr-1" /> Share
        </Button>
      </div>
    </div>
  )
}
