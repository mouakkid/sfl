import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { deleteOrderAction } from './actions'

type Search = {
  q?: string
  status?: string
  from?: string
  to?: string
  min?: string
  max?: string
}

type Order = {
  id: string
  created_at: string | null
  customer_name: string | null
  phone?: string | null
  instagram?: string | null
  address?: string | null
  purchase_price?: number | null
  sale_price?: number | null
  amount?: number | null
  advance_amount?: number | null
  status?: string | null
}

const fmtMAD = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(n || 0)

export default async function OrdersPage({ searchParams }: { searchParams: Search }) {
  const { q = '', status = 'ALL', from = '', to = '', min = '', max = '' } = searchParams || {}

  const jar = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => jar.getAll(), setAll: (l) => l.forEach(c => jar.set(c)) } }
  )

  let query = supabase.from('orders').select('*', { count: 'exact' })

  if (q) {
    // recherche sur nom/phone/instagram
    query = query.or(`customer_name.ilike.%${q}%,phone.ilike.%${q}%,instagram.ilike.%${q}%`)
  }
  if (status && status !== 'ALL') {
    query = query.eq('status', status)
  }
  if (from) query = query.gte('created_at', from)
  if (to)   query = query.lte('created_at', to)
  if (min)  query = query.gte('sale_price', Number(min))
  if (max)  query = query.lte('sale_price', Number(max))

  const { data, error } = await query.order('created_at', { ascending: false }).limit(500)

  const rows: Order[] = (Array.isArray(data) ? data : []) as unknown as Order[]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BoxIcon /> Orders
        </h1>
        <Link href="/orders/new?back=/orders" className="inline-flex items-center gap-2 border rounded px-3 py-1">
          <PlusIcon /> Ajouter
        </Link>
      </div>

      {/* Filtres */}
      <div className="rounded-2xl border p
