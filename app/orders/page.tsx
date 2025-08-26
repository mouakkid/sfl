// app/orders/page.tsx
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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
    .select(
      'id, created_at, customer_name, phone, instagram, address, purchase_price, sale_price, amount, advance_amount,_
