'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ApplyButton({ releaseId }: { releaseId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [desiredRole, setDesiredRole] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!desiredRole.trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('applications').insert({
      user_id: user.id,
      release_id: releaseId,
      desired_role: desiredRole.trim(),
      message: message.trim() || null,
    })

    setSaving(false)
    if (!error) {
      setDone(true)
      setTimeout(() => {
        setOpen(false)
        setDone(false)
        setDesiredRole('')
        setMessage('')
        router.refresh()
      }, 2000)
    }
  }

  if (done) {
    return (
      <div className="bg-green-900/30 border border-green-800 rounded-xl p-4 text-center">
        <p className="text-green-400">✅ Заявка отправлена!</p>
      </div>
    )
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition-colors">
        📩 Подать заявку
      </button>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="font-semibold mb-4">📩 Подать заявку</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Кем хочу быть на релизе *</label>
          <input type="text" value={desiredRole} onChange={(e) => setDesiredRole(e.target.value)}
            placeholder="Даббер (мужской), переводчик..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Сообщение (необязательно)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            rows={2} placeholder="Есть опыт, могу показать примеры..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white resize-none focus:border-indigo-500 focus:outline-none" />
        </div>

        <div className="flex gap-2">
          <button onClick={() => setOpen(false)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
            Отмена
          </button>
          <button onClick={handleSubmit} disabled={saving || !desiredRole.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
            {saving ? 'Отправляю...' : 'Отправить'}
          </button>
        </div>
      </div>
    </div>
  )
}
