import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { SVGProps } from 'react'
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
            <input name="min" type="number" step="0.01" defaultValue={min} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Max (MAD)</label>
            <input name="max" type="number" step="0.01" defaultValue={max} className="w-full border rounded p-2" />
          </div>

          <div className="md:col-span-6 flex gap-2">
            <button className="inline-flex items-center gap-2 border rounded px-3 py-1" type="submit">
              <FilterIcon /> Filtrer
            </button>
            <Link href="/orders" className="inline-flex items-center gap-2 border rounded px-3 py-1">
              Réinitialiser
            </Link>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <Th>Date</Th>
              <Th>Client</Th>
              <Th>Téléphone</Th>
              <Th>Instagram</Th>
              <Th>Montant</Th>
              <Th>Statut</Th>
              <Th className="text-right pr-3">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr><td colSpan={7} className="p-3 text-red-600">Erreur Supabase : {String((error as any).message ?? error)}</td></tr>
            )}
            {!error && rows.length === 0 && (
              <tr><td colSpan={7} className="p-3 text-gray-500">Aucune commande pour l’instant.</td></tr>
            )}
            {!error && rows.map((o) => {
              const amount = (o.sale_price ?? o.amount ?? 0) as number
              return (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <Td>{o.created_at ? new Date(o.created_at).toLocaleString('fr-FR') : '-'}</Td>
                  <Td>{o.customer_name ?? '-'}</Td>
                  <Td>{o.phone ?? '-'}</Td>
                  <Td>{o.instagram ?? '-'}</Td>
                  <Td>{fmtMAD(Number(amount) || 0)}</Td>
                  <Td><StatusBadge value={o.status ?? 'NEW'} /></Td>
                  <Td className="text-right">
                    <div className="inline-flex items-center gap-2 pr-1">
                      <Link href={`/orders/${o.id}/edit?back=/orders`} className="inline-flex items-center gap-1 px-2 py-1 border rounded">
                        <EditIcon /> Modifier
                      </Link>
                      <form action={deleteOrderAction}>
                        <input type="hidden" name="id" value={o.id} />
                        <button className="inline-flex items-center gap-1 px-2 py-1 border rounded text-red-600" type="submit">
                          <TrashIcon /> Supprimer
                        </button>
                      </form>
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- UI helpers ---------- */
function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left py-2 px-3 font-medium text-gray-700 ${className}`}>{children}</th>
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-2 px-3 align-top ${className}`}>{children}</td>
}
function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    NEW: 'bg-gray-100 text-gray-700',
    PAID: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    SHIPPED: 'bg-blue-100 text-blue-700',
  }
  const cls = map[value] || map.NEW
  return <span className={`inline-block px-2 py-0.5 rounded text-xs ${cls}`}>{value}</span>
}

/* ---------- Icônes inline ---------- */
function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (<svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14"/><path d="M5 12h14"/></svg>)
}
function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (<svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>)
}
function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (<svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 3H2l8 9v7l4 2v-9l8-9z"/></svg>)
}
function EditIcon(props: SVGProps<SVGSVGElement>) {
  return (<svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>)
}
function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (<svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4h8v2"/></svg>)
}
function BoxIcon(props: SVGProps<SVGSVGElement>) {
  return (<svg {...props} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m21 16-8 5-8-5V8l8-5 8 5z"/><path d="m3.3 7 8 5 8-5"/></svg>)
}
