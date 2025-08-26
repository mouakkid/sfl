'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import OrderForm from '@/components/OrderForm';
import OrderTable from '@/components/OrderTable';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const router = useRouter();
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      if (!data.session) router.push('/login');
    });
  },[router]);
  return (
    <div className="space-y-4">
      <OrderForm onSaved={() => { /* nothing, table live-updates via realtime */ }} />
      <OrderTable />
    </div>
  );
}
