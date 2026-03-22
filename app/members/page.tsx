import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Profile, STATUS_LABELS, STATUS_COLORS, WORKLOAD_LABELS, WORKLOAD_COLORS } from '@/lib/types'

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single<Profile>()
  const { data: members } = await supabase.from('profiles').select('*').order('nickname')

  const params = await searchParams
  const filterRole = params?.role || ''
  const filterStatus = params?.status || ''
  const search = params?.search || ''

  let filtered = members || []
  if (search) filtered = filtered.filter((m: Profile) => m.nickname.toLowerCase().includes(search.toLowerCase()))
  if (filterRole) filtered = filtered.filter((m: Profile) => m.roles.includes(filterRole))
  if (filterStatus) filtered = filtered.filter((m: Profile) => m.status === filterStatus)

  return (
    <div className="min-h-screen">
      <Navbar profile={profile!} />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">👥 Люди ({filtered.length})</h1>

        <form className="flex flex-wrap gap-3 mb-6">
          <input name="search" defaultValue={search} placeholder="Поиск по нику..."
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none w-60" />
          <select name="role" defaultValue={filterRole}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
            <option value="">Все роли</option>
            <option value="Даббер">Даббер</option>
            <option value="Каверист">Каверист</option>
            <option value="Переводчик">Переводчик</option>
            <option value="Художник">Художник</option>
            <option value="Тайминг">Тайминг</option>
            <option value="Редактор">Редактор</option>
            <option value="Звукорежиссёр">Звукорежиссёр</option>
            <option value="Фиксер">Фиксер</option>
          </select>
          <select name="status" defaultValue={filterStatus}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white">
            <option value="">Все статусы</option>
            <option value="active">Активный</option>
            <option value="reserve">Резерв</option>
            <option value="blocked">Заблокирован</option>
            <option value="left">Ушёл</option>
          </select>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-medium transition-colors">Найти</button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member: Profile) => (
            <Link key={member.id} href={`/members/${member.id}`}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">{member.nickname[0]}</div>
                  )}
                  <div>
                    <p className="font-medium">{member.nickname}</p>
                    <p className={`text-xs ${WORKLOAD_COLORS[member.workload]}`}>{WORKLOAD_LABELS[member.workload]}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[member.status]}`} />
                  {STATUS_LABELS[member.status]}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {member.roles.map((role) => (
                  <span key={role} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">{role}</span>
                ))}
                {member.roles.length === 0 && <span className="text-xs text-gray-600">Роли не указаны</span>}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
