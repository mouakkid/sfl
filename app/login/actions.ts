'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'

export async function signInAction(formData: FormData) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const to = String(formData.get('redirect') || '/dashboard')

  const supabase = createServerSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    // On renvoie une erreur lisible pour la page cliente
    return { ok: false, message: error.message }
  }

  // Déclenche la navigation côté serveur (pas de page blanche)
  redirect(to)
}
