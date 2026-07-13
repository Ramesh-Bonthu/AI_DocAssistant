'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function AppIndexPage() {
  const params = useParams()
  const router = useRouter()
  const appId = params?.appId as string

  useEffect(() => {
    if (appId) router.replace(`/app/${appId}/dashboard`)
  }, [appId, router])

  return (
    <div className="flex items-center justify-center h-full bg-slate-50">
      <Loader2 className="text-blue-600 animate-spin" size={28} />
    </div>
  )
}
