'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AppData {
  id: string
  desired_role: string
  message: string | null
  user: { nickname: string; id: string } | null
}

export default function ManageApplications({ applications }: { applications: AppData[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)

  async function handleDecision(appId: string, userId: string, releaseId: string, role: string, accept: boolean) {
    setProcessing(appId)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Обновляем статус заявки
    await supabase.from('applications').update({
      status: accept ? 'accepted' : 'rejected',
      reviewed_by: user.id,
      review_date: new Date().toISOString(),
    }).eq('id', appId)

    // Если принята — добавляем в участники релиза
    if (accept) {
      await supabase.from('release_members').insert({
        release_id: releaseId,
        user_id: userId,
        role_in_release: role,
        status: 'assigned',
        assigned_by: user.id,
      })
    }

    setProcessing(null)
    router.refresh()
  }

  if (applications.length === 0) return null

  return (
    <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-yellow-300">
        📩 Заявки ({applications.length})
      </h2>
      <div className="space-y-3">
        {applications.map((app: any) => (
          <div key={app.id} className="bg-gray-900/50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{app.user?.nickname}</p>
              <p className="text-sm text-gray-400">Хочет: {app.desired_role}</p>
              {app.message && <p className="text-sm text-gray-500 mt-1">«{app.message}»</p>}
            </div>
            <div className="flex gap-2">
              {processing === app.id ? (
                <span className="text-xs text-gray-500">Обработка...</span>
              ) : (
                <>
                  <button
                    onClick={() => handleDecision(app.id, app.user?.id, app.release_id, app.desired_role, true)}
                    className="px-3 py-1.5 bg-green-800 hover:bg-green-700 rounded-lg text-sm text-green-300 transition-colors">
                    ✓ Принять
                  </button>
                  <button
                    onClick={() => handleDecision(app.id, app.user?.id, app.release_id, app.desired_role, false)}
                    className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900 rounded-lg text-sm text-red-400 transition-colors">
                    ✕ Отклонить
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
