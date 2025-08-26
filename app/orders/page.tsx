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

  const cols = [
    'id',
    'created_at',
    'customer_name',
    'phone',
    'instagram',
    'address',
    'purchase_price',
    'sale_price',
    'amount',
    'advance_amount',
    'status',
  ].join(',')

  const { data, error } = await supabase
    .from('orders')
    .select(cols)
    .order('created_at', { ascending: false })
    .limit(500)

  // ✅ Fix TS: data peut être typée bizarrement (GenericStringError[])
  const rows: Order[] = (Array.isArray(data) ? data : []) as unknown as Order[]

  return (
    <div className="p-6 space-y-4">
      <div className="flex ite
