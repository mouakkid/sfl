import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { updateOrderAction } from '../../actions'

export default async function EditOrderPage({
  params,
  searchParams,
}: { params: { id: string }, searchParams?: { error?: string, back?: string } }) {
  const backTo = searchParams?.back || '/orders'
  const err = searchParams?.error

  const jar = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => jar.getAll(), setAll: (l) => l.forEach(c => jar.set(c)) } }
  )

  const { data, error } = await supabase.from('orders').select('*').eq('id', params.id).single()
  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-red-600">Commande introuvable.</p>
        <Link href={backTo} className="inline-block mt-3 border rounded px-3 py-1">Retour</Link>
      </div>
    )
  }

  const o = data as any

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <EditIcon /> Modifier la commande
        </h1>
        <Link href={backTo} className="border rounded px-3 py-1">Retour</Link>
      </div>

      {err && (
        <div className="rounded border border-red-300 bg-red-50 text-red-700 p-3 text-sm">
          {decodeURIComponent(err)}
        </div>
      )}

      <form action={updateOrderAction} className="space-y-4">
        <input type="hidden" name="id" value={o.id} />

        <div>
          <label className="block text-sm mb-1">Nom client *</label>
          <input name="customer_name" defaultValue={o.customer_name ?? ''} required className="w-full border rounded p-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Téléphone</label>
            <input name="phone" defaultValue={o.phone ?? ''} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Instagram</label>
            <input name="instagram" defaultValue={o.instagram ?? ''} className="w-full border rounded p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Adresse</label>
          <input name="address" defaultValue={o.address ?? ''} className="w-full border rounded p-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FieldNumber name="purchase_price" label="Prix achat" defaultValue={o.purchase_price} />
          <FieldNumber name="sale_price" label="Prix vente" defaultValue={o.sale_price} />
          <FieldNumber name="amount" label="Montant" defaultValue={o.amount} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldNumber name="advance_amount" label="Acompte" defaultValue={o.advance_amount} />
          <div>
            <label className="block text-sm mb-1">Statut</label>
            <select name="status" defaultValue={o.status ?? 'NEW'} className="w-full border rounded p-2">
              <option value="NEW">NEW</option>
              <option value="PAID">PAID</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="SHIPPED">SHIPPED</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="border rounded px-4 py-2 flex items-center gap-2">
            <SaveIcon /> Enregistrer
          </button>
          <Link href={backTo} className="border rounded px-4 py-2">Annuler</Link>
        </div>
      </form>
    </div>
  )
}

function FieldNumber({ name, label, defaultValue }: { name: string; label: string; defaultValue?: number | null }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input name={name} type="number" step="0.01" defaultValue={defaultValue ?? ''} className="w-full border rounded p-2" />
    </div>
  )
}

/* Icônes inline */
function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="inline-block">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}
function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M19 21H5a2 2 0 0 1-2-2V7l4-4h9l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21V13H7v8" /><path d="M7 3v4h8" />
    </svg>
  )
}
