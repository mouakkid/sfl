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

  // Récup user (utile si RLS par utilisateur)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirect=/orders/new')
  }

  const v = (k: string) => String(formData.get(k) ?? '').trim()
  const n = (k: string) => {
    const raw = String(formData.get(k) ?? '').trim()
    return raw === '' ? null : Number.parseFloat(raw)
  }

  const payload = {
    customer_name: v('customer_name'),
    phone: v('phone') || null,
    instagram: v('instagram') || null,
    address: v('address') || null,
    purchase_price: n('purchase_price'),
    sale_price: n('sale_price'),
    amount: n('amount'),
    advance_amount: n('advance_amount'),
    status: v('status') || 'NEW',
    user_id: user!.id, // si RLS propriétaire
  }

  if (!payload.customer_name) {
    redirect('/orders/new?error=' + encodeURIComponent('Le nom client est requis'))
  }

  const { error } = await supabase.from('orders').insert([payload])

  if (error) {
    redirect('/orders/new?error=' + encodeURIComponent(error.message))
  }

  redirect('/orders')
}
