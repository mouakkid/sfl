// app/orders/delete/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: Request) {
  const jar = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => jar.getAll(), setAll: (l) => l.forEach(c => jar.set(c)) } }
  )

  // Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const to = new URL('/login', req.url)
    to.searchParams.set('redirect', '/orders')
    return NextResponse.redirect(to)
  }

  // Read form
  const form = await req.formData()
  const id = String(form.get('id') ?? '').trim()
  const to = new URL('/orders', req.url)

  if (!id) {
    to.searchParams.set('error', 'ID manquant')
    return NextResponse.redirect(to)
  }

  // Delete (RLS: nécessite user_id = auth.uid())
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) {
    to.searchParams.set('error', error.message)
  }
  return NextResponse.redirect(to)
}
