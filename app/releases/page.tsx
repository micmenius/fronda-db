import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Profile, RELEASE_STATUS_LABELS, RELEASE_STATUS_COLORS } from '@/lib/types'

export default async function ReleasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single<Profile>()
  const { data: releases } = await supabase
    .from('releases')
    .select('*, curator:profiles!curator_id(nickname)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      <Navbar profile={profile!} />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🎬 Релизы</h1>
          {(profile?.user_role === 'curator' || profile?.user_role === 'admin') && (
            <Link href="/releases/new" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition-colors">+ Новый релиз</Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(releases || []).map((release: any) => (
            <Link key={release.id} href={`/releases/${release.id}`}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{release.title}</h3>
                <span className={`px-2 py-0.5 rounded text-xs text-white ${RELEASE_STATUS_COLORS[release.status as keyof typeof RELEASE_STATUS_COLORS]}`}>
                  {RELEASE_STATUS_LABELS[release.status as keyof typeof RELEASE_STATUS_LABELS]}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{release.description || 'Без описания'}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Куратор: {release.curator?.nickname || '—'}</span>
                <span>{release.current_episode}/{release.episode_count} эп.</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
