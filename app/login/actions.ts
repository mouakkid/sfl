'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'

export async function signInAction(formData: FormData) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const redirectTo = String(formData.get('redirect') || '/dashboard')

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(list) { list.forEach((c) => cookieStore.set(c)) },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  redirect(redirectTo)
}
