import { createOrderAction } from '../actions'

export default function NewOrderPage({
  searchParams,
}: { searchParams?: { back?: string } }) {
  const backTo = searchParams?.back || '/orders'

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nouvelle commande</h1>
        <a href={backTo} className="border rounded px-3 py-1">Retour</a>
      </div>

      <form action={createOrderAction} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nom client *</label>
          <input name="customer_name" required className="w-full border rounded p-2" placeholder="Ex: Sanae" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Téléphone</label>
            <input name="phone" className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Instagram</label>
            <input name="instagram" className="w-full border rounded p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Adresse</label>
          <input name="address" className="w-full border rounded p-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Prix achat</label>
            <input name="purchase_price" type="number" step="0.01" className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Prix vente</label>
            <input name="sale_price" type="number" step="0.01" className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Montant</label>
            <input name="amount" type="number" step="0.01" className="w-full border rounded p-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Acompte</label>
            <input name="advance_amount" type="number" step="0.01" className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Statut</label>
            <select name="status" className="w-full border rounded p-2">
              <option value="NEW">NEW</option>
              <option value="PAID">PAID</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="SHIPPED">SHIPPED</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="border rounded px-4 py-2">Enregistrer</button>
          <a href={backTo} className="border rounded px-4 py-2">Annuler</a>
        </div>
      </form>
    </div>
  )
}
