'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'

function supaFromCookies() {
  const jar = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return jar.getAll() },
        setAll(list) { list.forEach((c) => jar.set(c)) },
      },
    }
  )
}

// CREATE
export async function createOrderAction(formData: FormData) {
  const supabase = supaFromCookies()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/orders/new')

  const v = (k: string) => String(formData.get(k) ?? '').trim()
  const n = (k: string) => {
    const raw = v(k)
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
    user_id: user.id,
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

// UPDATE
export async function updateOrderAction(formData: FormData) {
  const supabase = supaFromCookies()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/orders')

  const id = String(formData.get('id') ?? '')
  if (!id) redirect('/orders?error=' + encodeURIComponent('ID manquant'))

  const v = (k: string) => String(formData.get(k) ?? '').trim()
  const n = (k: string) => {
    const raw = v(k)
    return raw === '' ? null : Number.parseFloat(raw)
  }

  const patch: Record<string, unknown> = {
    customer_name: v('customer_name') || null,
    phone: v('phone') || null,
    instagram: v('instagram') || null,
    address: v('address') || null,
    purchase_price: n('purchase_price'),
    sale_price: n('sale_price'),
    amount: n('amount'),
    advance_amount: n('advance_amount'),
    status: v('status') || 'NEW',
  }

  const { error } = await supabase.from('orders').update(patch).eq('id', id)
  if (error) {
    redirect(`/orders/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  redirect('/orders')
}

// DELETE
export async function deleteOrderAction(formData: FormData) {
  const supabase = supaFromCookies()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/orders')

  const id = String(formData.get('id') ?? '')
  if (!id) redirect('/orders?error=' + encodeURIComponent('ID manquant'))

  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) {
    redirect('/orders?error=' + encodeURIComponent(error.message))
  }

  redirect('/orders')
}
