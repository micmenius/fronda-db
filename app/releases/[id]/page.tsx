import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import ApplyButton from '@/components/ApplyButton'
import AssignMemberForm from '@/components/AssignMemberForm'
import ManageApplications from '@/components/ManageApplications'
import { Profile, RELEASE_STATUS_LABELS, RELEASE_STATUS_COLORS } from '@/lib/types'

export default async function ReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single<Profile>()

  const { data: release } = await supabase
    .from('releases')
    .select('*, curator:profiles!curator_id(nickname, id)')
    .eq('id', id)
    .single()

  if (!release) redirect('/releases')

  const { data: members } = await supabase
    .from('release_members')
    .select('*, user:profiles!user_id(nickname, avatar_url, status)')
    .eq('release_id', id)
    .order('assigned_date')

  // Проверяем, состоит ли пользователь уже в этом релизе
  const alreadyMember = members?.some((m: any) => m.user_id === user.id)

  // Проверяем, подавал ли уже заявку
  const { data: existingApp } = await supabase
    .from('applications')
    .select('id')
    .eq('release_id', id)
    .eq('user_id', user.id)
    .eq('status', 'new')
    .maybeSingle()

  const isCurator = profile?.user_role === 'curator' || profile?.user_role === 'admin'

  // Заявки (для кураторов)
  let applications: any[] = []
  if (isCurator) {
    const { data } = await supabase
      .from('applications')
      .select('*, user:profiles!user_id(nickname, id)')
      .eq('release_id', id)
      .eq('status', 'new')
    applications = data || []
  }

  return (
    <div className="min-h-screen">
      <Navbar profile={profile!} />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/releases" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">← Все релизы</Link>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{release.title}</h1>
              <p className="text-gray-400 text-sm">
                {release.type} · {release.department || ''} · Куратор: {release.curator ? (
                  <Link href={`/members/${release.curator.id}`} className="text-indigo-400 hover:text-indigo-300">{release.curator.nickname}</Link>
                ) : '—'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-lg text-sm text-white ${RELEASE_STATUS_COLORS[release.status as keyof typeof RELEASE_STATUS_COLORS]}`}>
              {RELEASE_STATUS_LABELS[release.status as keyof typeof RELEASE_STATUS_LABELS]}
            </span>
          </div>

          {release.description && <p className="text-gray-300 mb-4">{release.description}</p>}

          <div className="bg-gray-800 rounded-full h-3 mb-2">
            <div className="bg-indigo-600 rounded-full h-3 transition-all"
              style={{ width: release.episode_count ? `${(release.current_episode / release.episode_count) * 100}%` : '0%' }} />
          </div>
          <p className="text-sm text-gray-400">{release.current_episode} / {release.episode_count} эпизодов</p>
        </div>

        {/* Команда */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">👥 Команда</h2>
          {(!members || members.length === 0) ? (
            <p className="text-gray-500">Команда пока не набрана</p>
          ) : (
            <div className="space-y-3">
              {members.map((rm: any) => (
                <div key={rm.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {rm.user?.avatar_url ? (
                      <img src={rm.user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">{rm.user?.nickname?.[0]}</div>
                    )}
                    <div>
                      <Link href={`/members/${rm.user_id}`} className="font-medium hover:text-indigo-400 transition-colors">{rm.user?.nickname}</Link>
                      <p className="text-sm text-gray-400">{rm.role_in_release}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    rm.status === 'completed' ? 'bg-green-900/50 text-green-400'
                    : rm.status === 'dropped' ? 'bg-red-900/50 text-red-400'
                    : 'bg-gray-800 text-gray-400'
                  }`}>
                    {rm.status === 'completed' ? '✅ Сдал' : rm.status === 'dropped' ? '❌ Дропнул' : rm.status === 'in_progress' ? '🟢 В работе' : '🟡 Назначен'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Кнопка назначения — для кураторов */}
          {isCurator && <AssignMemberForm releaseId={id} />}
        </div>

        {/* Кнопка заявки — для обычных участников */}
        {release.status === 'recruiting' && !alreadyMember && !existingApp && !isCurator && (
          <div className="mb-6">
            <ApplyButton releaseId={id} />
          </div>
        )}

        {existingApp && !alreadyMember && (
          <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-4 mb-6 text-center">
            <p className="text-blue-400">📩 Твоя заявка на рассмотрении</p>
          </div>
        )}

        {/* Заявки — для кураторов */}
        {isCurator && <ManageApplications applications={applications} />}
      </main>
    </div>
  )
}
