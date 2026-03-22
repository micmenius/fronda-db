'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 p-10 rounded-2xl shadow-2xl text-center max-w-md w-full">
        <div className="text-5xl mb-4">🎙️</div>
        <h1 className="text-3xl font-bold text-white mb-2">Фронда</h1>
        <p className="text-gray-400 mb-8">База команды озвучки</p>
        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-lg"
        >
          🎮 Войти через Discord
        </button>
      </div>
    </div>
  )
}
