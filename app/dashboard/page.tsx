// app/dashboard/page.tsx
export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

type Order = {
  created_at: string | null
  purchase_price?: number | null
  sale_price?: number | null
  amount?: number | null
  status?: string | null
}

type Bucket = {
  key: string
  label: string
  revenue: number
  cost: number
  net: number
  rate: number
}

const fmtMAD = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(n || 0)

const fmtPct = (x: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 }).format(x)

function firstDayOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}
function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1)
}
function ymKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function labelFR(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const y = d.getFullYear()
  return `${m}/${y}`
}
function buildEmptyBuckets(n = 6, now = new Date()): Bucket[] {
  const start = addMonths(firstDayOfMonth(now), -(n - 1))
  const out: Bucket[] = []
  for (let i = 0; i < n; i++) {
    const dt = addMonths(start, i)
    out.push({ key: ymKey(dt), label: labelFR(dt), revenue: 0, cost: 0, net: 0, rate: 0 })
  }
  return out
}

export default async function DashboardPage() {
  // 0) Vars env présentes ?
  const hasEnv =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!hasEnv) {
    return (
      <div className="p-6 text-red-600">
        Config manquante : <code>NEXT_PUBLIC_SUPABASE_URL</code> / <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
      </div>
    )
  }

  // 1) Récup data Supabase (sécurisé + messages clairs)
  let rows: Order[] = []
  let errorMsg: string | null = null

  try {
    const jar = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => jar.getAll(), setAll: (l) => l.forEach(c => jar.set(c)) } }
    )

    const now = new Date()
    const from = addMonths(firstDayOfMonth(now), -5).toISOString()

    const { data, error } = await supabase
      .from('orders') // <— assure-toi que la table existe
      .select('created_at, purchase_price, sale_price, amount, status')
      .gte('created_at', from)
      .neq('status', 'CANCELLED')
      .limit(10000)

    if (error) errorMsg = error.message
    else rows = Array.isArray(data) ? (data as Order[]) : []
  } catch (e: any) {
    errorMsg = e?.message ?? 'Erreur inconnue'
  }

  // 2) Agrégation 6 derniers mois
  const now = new Date()
  const buckets = buildEmptyBuckets(6, now)
  const map = new Map(buckets.map(b => [b.key, b]))

  for (const o of rows) {
    const iso = o?.created_at
    if (!iso) continue
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) continue
    const key = ymKey(d)
    const b = map.get(key)
    if (!b) continue
    const revenue = Number(o.sale_price ?? o.amount ?? 0) || 0
    const cost = Number(o.purchase_price ?? 0) || 0
    b.revenue += revenue
    b.cost += cost
  }
  for (const b of buckets) {
    b.net = Math.max(0, b.revenue - b.cost)
    b.rate = b.revenue > 0 ? b.net / b.revenue : 0
  }

  const kpiRevenue = buckets.reduce((s, b) => s + b.revenue, 0)
  const kpiNet = buckets.reduce((s, b) => s + b.net, 0)
  const kpiRate = kpiRevenue > 0 ? kpiNet / kpiRevenue : 0

  // 3) Mini-graphiques SSR (SVG, zéro hydratation)
  function Bars({ data, w = 520, h = 140, pad = 24 }: { data: Bucket[]; w?: number; h?: number; pad?: number }) {
    const innerW = w - pad * 2
    const innerH = h - pad * 2
    const max = Math.max(...data.map(d => d.revenue), 1)
    const bw = (innerW / data.length) * 0.7
    const gap = (innerW / data.length) * 0.3
    return (
      <svg width={w} height={h}>
        <g transform={`translate(${pad},${pad})`}>
          <text x={0} y={innerH + 14} fontSize="10" fill="#6b7280">0</text>
          <text x={0} y={-6} fontSize="10" fill="#6b7280">{fmtMAD(max)}</text>
          {data.map((d, i) => {
            const x = i * (bw + gap)
            const barH = (d.revenue / max) * innerH
            const y = innerH - barH
            return (
              <g key={d.key}>
                <rect x={x} y={y} width={bw} height={barH} rx="6" ry="6" fill="currentColor" opacity="0.15" />
                <text x={x + bw / 2} y={innerH + 12} textAnchor="middle" fontSize="10" fill="#6b7280">
                  {d.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    )
  }

  function Line({ data, w = 520, h = 140, pad = 24 }: { data: Bucket[]; w?: number; h?: number; pad?: number }) {
    const innerW = w - pad * 2
    const innerH = h - pad * 2
    const xStep = data.length > 1 ? innerW / (data.length - 1) : innerW
    const pts = data.map((d, i) => {
      const x = i * xStep
      const y = innerH - d.rate * innerH
      return `${x},${y}`
    }).join(' ')
    return (
      <svg width={w} height={h}>
        <g transform={`translate(${pad},${pad})`}>
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#e5e7eb" />
          <line x1={0} y1={innerH / 2} x2={innerW} y2={innerH / 2} stroke="#e5e7eb" />
          <text x={innerW + 4} y={innerH} fontSize="10" fill="#6b7280">0%</text>
          <text x={innerW + 4} y={innerH / 2} fontSize="10" fill="#6b7280">50%</text>
          <text x={innerW + 4} y={0} fontSize="10" fill="#6b7280">100%</text>

          <polyline fill="none" stroke="currentColor" strokeWidth="2" points={pts} />
          {data.map((d, i) => {
            const x = i * xStep
            const y = innerH - d.rate * innerH
            return <circle key={d.key} cx={x} cy={y} r={3} fill="currentColor" />
          })}
          {data.map((d, i) => {
            const x = i * xStep
            return (
              <text key={`${d.key}-lbl`} x={x} y={innerH + 12} textAnchor="middle" fontSize="10" fill="#6b7280">
                {d.label}
              </text>
            )
          })}
        </g>
      </svg>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Message d’erreur clair au lieu d’un écran blanc */}
      {errorMsg && (
        <div className="rounded border border-red-300 bg-red-50 text-red-700 p-3 text-sm">
          Erreur Supabase : {errorMsg}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-gray-500">Chiffre d’affaires (6 mois)</div>
          <div className="text-2xl font-semibold mt-1">{fmtMAD(kpiRevenue)}</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-gray-500">Marge nette (6 mois)</div>
          <div className="text-2xl font-semibold mt-1">{fmtMAD(kpiNet)}</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-gray-500">Marge / CA</div>
          <div className="text-2xl font-semibold mt-1">{fmtPct(kpiRate)}</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">CA — 6 derniers mois</h2>
            <span className="text-xs text-gray-500">Barres</span>
          </div>
          <div className="text-blue-600">
            <Bars data={buckets} />
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Marge nette / CA — 6 derniers mois</h2>
            <span className="text-xs text-gray-500">Ligne</span>
          </div>
          <div className="text-emerald-600">
            <Line data={buckets} />
          </div>
        </div>
      </div>

      {/* Tableau détail */}
      <div className="rounded-2xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="text-left py-2 px-3">Mois</th>
              <th className="text-left py-2 px-3">CA</th>
              <th className="text-left py-2 px-3">Coût</th>
              <th className="text-left py-2 px-3">Marge nette</th>
              <th className="text-left py-2 px-3">Marge / CA</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map(b => (
              <tr key={b.key} className="border-b">
                <td className="py-2 px-3">{b.label}</td>
                <td className="py-2 px-3">{fmtMAD(b.revenue)}</td>
                <td className="py-2 px-3">{fmtMAD(b.cost)}</td>
                <td className="py-2 px-3">{fmtMAD(b.net)}</td>
                <td className="py-2 px-3">{fmtPct(b.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        CA = <code>sale_price</code> (sinon <code>amount</code>). Marge nette = CA − <code>purchase_price</code>. Statut <code>CANCELLED</code> exclu.
      </p>
    </div>
  )
}
