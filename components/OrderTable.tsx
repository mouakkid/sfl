'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Order } from '@/lib/types';
import { currency, profit, marginRate } from '@/lib/utils';
import dayjs from 'dayjs';

export default function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data) setOrders(data as any);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
    const channel = supabase.channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const totals = useMemo(() => {
    const count = orders.length;
    const ca = orders.reduce((s, o) => s + (o.selling_price || 0), 0);
    const cost = orders.reduce((s, o) => s + (o.purchase_price || 0), 0);
    const marge = ca - cost;
    return { count, ca, cost, marge };
  }, [orders]);

  async function exportExcel() {
    const res = await fetch('/api/export/orders');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card overflow-x-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-500">Commandes: <b>{totals.count}</b> • CA: <b>{currency(totals.ca)}</b> • Marge nette: <b>{currency(totals.marge)}</b></div>
        <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-2 rounded-xl">Exporter Excel</button>
      </div>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Client</th>
            <th className="p-2 text-left">Article</th>
            <th className="p-2 text-left">Prix achat</th>
            <th className="p-2 text-left">Prix vente</th>
            <th className="p-2 text-left">Avance</th>
            <th className="p-2 text-left">Marge</th>
            <th className="p-2 text-left">Statut</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td className="p-3" colSpan={8}>Chargement...</td></tr>
          ) : orders.map(o => (
            <tr key={o.id} className="border-b last:border-none hover:bg-gray-50">
              <td className="p-2">{dayjs(o.created_at).format('DD/MM/YYYY')}</td>
              <td className="p-2">{o.customer_name}<div className="text-xs text-gray-500">{o.phone}</div></td>
              <td className="p-2">
                {o.product_name}
                {o.source_url ? <a className="text-blue-600 underline block text-xs" target="_blank" href={o.source_url}>source</a> : null}
              </td>
              <td className="p-2">{currency(o.purchase_price)}</td>
              <td className="p-2">{currency(o.selling_price)}</td>
              <td className="p-2">{currency(o.advance_amount)}</td>
              <td className="p-2">{currency(profit(o.purchase_price, o.selling_price))} ({marginRate(o.purchase_price, o.selling_price)}%)</td>
              <td className="p-2">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
