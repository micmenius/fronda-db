'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'

const navItems = [
  { href: '/dashboard', label: '🏠 Главная' },
  { href: '/members', label: '👥 Люди' },
  { href: '/releases', label: '🎬 Релизы' },
  { href: '/profile', label: '⚙️ Профиль' },
]

export default function Navbar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold text-white mr-6">🎙️ Фронда</span>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {profile?.user_role === 'admin' && (
            <Link
              href="/admin"
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname.startsWith('/admin')
                  ? 'bg-red-900/50 text-red-300'
                  : 'text-red-400/60 hover:text-red-300 hover:bg-red-900/30'
              }`}
            >
              🔒 Админ
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{profile?.nickname}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
    </nav>
  )
}
