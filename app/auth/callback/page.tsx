'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient()

      // Проверяем code в URL (PKCE flow)
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          router.push('/dashboard')
          return
        }
      }

      // Проверяем hash fragment (implicit flow)
      if (window.location.hash) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push('/dashboard')
          return
        }
      }

      // Ждём событие авторизации
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session) {
            router.push('/dashboard')
          }
        }
      )

      // Таймаут — если ничего не произошло
      setTimeout(() => {
        router.push('/login?error=timeout')
      }, 10000)

      return () => subscription.unsubscribe()
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🎙️</div>
        <p className="text-gray-400 text-lg">Авторизация...</p>
      </div>
    </div>
  )
}
