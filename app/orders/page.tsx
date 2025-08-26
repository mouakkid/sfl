// app/orders/page.tsx
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

type Order = {
  id: string
  created_at: string
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
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(n)

export default async function OrdersPage() {
  // Supabase côté serveur (cookies API getAll/setAll)
  const jar = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return jar.getAll()
        },
        setAll(list) {
          list.forEach((c) => jar.set(c))
        },
      },
    }
  )

  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, customer_name, phone, instagram, address, purchase_price, sale_price, amount, advance_amount, status')
    .order('created_at', { ascending: false })
    .limit(500)

  const rows: Order[] = Array.isArray(data) ? (data as Order[]) : []

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Link href="/orders/new?back=/orders" className="border rounded px-3 py-1">
          + Ajouter
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          Erreur Supabase : {String((error as any).message ?? error)}
        </p>
      )}

      {!error && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucune commande pour l’instant.</p>
      )}
