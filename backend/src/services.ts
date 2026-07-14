import prisma from './client'

/**
 * Get dashboard stats, monthly metrics, document type breakdown, 
 * recent documents, and recent activities for a specific application workspace.
 */
export async function getDashboardData(appId: string) {
  // Fetch application info
  const app = await prisma.application.findUnique({
    where: { id: appId }
  })

  if (!app) {
    throw new Error(`Application not found: ${appId}`)
  }

  // Aggregate document counts
  const totalDocs = await prisma.document.count({
    where: { appId }
  })

  const draftsCount = await prisma.document.count({
    where: { appId, status: 'draft' }
  })

  // Get active client count
  const activeClients = await prisma.client.count({
    where: { appId, status: 'active' }
  })

  // Get total templates count for this app
  const templatesCount = await prisma.template.count({
    where: { appId }
  })

  // Calculate total revenue from clients
  const clientRevenueSum = await prisma.client.aggregate({
    where: { appId },
    _sum: { revenue: true }
  })
  const totalRevenue = clientRevenueSum._sum.revenue || 0.0

  // Fetch monthly chart metrics
  const monthlyMetrics = await prisma.monthlyMetric.findMany({
    where: { appId },
    orderBy: { orderIndex: 'asc' }
  })

  // Calculate document status distribution for the pie chart
  const docStatusGroup = await prisma.document.groupBy({
    by: ['status'],
    where: { appId },
    _count: { id: true }
  })

  const statusColors: Record<string, string> = {
    completed: '#10B981', // emerald-500
    draft: '#F59E0B',     // amber-500
    shared: '#3B82F6',    // blue-500
    archived: '#64748B',  // slate-500
  }

  const docTypesBreakdown = docStatusGroup.map((group) => {
    const status = group.status
    const count = group._count.id
    const percentage = totalDocs > 0 ? Math.round((count / totalDocs) * 100) : 0
    return {
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: percentage,
      color: statusColors[status] || '#CBD5E1'
    }
  })

  // Fetch recent documents (limit 5)
  const recentDocs = await prisma.document.findMany({
    where: { appId },
    orderBy: { updatedAt: 'desc' },
    take: 5
  })

  // Fetch recent activities (limit 6)
  const recentActivities = await prisma.activity.findMany({
    where: { appId },
    orderBy: { createdAt: 'desc' },
    take: 6
  })

  // Helper to format date relative or short string
  const formattedActivities = recentActivities.map((act) => {
    // Return relative-like short string
    const diffMs = Date.now() - act.createdAt.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    let timeString = 'Just now'
    if (diffMins > 0 && diffMins < 60) {
      timeString = `${diffMins} min ago`
    } else if (diffHours > 0 && diffHours < 24) {
      timeString = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffHours >= 24) {
      timeString = act.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    }

    return {
      id: act.id,
      action: act.action,
      document: act.document,
      client: act.client,
      time: timeString,
      type: act.type
    }
  })

  return {
    app,
    stats: {
      totalDocs,
      templatesCount,
      activeClients,
      totalRevenue,
      draftsCount
    },
    chartData: {
      monthly: monthlyMetrics.map((m) => ({
        month: m.month,
        documents: m.documents,
        revenue: m.revenue
      })),
      docTypes: docTypesBreakdown
    },
    recentDocs: recentDocs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      client: doc.client,
      status: doc.status,
      updatedAt: doc.updatedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      pages: doc.pages,
      size: doc.size,
      type: doc.appId
    })),
    activities: formattedActivities
  }
}

/**
 * Get all documents for a specific application workspace with optional status filter.
 */
export async function getDocuments(appId: string, search: string = '', status: string = 'all') {
  const whereClause: any = { appId }

  if (status !== 'all') {
    whereClause.status = status
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search } },
      { client: { contains: search } }
    ]
  }

  const docs = await prisma.document.findMany({
    where: whereClause,
    orderBy: { updatedAt: 'desc' }
  })

  return docs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    client: doc.client,
    status: doc.status,
    updatedAt: doc.updatedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    pages: doc.pages,
    size: doc.size,
    type: doc.appId
  }))
}

/**
 * Create a new document in the database.
 */
