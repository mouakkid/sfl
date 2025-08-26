'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'

export async function createOrderAction(formData: FormData) {
  const jar = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return jar.getAll() },
        setAll(list) { list.forEach((c) => jar.set(c)) },
      },
    }
  )

  // user pour RLS (on écrit user_id)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const payload = {
    customer_name: String(formData.get('customer_name') || '').trim(),
    phone: String(formData.get('phone') || '').trim() || null,
    instagram: String(formData.get('instagram') || '').trim() || null,
    address: String(formData.get('address') || '').trim() || null,
    purchase_price: parseFloat(String(formData.get('purchase_price') || '')) || null,
    sale_price: parseFloat(String(formData.get('sale_price') || '')) || null,
    amount: parseFloat(String(formData.get('amount') || '')) || null,
    advance_amount: parseFloat(String(formData.get('advance_amount') || '')) || null,
    status: String(formData.get('status') || 'NEW'),
    user_id: user.id, // important si RLS = propriétaire
  }

  if (!payload.customer_name) return { error: 'Le nom client est requis' }

  const { error } = await supabase.from('orders').insert([payload])
  if (error) return { error: error.message }

  redirect('/orders')
}
