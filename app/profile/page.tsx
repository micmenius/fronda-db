'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { Profile, ALL_ROLES, WORKLOAD_LABELS, Workload } from '@/lib/types'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single<Profile>()
    if (data) setProfile(data)
  }

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    setSaved(false)
    await supabase.from('profiles').update({
      nickname: profile.nickname,
      telegram: profile.telegram,
      bio: profile.bio,
      voice_sample_url: profile.voice_sample_url,
      roles: profile.roles,
      workload: profile.workload,
      max_parallel_releases: profile.max_parallel_releases,
      future_wishes: profile.future_wishes,
      updated_at: new Date().toISOString(),
    }).eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function toggleRole(role: string) {
    if (!profile) return
    const roles = profile.roles.includes(role)
      ? profile.roles.filter((r) => r !== role)
      : [...profile.roles, role]
    setProfile({ ...profile, roles })
  }

  if (!profile) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Загрузка...</p></div>

  return (
    <div className="min-h-screen">
      <Navbar profile={profile} />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">⚙️ Мой профиль</h1>
          <button onClick={saveProfile} disabled={saving}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 rounded-xl font-medium transition-colors">
            {saving ? 'Сохраняю...' : saved ? '✓ Сохранено!' : 'Сохранить'}
          </button>
        </div>

        <div className="space-y-6">
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4">Основное</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Никнейм</label>
                <input type="text" value={profile.nickname}
                  onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Discord</label>
                <input type="text" value={profile.discord_username || ''} disabled
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Telegram</label>
                <input type="text" value={profile.telegram || ''}
                  onChange={(e) => setProfile({ ...profile, telegram: e.target.value })}
                  placeholder="@username"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Проба голоса (ссылка)</label>
                <input type="text" value={profile.voice_sample_url || ''}
                  onChange={(e) => setProfile({ ...profile, voice_sample_url: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-1">О себе</label>
              <textarea value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3} placeholder="Пара слов о себе..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white resize-none focus:border-indigo-500 focus:outline-none" />
            </div>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4">Мои роли</h2>
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map((role) => (
                <button key={role} onClick={() => toggleRole(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    profile.roles.includes(role) ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}>
                  {profile.roles.includes(role) ? '✓ ' : ''}{role}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4">Моя загрузка</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Сейчас</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(WORKLOAD_LABELS) as [Workload, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => setProfile({ ...profile, workload: key })}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        profile.workload === key ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Максимум параллельных релизов</label>
                <select value={profile.max_parallel_releases}
                  onChange={(e) => setProfile({ ...profile, max_parallel_releases: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none">
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-1">Что хочу попробовать</label>
              <textarea value={profile.future_wishes}
                onChange={(e) => setProfile({ ...profile, future_wishes: e.target.value })}
                rows={2} placeholder="Хочу озвучить злодея..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white resize-none focus:border-indigo-500 focus:outline-none" />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
