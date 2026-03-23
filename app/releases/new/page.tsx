'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { Profile } from '@/lib/types'
import { useEffect } from 'react'

export default function NewReleasePage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [type, setType] = useState('anime')
  const [department, setDepartment] = useState('')
  const [description, setDescription] = useState('')
  const [episodeCount, setEpisodeCount] = useState(12)
  const [status, setStatus] = useState('planning')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single<Profile>()
      if (data) {
        if (data.user_role === 'member') { router.push('/releases'); return }
        setProfile(data)
      }
    }
    load()
  }, [])

  async function handleSubmit() {
    if (!profile || !title.trim()) return
    setSaving(true)

    const { data, error } = await supabase
      .from('releases')
      .insert({
        title: title.trim(),
        type,
        department: department || null,
        description,
        episode_count: episodeCount,
        current_episode: 0,
        status,
        curator_id: profile.id,
      })
      .select()
      .single()

    setSaving(false)
    if (!error && data) {
      router.push(`/releases/${data.id}`)
    }
  }

  if (!profile) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Загрузка...</p></div>

  return (
    <div className="min-h-screen">
      <Navbar profile={profile} />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">🎬 Новый релиз</h1>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Название *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Тетрадь смерти"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Тип</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none">
                    <option value="anime">Аниме</option>
                    <option value="film">Фильм</option>
                    <option value="series">Сериал</option>
                    <option value="game">Игра</option>
                    <option value="special">Спешл</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Статус</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none">
                    <option value="planning">Планируется</option>
                    <option value="recruiting">Набор</option>
                    <option value="in_progress">В работе</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Отдел</label>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Дубляж, каверы..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Кол-во эпизодов</label>
                  <input type="number" value={episodeCount} onChange={(e) => setEpisodeCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Описание</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={3} placeholder="Полный дубляж, нужен мужской и женский каст..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white resize-none focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push('/releases')}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
              Отмена
            </button>
            <button onClick={handleSubmit} disabled={saving || !title.trim()}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 rounded-xl font-medium transition-colors">
              {saving ? 'Создаю...' : 'Создать релиз'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
