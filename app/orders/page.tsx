import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { SVGProps } from 'react'

type Search = {
  q?: string
  status?: string
  from?: string
  to?: string
  min?: string
  max?: string
  error?: string
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
  const { q = '', status = 'ALL', from = '', to = '', min = '', max = '', error: errMsg = '' } =
    searchParams || {}

  // URL pour l’export avec les mêmes filtres
  const qs = new URLSearchParams()
  if (q) qs.set('q', q)
  if (status) qs.set('status', status)
  if (from) qs.set('from', from)
  if (to) qs.set('to', to)
  if (min) qs.set('min', min)
  if (max) qs.set('max', max)
  const exportHref = `/orders/export${qs.toString() ? `?${qs.toString()}` : ''}`

  const jar = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => jar.getAll(), setAll: (l) => l.forEach(c => jar.set(c)) } }
  )

  let query = supabase.from('orders').select('*', { count: 'exact' })

  if (q) {
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
        <div className="flex items-center gap-2">
          <Link href={exportHref} className="inline-flex items-center gap-2 border rounded px-3 py-1">
            <DownloadIcon /> Exporter
          </Link>
          <Link href="/orders/new?back=/orders" className="inline-flex items-center gap-2 border rounded px-3 py-1">
            <PlusIcon /> Ajouter
          </Link>
        </div>
      </div>

      {/* Bannière d’erreur (policies, etc.) */}
      {errMsg && (
        <div className="rounded border border-red-300 bg-red-50 text-red-700 p-3 text-sm">
          {decodeURIComponent(errMsg)}
        </div>
      )}

      {/* Filtres */}
      <div className="rounded-2xl border p-4">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Recherche</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500"><SearchIcon /></span>
              <input name="q" defaultValue={q} placeholder="Nom, téléphone, Instagram"
                     className="w-full border rounded p-2" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Statut</label>
            <div className="relative">
              <select name="status" defaultValue={status} className="w-full border rounded p-2 pr-8">
                <option value="ALL">Tous</option>
                <option value="NEW">NEW</option>
                <option value="PAID">PAID</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="SHIPPED">SHIPPED</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"><FilterIcon /></div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">De</label>
            <input name="from" type="date" defaultValue={from} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">À</label>
            <input name="to" type="date" defaultValue={to} className="w-full border rounded p-2" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Min (MAD)</label>
            <input name="min" type="number"
