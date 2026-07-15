const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up existing database records...')
  await prisma.monthlyMetric.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.template.deleteMany()
  await prisma.document.deleteMany()
  await prisma.client.deleteMany()
  await prisma.application.deleteMany()

  console.log('Seeding all 11 applications...')
  
  const apps = [
    {
      id: 'invoice',
      name: 'Invoice Automation',
      description: 'Generate professional GST invoices with automated calculations and payment tracking.',
      icon: 'Receipt',
      color: '#2563EB',
      gradient: 'from-blue-500 to-blue-700',
      category: 'Finance',
    },
    {
      id: 'offer-letter',
      name: 'Offer Letter Generator',
      description: 'Create legally sound offer letters with customizable compensation structures.',
      icon: 'FileText',
      color: '#059669',
      gradient: 'from-emerald-500 to-emerald-700',
      category: 'HR',
    },
    {
      id: 'hr-documents',
      name: 'HR Documents',
      description: 'Automate all HR documentation from onboarding to exit formalities.',
      icon: 'Users',
      color: '#7C3AED',
      gradient: 'from-violet-500 to-violet-700',
      category: 'HR',
    },
    {
      id: 'certificates',
      name: 'Certificates',
      description: 'Design and generate professional certificates for courses, achievements, and events.',
      icon: 'Award',
      color: '#DC2626',
      gradient: 'from-rose-500 to-red-600',
      category: 'Education',
    },
    {
      id: 'resume-analyzer',
      name: 'Resume Analyzer',
      description: 'Analyze and score resumes against job descriptions with detailed feedback.',
      icon: 'BarChart2',
      color: '#6366F1',
      gradient: 'from-indigo-500 to-indigo-700',
      category: 'Career',
    },
    {
      id: 'experience-letter',
      name: 'Experience Letter',
      description: 'Generate experience letters with accurate employment details and company letterhead.',
      icon: 'Briefcase',
      color: '#0D9488',
      gradient: 'from-teal-500 to-teal-700',
      category: 'HR',
    },
    {
      id: 'appointment-letter',
      name: 'Appointment Letter',
      description: 'Create formal appointment letters with roles, responsibilities, and joining details.',
      icon: 'ClipboardList',
      color: '#EA580C',
      gradient: 'from-orange-500 to-orange-700',
      category: 'HR',
    },
    {
      id: 'salary-slip',
      name: 'Salary Slip',
      description: 'Automate monthly salary slip generation with earnings, deductions, and tax details.',
      icon: 'Banknote',
      color: '#16A34A',
      gradient: 'from-green-500 to-green-700',
      category: 'Finance',
    },
  ]

  for (const app of apps) {
    await prisma.application.create({ data: app })
  }

  // Define metric helper function
  const createMonthsForApp = (appId, baseDocs, baseRevenue) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((month, idx) => ({
      month,
      documents: Math.round(baseDocs * (0.7 + Math.random() * 0.6)),
      revenue: Math.round(baseRevenue * (0.8 + Math.random() * 0.4)),
      orderIndex: idx + 1,
      appId
    }))
  }

  // ==================== 1. INVOICE AUTOMATION ====================
  console.log('Seeding Invoice Automation...')
  const seededInvClients = [
    await prisma.client.create({
      data: {
        company: 'TechNova Solutions', contactPerson: 'Arjun Sharma', email: 'arjun@technova.in', phone: '+91 98765 43210',
        gstNumber: '27AAPCA1234B1Z1', address: '42 Tech Park, Whitefield', city: 'Bengaluru', country: 'India',
        postalCode: '560066', paymentTerms: 'Net 30', notes: 'Premium client', logo: 'TN', documentsCount: 2, status: 'active',
        revenue: 480000.0, appId: 'invoice'
      }
    }),
    await prisma.client.create({
      data: {
        company: 'FreshMart Retail', contactPerson: 'Kavya Krishnan', email: 'kavya@freshmart.in', phone: '+91 54321 09876',
        gstNumber: '33AABCF5678F5Z5', address: '88 Retail Plaza, Anna Nagar', city: 'Chennai', country: 'India',
        postalCode: '600040', paymentTerms: 'Net 30', notes: 'Retail chain', logo: 'FM', documentsCount: 1, status: 'active',
        revenue: 420000.0, appId: 'invoice'
      }
    }),
    await prisma.client.create({
      data: {
        company: 'Pinnacle Finance', contactPerson: 'Rahul Verma', email: 'rahul@pinnaclefin.com', phone: '+91 98760 43210',
        gstNumber: '11AABCP2345L1Z1', address: '18 Financial District', city: 'Mumbai', country: 'India',
        postalCode: '400051', paymentTerms: 'Net 30', notes: 'NBFC client', logo: 'PF', documentsCount: 1, status: 'active',
        revenue: 680000.0, appId: 'invoice'
      }
    })
  ]

  await prisma.document.create({
    data: { title: 'Invoice #INV-2026-001 - TechNova', client: 'TechNova Solutions', status: 'completed', size: '128 KB', pages: 2, appId: 'invoice', clientId: seededInvClients[0].id }
  })
  await prisma.document.create({
    data: { title: 'Invoice #INV-2026-002 - FreshMart', client: 'FreshMart Retail', status: 'draft', size: '140 KB', pages: 2, appId: 'invoice', clientId: seededInvClients[1].id }
  })
  await prisma.document.create({
    data: { title: 'Invoice #INV-2026-003 - Pinnacle', client: 'Pinnacle Finance', status: 'completed', size: '115 KB', pages: 1, appId: 'invoice', clientId: seededInvClients[2].id }
  })

  await prisma.template.create({ data: { name: 'Professional Invoice A4', description: 'Clean A4 layout with GST calculations', preview: '/templates/invoice-1.jpg', usageCount: 243, isFavorite: true, tags: 'GST,Professional,Popular', appId: 'invoice' } })
  await prisma.template.create({ data: { name: 'Modern Invoice Dark', description: 'Premium template for startups', preview: '/templates/invoice-2.jpg', usageCount: 128, isFavorite: false, tags: 'Dark,Tech,Modern', appId: 'invoice' } })

  await prisma.activity.create({ data: { action: 'Created invoice', document: 'INV-2026-001', client: 'TechNova Solutions', type: 'create', appId: 'invoice' } })
  await prisma.activity.create({ data: { action: 'Downloaded', document: 'Invoice #INV-2026-003', client: 'Pinnacle Finance', type: 'download', appId: 'invoice' } })

  for (const m of createMonthsForApp('invoice', 80, 250000)) {
    await prisma.monthlyMetric.create({ data: m })
  }

  // ==================== 2. OFFER LETTER GENERATOR ====================
  console.log('Seeding Offer Letter Generator...')
  const seededOfferClients = [
    await prisma.client.create({
      data: {
        company: 'ByteForge Technologies', contactPerson: 'Vikram Singh', email: 'vikram@byteforge.io', phone: '+91 43210 98765',
        gstNumber: '09AABCB6789G6Z6', address: '5 IT Park, Sector 62', city: 'Noida', country: 'India',
        postalCode: '201309', paymentTerms: 'Net 15', notes: 'Hiring software engineers', logo: 'BF', documentsCount: 2, status: 'active',
        revenue: 95000.0, appId: 'offer-letter'
      }
    }),
    await prisma.client.create({
      data: {
        company: 'GlobalEdge Consulting', contactPerson: 'Priya Nair', email: 'priya@globaledge.com', phone: '+91 87654 32109',
        gstNumber: '07AABCG5678C2Z2', address: '15 Cyber City, DLF Phase 3', city: 'Gurugram', country: 'India',
        postalCode: '122002', paymentTerms: 'Net 15', notes: 'Consulting recruits', logo: 'GE', documentsCount: 1, status: 'active',
        revenue: 320000.0, appId: 'offer-letter'
      }
    })
  ]

  await prisma.document.create({
    data: { title: 'Offer Letter - Arjun Sharma', client: 'ByteForge Technologies', status: 'completed', size: '95 KB', pages: 3, appId: 'offer-letter', clientId: seededOfferClients[0].id }
  })
  await prisma.document.create({
    data: { title: 'Offer Letter - Vikram Singh (PM)', client: 'ByteForge Technologies', status: 'shared', size: '98 KB', pages: 3, appId: 'offer-letter', clientId: seededOfferClients[0].id }
  })

  await prisma.template.create({ data: { name: 'Internship Offer Letter', description: 'Harsha Perfect Solutions SDE Intern Offer Letter template', preview: '/templates/offer-1.jpg', usageCount: 189, isFavorite: true, tags: 'Corporate,Formal', appId: 'offer-letter' } })

  await prisma.activity.create({ data: { action: 'Created Offer Letter', document: 'Offer Letter - Arjun Sharma', client: 'ByteForge Technologies', type: 'create', appId: 'offer-letter' } })

  for (const m of createMonthsForApp('offer-letter', 30, 60000)) {
    await prisma.monthlyMetric.create({ data: m })
  }

  // ==================== 3. HR DOCUMENTS ====================
  console.log('Seeding HR Documents...')
  const seededHrClients = [
    await prisma.client.create({
      data: {
        company: 'SkyBuild Infra', contactPerson: 'Rohan Mehta', email: 'rohan@skybuild.co', phone: '+91 76543 21098',
        gstNumber: '24AADCS3456D3Z3', address: '7 Construction House, Satellite', city: 'Ahmedabad', country: 'India',
        postalCode: '380015', paymentTerms: 'Net 45', notes: 'Large infrastructure company', logo: 'SB', documentsCount: 2, status: 'active',
        revenue: 750000.0, appId: 'hr-documents'
      }
    })
  ]

  await prisma.document.create({
    data: { title: 'HR Policy - Remote Work Guidelines', client: 'SkyBuild Infra', status: 'completed', size: '245 KB', pages: 5, appId: 'hr-documents', clientId: seededHrClients[0].id }
  })

  await prisma.template.create({ data: { name: 'Relieving Letter', description: 'Relieving document for exit formalities', preview: '/templates/hr-2.jpg', usageCount: 156, isFavorite: true, tags: 'Relieving,Exit', appId: 'hr-documents' } })

  await prisma.activity.create({ data: { action: 'Generated HR Policy', document: 'HR Policy - Remote Work Guidelines', client: 'SkyBuild Infra', type: 'create', appId: 'hr-documents' } })

  for (const m of createMonthsForApp('hr-documents', 20, 35000)) {
    await prisma.monthlyMetric.create({ data: m })
  }



  // ==================== 5. CERTIFICATES ====================
  console.log('Seeding Certificates...')
  const seededCertClients = [
    await prisma.client.create({
      data: {
        company: 'EduSpark Institute', contactPerson: 'Prof. Rajan Gupta', email: 'rajan@eduspark.edu', phone: '+91 10987 65432',
        gstNumber: '10AABCE9012J9Z9', address: '100 Knowledge Park', city: 'Jaipur', country: 'India',
        postalCode: '302021', paymentTerms: 'Net 30', notes: 'Edu client', logo: 'ES', documentsCount: 2, status: 'active',
        revenue: 52000.0, appId: 'certificates'
      }
    })
  ]

  await prisma.document.create({
    data: { title: 'Certificate - Web Development Course', client: 'EduSpark Institute', status: 'shared', size: '210 KB', pages: 1, appId: 'certificates', clientId: seededCertClients[0].id }
  })

  await prisma.template.create({ data: { name: 'Certificate of Completion', description: 'Elegant course completion template', preview: '/templates/cert-1.jpg', usageCount: 278, isFavorite: true, tags: 'Course,Elegant', appId: 'certificates' } })

  await prisma.activity.create({ data: { action: 'Shared Certificate', document: 'Web Dev Certificate', client: 'EduSpark Institute', type: 'share', appId: 'certificates' } })

  for (const m of createMonthsForApp('certificates', 50, 18000)) {
    await prisma.monthlyMetric.create({ data: m })
  }



  // ==================== 7. RESUME ANALYZER ====================
  console.log('Seeding Resume Analyzer...')
  const seededAnalyzerClients = [
    await prisma.client.create({
      data: {
        company: 'GlobalEdge Consulting', contactPerson: 'Priya Nair', email: 'priya@globaledge.com', phone: '+91 87654 32109',
        gstNumber: '07AABCG5678C2Z2', address: '15 Cyber City', city: 'Gurugram', country: 'India',
        postalCode: '122002', paymentTerms: 'Net 15', notes: 'Resume screening', logo: 'GE', documentsCount: 1, status: 'active',
        revenue: 65000.0, appId: 'resume-analyzer'
      }
    })
  ]

  await prisma.document.create({
    data: { title: 'Resume Analysis - Senior JS Developer', client: 'GlobalEdge Consulting', status: 'completed', size: '45 KB', pages: 1, appId: 'resume-analyzer', clientId: seededAnalyzerClients[0].id }
  })

  await prisma.template.create({ data: { name: 'Resume Evaluation Matrix', description: 'Template to grade candidate resumes against JDs', preview: '/templates/analysis-1.jpg', usageCount: 45, isFavorite: true, tags: 'Review,ATS', appId: 'resume-analyzer' } })

  await prisma.activity.create({ data: { action: 'Analyzed resume', document: 'Resume Analysis - Senior JS Developer', client: 'GlobalEdge Consulting', type: 'create', appId: 'resume-analyzer' } })

  for (const m of createMonthsForApp('resume-analyzer', 25, 45000)) {
    await prisma.monthlyMetric.create({ data: m })
  }

  // ==================== 8. EXPERIENCE LETTER ====================
  console.log('Seeding Experience Letter...')
  const seededExpClients = [
    await prisma.client.create({
      data: {
        company: 'SkyBuild Infra', contactPerson: 'Rohan Mehta', email: 'rohan@skybuild.co', phone: '+91 76543 21098',
        gstNumber: '24AADCS3456D3Z3', address: '7 Construction House', city: 'Ahmedabad', country: 'India',
        postalCode: '380015', paymentTerms: 'Net 45', notes: 'Exit documentation', logo: 'SB', documentsCount: 1, status: 'active',
        revenue: 25000.0, appId: 'experience-letter'
      }
    })
  ]

  await prisma.document.create({
    data: { title: 'Experience Letter - Santhosh Kumar', client: 'SkyBuild Infra', status: 'completed', size: '75 KB', pages: 1, appId: 'experience-letter', clientId: seededExpClients[0].id }
  })

  await prisma.template.create({ data: { name: 'Standard Experience Letter', description: 'Standard template detailing employment details', preview: '/templates/exp-1.jpg', usageCount: 213, isFavorite: true, tags: 'Standard,HR', appId: 'experience-letter' } })

  await prisma.activity.create({ data: { action: 'Created Experience Letter', document: 'Experience Letter - Santhosh Kumar', client: 'SkyBuild Infra', type: 'create', appId: 'experience-letter' } })

  for (const m of createMonthsForApp('experience-letter', 15, 20000)) {
    await prisma.monthlyMetric.create({ data: m })
  }

  // ==================== 9. APPOINTMENT LETTER ====================
  console.log('Seeding Appointment Letter...')
  const seededApptClients = [
    await prisma.client.create({
      data: {
        company: 'FreshMart Retail', contactPerson: 'Kavya Krishnan', email: 'kavya@freshmart.in', phone: '+91 54321 09876',
        gstNumber: '33AABCF5678F5Z5', address: '88 Retail Plaza', city: 'Chennai', country: 'India',
        postalCode: '600040', paymentTerms: 'Net 30', notes: 'Onboarding recruits', logo: 'FM', documentsCount: 1, status: 'active',
        revenue: 35000.0, appId: 'appointment-letter'
      }
    })
  ]

  await prisma.document.create({
    data: { title: 'Appointment Letter - Kavya Krishnan', client: 'FreshMart Retail', status: 'completed', size: '102 KB', pages: 2, appId: 'appointment-letter', clientId: seededApptClients[0].id }
  })

  await prisma.template.create({ data: { name: 'Standard Appointment Letter', description: 'Appointment contract with joining instructions', preview: '/templates/apt-1.jpg', usageCount: 134, isFavorite: false, tags: 'Appointment,Onboarding', appId: 'appointment-letter' } })

  await prisma.activity.create({ data: { action: 'Generated Appointment Letter', document: 'Appointment Letter - Kavya Krishnan', client: 'FreshMart Retail', type: 'create', appId: 'appointment-letter' } })

  for (const m of createMonthsForApp('appointment-letter', 18, 25000)) {
    await prisma.monthlyMetric.create({ data: m })
  }

  // ==================== 10. SALARY SLIP ====================
  console.log('Seeding Salary Slip...')
  const seededSalaryClients = [
    await prisma.client.create({
      data: {
        company: 'TechNova Solutions', contactPerson: 'Arjun Sharma', email: 'arjun@technova.in', phone: '+91 98765 43210',
        gstNumber: '27AAPCA1234B1Z1', address: '42 Tech Park', city: 'Bengaluru', country: 'India',
        postalCode: '560066', paymentTerms: 'Net 30', notes: 'Monthly payroll processing', logo: 'TN', documentsCount: 1, status: 'active',
        revenue: 120000.0, appId: 'salary-slip'
      }
    })
  ]

  await prisma.document.create({
    data: { title: 'Salary Slip - June 2026', client: 'TechNova Solutions', status: 'completed', size: '78 KB', pages: 1, appId: 'salary-slip', clientId: seededSalaryClients[0].id }
  })

  await prisma.template.create({ data: { name: 'Pay Slip Detailed', description: 'Detailed payslip with earnings and deductions breakdown', preview: '/templates/salary-1.jpg', usageCount: 167, isFavorite: true, tags: 'Payroll,Detailed', appId: 'salary-slip' } })

  await prisma.activity.create({ data: { action: 'Created Salary Slip', document: 'Salary Slip - June 2026', client: 'TechNova Solutions', type: 'create', appId: 'salary-slip' } })

  for (const m of createMonthsForApp('salary-slip', 40, 100000)) {
    await prisma.monthlyMetric.create({ data: m })
  }

  console.log('Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