export async function createDocument(appId: string, data: { title: string, clientId?: string, pages?: number, size?: string }) {
  let clientName = 'General'
  if (data.clientId) {
    const clientRecord = await prisma.client.findUnique({
      where: { id: data.clientId }
    })
    if (clientRecord) {
      clientName = clientRecord.company
    }
  }

  const newDoc = await prisma.document.create({
    data: {
      appId,
      title: data.title,
      client: clientName,
      clientId: data.clientId || null,
      status: 'draft',
      size: data.size || '120 KB',
      pages: data.pages || 1
    }
  })

  // Create an activity entry
  await prisma.activity.create({
    data: {
      appId,
      action: 'Created draft',
      document: data.title,
      client: clientName,
      type: 'create'
    }
  })

  // Increment documents count on the client if clientId is provided
  if (data.clientId) {
    await prisma.client.update({
      where: { id: data.clientId },
      data: {
        documentsCount: { increment: 1 }
      }
    })
  }

  return newDoc
}

/**
 * Delete a document from the database.
 */
export async function deleteDocument(appId: string, documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId }
  })

  if (!doc || doc.appId !== appId) {
    throw new Error('Document not found in this workspace')
  }

  await prisma.document.delete({
    where: { id: documentId }
  })

  // Log activity
  await prisma.activity.create({
    data: {
      appId,
      action: 'Deleted document',
      document: doc.title,
      client: doc.client,
      type: 'delete'
    }
  })

  if (doc.clientId) {
    await prisma.client.update({
      where: { id: doc.clientId },
      data: {
        documentsCount: { decrement: 1 }
      }
    })
  }

  return { success: true }
}

/**
 * Get all clients for a specific application workspace.
 */
export async function getClients(appId: string, search: string = '') {
  const whereClause: any = { appId }

  if (search) {
    whereClause.OR = [
      { company: { contains: search } },
      { contactPerson: { contains: search } }
    ]
  }

  return prisma.client.findMany({
    where: whereClause,
    orderBy: { company: 'asc' }
  })
}

/**
 * Create a new client in the database.
 */
export async function createClient(appId: string, data: any) {
  return prisma.client.create({
    data: {
      appId,
      company: data.company,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      gstNumber: data.gstNumber || 'None',
      address: data.address,
      city: data.city,
      country: data.country,
      postalCode: data.postalCode,
      paymentTerms: data.paymentTerms || 'Net 30',
      notes: data.notes || '',
      logo: data.logo || data.company.substring(0, 2).toUpperCase(),
      status: data.status || 'active',
      revenue: parseFloat(data.revenue) || 0.0
    }
  })
}

/**
 * Get all templates for a specific application workspace.
 */
export async function getTemplates(appId: string) {
  const templates = await prisma.template.findMany({
    where: { appId },
    orderBy: { usageCount: 'desc' }
  })

  return templates.map((t) => ({
    ...t,
    tags: t.tags ? t.tags.split(',') : []
  }))
}

/**
 * Get full activity audit logs for a workspace.
 */
export async function getHistory(appId: string) {
  const activities = await prisma.activity.findMany({
    where: { appId },
    orderBy: { createdAt: 'desc' }
  })

  return activities.map((act) => {
    const diffMs = Date.now() - act.createdAt.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    let timeString = 'Just now'
    if (diffMins > 0 && diffMins < 60) {
      timeString = `${diffMins} min ago`
    } else if (diffHours > 0 && diffHours < 24) {
      timeString = `${diffHours} hr ago`
    } else {
      timeString = act.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    }

    return {
      id: act.id,
      action: act.action,
      document: act.document,
      client: act.client,
      time: timeString,
      type: act.type
    }
  })
}

/**
 * Get analytics metrics for Recharts graphs.
 */
export async function getAnalytics(appId: string) {
  const monthly = await prisma.monthlyMetric.findMany({
    where: { appId },
    orderBy: { orderIndex: 'asc' }
  })

  const totalDocs = await prisma.document.count({ where: { appId } })
  const docStatusGroup = await prisma.document.groupBy({
    by: ['status'],
    where: { appId },
    _count: { id: true }
  })

  const statusColors: Record<string, string> = {
    completed: '#2563EB', // blue
    draft: '#F59E0B',     // amber
    shared: '#7C3AED',    // violet
    archived: '#DC2626',  // red
  }

  const docTypes = docStatusGroup.map((group) => {
    const status = group.status
    const count = group._count.id
    const percentage = totalDocs > 0 ? Math.round((count / totalDocs) * 100) : 0
    return {
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: percentage,
      color: statusColors[status] || '#94A3B8'
    }
  })

  return {
    monthly: monthly.map((m) => ({
      month: m.month,
      documents: m.documents,
      revenue: m.revenue
    })),
    docTypes
  }
}
