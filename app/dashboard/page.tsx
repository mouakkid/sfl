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
  // Supabase SSR (cookies API : getAll / setAll)
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
  const serie: number[] = []
  for (let i = 5; i >= 0; i--) {
    const m = dayjs().subtract(i, 'month')
    labels.push(m.format('MMM YY'))
    const msum = orders
      .filter((o) => o.created_at && dayjs(o.created_at).isSame(m, 'month'))
      .reduce((s, o) => s + (o.sale_price ?? o.amount ?? 0), 0)
    serie.push(msum)
  }

  // Graph client-only (évite crash SSR)
  const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), { ssr: false })
  const chartData = { labels, datasets: [{ label: 'CA (6 derniers mois)', data: serie }] }

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
        <p className="text-sm text-red-600">
          Erreur Supabase : {String((error as any).message ?? error)}
        </p>
      )}
    </div>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}
