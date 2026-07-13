export type AppType =
  | 'invoice'
  | 'offer-letter'
  | 'hr-documents'
  | 'question-generator'
  | 'certificates'
  | 'resume-builder'
  | 'resume-analyzer'
  | 'experience-letter'
  | 'appointment-letter'
  | 'salary-slip'
  | 'id-card'

export interface Application {
  id: AppType
  name: string
  description: string
  icon: string
  color: string
  gradient: string
  category: string
}

export interface Client {
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
}

export interface Document {
  id: string
  title: string
  type: AppType
  client: string
  status: 'draft' | 'completed' | 'shared' | 'archived'
  createdAt: string
  updatedAt: string
  size: string
  pages: number
}

export interface Template {
  id: string
  name: string
  type: AppType
  description: string
  preview: string
  usageCount: number
  isFavorite: boolean
  tags: string[]
}

export interface ActivityItem {
  id: string
  action: string
  document: string
  client: string
  time: string
  type: 'create' | 'edit' | 'download' | 'share' | 'delete'
}

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning'
}
