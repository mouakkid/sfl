import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import OrdersTable from '@/components/orders/OrdersTable'

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

export default async function OrdersPage() {
  const jar = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return jar.getAll() },
        setAll(list) { list.forEach(c => jar.set(c)) },
      },
    }
  )

  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, customer_name, phone, instagram, address, purchase_price, sale_price, amount, advance_amount, status')
    .order('created_at', { ascending: false })
    .limit(500)

  const rows = Array.isArray(data) ? data as Order[] : []

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>
      {error ? (
        <p className="text-sm text-red-600">Erreur Supabase : {String((error as any).message ?? error)}</p>
      ) : (
        <OrdersTable rows={rows} />
      )}
    </div>
  )
}
