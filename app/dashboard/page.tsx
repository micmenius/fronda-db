import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Profile, Release, RELEASE_STATUS_LABELS, STATUS_LABELS, STATUS_COLORS, WORKLOAD_LABELS, WORKLOAD_COLORS } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile) redirect('/login')

  const { data: myReleases } = await supabase
    .from('release_members')
    .select('*, release:releases(*)')
    .eq('user_id', user.id)
    .neq('status', 'dropped')

  const { data: openReleases } = await supabase
    .from('releases')
    .select('*')
    .eq('status', 'recruiting')
    .order('created_at', { ascending: false })
    .limit(5)

  await supabase
    .from('profiles')
    .update({ last_activity: new Date().toISOString() })
    .eq('id', user.id)

  return (
    <div className="min-h-screen">
      <Navbar profile={profile} />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">Привет, {profile.nickname}! 👋</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">🎬 Мои релизы</h2>
              {(!myReleases || myReleases.length === 0) ? (
                <p className="text-gray-500">Пока нет активных релизов</p>
              ) : (
                <div className="space-y-3">
                  {myReleases.map((rm: any) => (
                    <Link key={rm.id} href={`/releases/${rm.release.id}`}
                      className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                      <div>
                        <p className="font-medium">{rm.release.title}</p>
                        <p className="text-sm text-gray-400">{rm.role_in_release}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">{rm.release.current_episode}/{rm.release.episode_count} эп.</p>
                        <p className="text-xs text-gray-500">{RELEASE_STATUS_LABELS[rm.release.status as keyof typeof RELEASE_STATUS_LABELS]}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">🔥 Открытый набор</h2>
              {(!openReleases || openReleases.length === 0) ? (
                <p className="text-gray-500">Сейчас нет открытых наборов</p>
              ) : (
                <div className="space-y-3">
                  {openReleases.map((rel: Release) => (
                    <Link key={rel.id} href={`/releases/${rel.id}`}
                      className="block bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                      <p className="font-medium">{rel.title}</p>
                      <p className="text-sm text-gray-400">{rel.description}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">📊 Мой статус</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Статус</span>
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[profile.status]}`} />
                    {STATUS_LABELS[profile.status]}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Загрузка</span>
                  <span className={WORKLOAD_COLORS[profile.workload]}>{WORKLOAD_LABELS[profile.workload]}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Релизов</span>
                  <span>{myReleases?.length || 0} / {profile.max_parallel_releases}</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-2">
                  {profile.roles.map((role) => (
                    <span key={role} className="px-2 py-0.5 bg-indigo-900/50 text-indigo-300 rounded text-xs">{role}</span>
                  ))}
                </div>
              </div>
              <Link href="/profile" className="block text-center mt-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors">
                Редактировать профиль
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
