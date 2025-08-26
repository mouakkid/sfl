import dynamic from 'next/dynamic'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import dayjs from 'dayjs'

// Types souples (pas bloquants même si la table change un peu)
type Order = {
  id: string
  created_at: string
  purchase_price?: number | null
  sale_price?: number | null
  amount?: number | null // fallback si tu as un autre champ montant
}

// Petite utilitaire
const fmtMAD = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(n)

export default async function DashboardPage() {
  // ✅ Supabase côté serveur + cookies (API getAll/setAll)
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

  // 🔎 Récup données (adapté si ta table s'appelle différemment)
  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, purchase_price, sale_price, amount')
    .order('created_at', { ascending: true })
    .limit(1000)

  const orders: Order[] = Array.isArray(data) ? (data as Order[]) : []

  // 📊 KPIs
  const totalOrders = orders.length
  const revenue = orders.reduce(
    (s, o) => s + (o.sale_price ?? o.amount ?? 0),
    0
  )
  const cost = orders.reduce((s, o) => s + (o.purchase_price ?? 0), 0)
  const margin = revenue - cost

  // 📈 Série CA 6 derniers mois
  const labels: string[] = []
  const serie: number[] = []
  for (let i = 5; i >= 0; i--) {
    const m = dayjs().subtract(i, 'month')
    labels.push(m.format('MMM YY'))
    const msum = orders
      .filter((o) => o.created_at && dayjs(o.created_at).isSame(m, 'month'))
      .reduce((s, o) => s + (o.sale_price ?? o.amount ?? 0), 0)
    serie.push(msum)
  }

  // ⚠️ Graph client-only (évite les crash SSR)
  const RevenueChart = dynamic(
    () => import('@/components/charts/RevenueChart'),
    { ssr: false }
  )

  const chartData = {
    labels,
    datasets: [
      {
        label: 'CA (6 derniers mois)',
        data: serie,
      },
    ],
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Commandes" value={totalOrders.toLocaleString('fr-FR')} />
        <Card title="Chiffre d’affaires" value={fmtMAD(revenue)} />
        <Card title="Marge nette" value={fmtMAD(margin)} />
      </div>

      <div className="rounded-2xl border p-4">
        {orders.length ? (
          <RevenueChart data={chartData} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Pas encore de données… ajoute des commandes pour voir le graph.
          </p>
        )}
      </div>

      {error && (
