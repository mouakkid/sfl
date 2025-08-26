import dynamic from 'next/dynamic'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import dayjs from 'dayjs'

type Order = {
  id: string
  created_at: string
  purchase_price?: number | null
  sale_price?: number | null
  amount?: number | null
}

const fmtMAD = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(n)

export default async function DashboardPage() {
  // Supabase SSR avec cookies (API getAll/setAll)
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((c) => cookieStore.set(c))
        },
      },
    }
  )

  // Récupération des commandes (adapte le nom de table si besoin)
  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, purchase_price, sale_price, amount')
    .order('created_at', { ascending: true })
    .limit(1000)

  const orders: Order[] = Array.isArray(data) ? (data as Order[]) : []

  // KPIs
  const totalOrders = orders.length
  const revenue = orders.reduce((s, o) => s + (o.sale_price ?? o.amount ?? 0), 0)
  const cost = orders.reduce((s, o) => s + (o.purchase_price ?? 0), 0)
  const margin = revenue - cost

  // Série CA 6 derniers mois
  const labels: string[] = []
  con
