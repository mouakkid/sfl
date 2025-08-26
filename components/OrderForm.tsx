'use client';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export default function OrderForm({ onSaved }: { onSaved?: () => void }) {
  const [loading, setLoading] = useState(false);
  async function formAction(formData: FormData) {
    setLoading(true);
    const payload: any = {
      customer_name: formData.get('customer_name'),
      phone: formData.get('phone'),
      instagram: formData.get('instagram'),
      address: formData.get('address'),
      product_name: formData.get('product_name'),
      source_url: formData.get('source_url'),
      purchase_price: Number(formData.get('purchase_price')) || 0,
      selling_price: Number(formData.get('selling_price')) || 0,
      advance_amount: Number(formData.get('advance_amount')) || 0,
      status: formData.get('status') || 'pending',
      comments: formData.get('comments')
    };
    const { error } = await supabase.from('orders').insert(payload);
    setLoading(false);
    if (!error) onSaved?.();
    else alert(error.message);
  }
  return (
    <form action={formAction} className="card grid grid-cols-1 md:grid-cols-2 gap-4">
      <input name="customer_name" placeholder="Nom complet" className="input" required />
      <input name="phone" placeholder="Téléphone" className="input" />
      <input name="instagram" placeholder="Lien Instagram" className="input" />
      <input name="address" placeholder="Adresse" className="input md:col-span-2" />
      <input name="product_name" placeholder="Article / Référence" className="input md:col-span-2" required />
      <input name="source_url" placeholder="Source/Lien d'achat" className="input md:col-span-2" />
      <input name="purchase_price" type="number" step="0.01" placeholder="Prix d'achat (MAD)" className="input" />
      <input name="selling_price" type="number" step="0.01" placeholder="Prix de vente (MAD)" className="input" />
      <input name="advance_amount" type="number" step="0.01" placeholder="Avance (MAD)" className="input" />
      <select name="status" className="input">
        <option value="pending">En attente</option>
        <option value="ordered">Commandé</option>
        <option value="delivered">Livré</option>
        <option value="cancelled">Annulé</option>
      </select>
      <textarea name="comments" placeholder="Commentaire" className="input md:col-span-2" />
      <button disabled={loading} className="bg-brand text-white rounded-xl px-4 py-2">{loading ? 'Enregistrement...' : 'Ajouter la commande'}</button>
      <style jsx>{`
        .input{ @apply bg-white rounded-xl border px-3 py-2; }
      `}</style>
    </form>
  );
}
