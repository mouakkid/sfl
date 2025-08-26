'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import KPI from '@/components/KPI';
import { currency } from '@/lib/utils';
import dynamic from 'next/dynamic';
const { Line } = require('react-chartjs-2');
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState({ count: 0, ca: 0, cost: 0, marge: 0 });
  const [series, setSeries] = useState<{labels: string[], values: number[]}>({labels: [], values: []});

  async function compute() {
    const { data } = await supabase.from('orders').select('*');
    const count = data?.length || 0;
    const ca = data?.reduce((s,o)=>s+(o.selling_price||0),0) || 0;
    const cost = data?.reduce((s,o)=>s+(o.purchase_price||0),0) || 0;
    const marge = ca - cost;
    setStats({ count, ca, cost, marge });

    // monthly series
    const map = new Map<string, number>();
    (data||[]).forEach(o=>{
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      map.set(key, (map.get(key)||0) + (o.selling_price||0));
    });
    const labels = Array.from(map.keys()).sort();
    const values = labels.map(l=>map.get(l)||0);
    setSeries({ labels, values });
  }

  useEffect(()=>{ compute(); }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPI title="Commandes" value={String(stats.count)} />
        <KPI title="Chiffre d'affaires" value={currency(stats.ca)} />
        <KPI title="Coût achats" value={currency(stats.cost)} />
        <KPI title="Marge nette" value={currency(stats.marge)} />
      </div>
      <div className="card">
        <div className="font-semibold mb-2">CA par mois</div>
        <Line data={{ labels: series.labels, datasets: [{ label: 'CA', data: series.values }] }} options={{ responsive: true, maintainAspectRatio: false }} height={280} />
      </div>
    </div>
  );
}
