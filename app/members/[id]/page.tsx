import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import AddNoteForm from '@/components/AddNoteForm'
import { Profile, STATUS_LABELS, STATUS_COLORS, WORKLOAD_LABELS, WORKLOAD_COLORS } from '@/lib/types'

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single<Profile>()
  const { data: member } = await supabase.from('profiles').select('*').eq('id', id).single<Profile>()
  if (!member) redirect('/members')

  const { data: releases } = await supabase
    .from('release_members')
    .select('*, release:releases(*)')
    .eq('user_id', id)
    .order('assigned_date', { ascending: false })

  let notes: any[] = []
  if (myProfile?.user_role === 'curator' || myProfile?.user_role === 'admin') {
    const { data } = await supabase
      .from('private_notes')
      .select('*, author:profiles!author_id(nickname)')
      .eq('about_user_id', id)
      .order('created_at', { ascending: false })
    notes = data || []
  }

  const daysSinceActivity = Math.floor((Date.now() - new Date(member.last_activity).getTime()) / 86400000)

  return (
    <div className="min-h-screen">
      <Navbar profile={myProfile!} />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/members" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">← Назад</Link>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-5">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt="" className="w-20 h-20 rounded-full" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-3xl">{member.nickname[0]}</div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{member.nickname}</h1>
                <span className="flex items-center gap-1.5 text-sm">
                  <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[member.status]}`} />
                  {STATUS_LABELS[member.status]}
                </span>
              </div>
              {member.discord_username && <p className="text-gray-400 text-sm">Discord: {member.discord_username}</p>}
              {member.telegram && <p className="text-gray-400 text-sm">Telegram: {member.telegram}</p>}
              <p className="text-gray-500 text-sm mt-2">
                Во Фронде с {new Date(member.join_date).toLocaleDateString('ru-RU')} · Активность: {daysSinceActivity === 0 ? 'сегодня' : `${daysSinceActivity} дн. назад`}
              </p>
            </div>
          </div>

          {member.bio && <p className="mt-4 text-gray-300">{member.bio}</p>}

          <div className="mt-4 flex flex-wrap gap-4">
            <div>
              <span className="text-gray-500 text-sm">Роли: </span>
              {member.roles.map((role) => (
                <span key={role} className="px-2 py-0.5 bg-indigo-900/50 text-indigo-300 rounded text-sm mr-1">{role}</span>
              ))}
            </div>
            <div>
              <span className="text-gray-500 text-sm">Загрузка: </span>
              <span className={WORKLOAD_COLORS[member.workload]}>{WORKLOAD_LABELS[member.workload]}</span>
              <span className="text-gray-500 text-sm ml-1">(макс {member.max_parallel_releases})</span>
            </div>
          </div>

          {member.voice_sample_url && (
            <a href={member.voice_sample_url} target="_blank" rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 text-sm mt-3 inline-block">🔊 Проба голоса →</a>
          )}

          {member.future_wishes && (
            <div className="mt-3 text-sm">
              <span className="text-gray-500">Хочет: </span>
              <span className="text-gray-300">{member.future_wishes}</span>
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">🎬 Релизы</h2>
          {(!releases || releases.length === 0) ? (
            <p className="text-gray-500">Нет релизов</p>
          ) : (
            <div className="space-y-3">
              {releases.map((rm: any) => (
                <Link key={rm.id} href={`/releases/${rm.release.id}`}
                  className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                  <div>
                    <p className="font-medium">{rm.release.title}</p>
                    <p className="text-sm text-gray-400">{rm.role_in_release}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    rm.status === 'completed' ? 'bg-green-900/50 text-green-400'
                    : rm.status === 'dropped' ? 'bg-red-900/50 text-red-400'
                    : 'bg-gray-800 text-gray-400'
                  }`}>
                    {rm.status === 'completed' ? '✅ Завершён' : rm.status === 'dropped' ? '❌ Дропнул' : rm.status === 'in_progress' ? '🟢 В работе' : '🟡 Назначен'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Приватные заметки */}
        {(myProfile?.user_role === 'curator' || myProfile?.user_role === 'admin') && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-300">🔒 Заметки руководства</h2>
            {notes.length === 0 ? (
              <p className="text-gray-500">Заметок пока нет</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note: any) => (
                  <div key={note.id} className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-400">{note.author?.nickname}</span>
                      <span className="text-xs text-gray-600">{new Date(note.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                    {note.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 bg-red-900/50 text-red-300 rounded text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-gray-300">{note.content}</p>
                  </div>
                ))}
              </div>
            )}

            {myProfile?.user_role === 'admin' && (
              <AddNoteForm aboutUserId={id} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
