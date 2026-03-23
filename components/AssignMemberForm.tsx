'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'

export default function AssignMemberForm({ releaseId }: { releaseId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [selected, setSelected] = useState<Profile | null>(null)
  const [roleInRelease, setRoleInRelease] = useState('')
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (search.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('nickname', `%${search}%`)
        .eq('status', 'active')
        .limit(5)
      setResults(data || [])
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  async function handleAssign() {
    if (!selected || !roleInRelease.trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('release_members').insert({
      release_id: releaseId,
      user_id: selected.id,
      role_in_release: roleInRelease.trim(),
      status: 'assigned',
      assigned_by: user.id,
      curator_comment: comment.trim() || null,
    })

    setSaving(false)
    if (!error) {
      setOpen(false)
      setSelected(null)
      setSearch('')
      setRoleInRelease('')
      setComment('')
      router.refresh()
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded-xl font-medium transition-colors text-sm">
        + Добавить участника
      </button>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-4">
      <h3 className="font-semibold mb-4">Назначить участника</h3>

      {!selected ? (
        <div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по нику..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none mb-2" />
          {results.length > 0 && (
            <div className="space-y-1">
              {results.map((p) => (
                <button key={p.id} onClick={() => { setSelected(p); setSearch('') }}
                  className="w-full text-left bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 transition-colors">
                  <span className="font-medium">{p.nickname}</span>
                  <span className="text-gray-500 text-sm ml-2">{p.roles.join(', ')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
            <span className="font-medium">{selected.nickname}</span>
            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-sm">✕ Сменить</button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Роль на релизе *</label>
            <input type="text" value={roleInRelease} onChange={(e) => setRoleInRelease(e.target.value)}
              placeholder="Даббер — озвучивает Лайта"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Комментарий</label>
            <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Прошёл прослушивание"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setOpen(false)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
              Отмена
            </button>
            <button onClick={handleAssign} disabled={saving || !roleInRelease.trim()}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Назначаю...' : 'Назначить'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
