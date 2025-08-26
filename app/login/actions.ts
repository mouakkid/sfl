'use server'

import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { redirect } from 'next/navigation'

function getServerSupabase() {
  const store = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              store.set(name, value, options as CookieOptions)
            )
          } catch {
            // ignore set cookie errors on edge runtimes
          }
        },
      },
    }
  )
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const redirectTo = String(formData.get('redirect') ?? '/dashboard')

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent('Email et mot de passe requis')}&redirect=${encodeURIComponent(redirectTo)}`)
  }

  const supabase = getServerSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&redirect=${encodeURIComponent(redirectTo)}`)
  }

  // ✅ Cookies sb-access-token/sb-refresh-token sont posés ici par Supabase SSR
  redirect(redirectTo)
}
