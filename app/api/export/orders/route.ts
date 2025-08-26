import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import ExcelJS from 'exceljs';

export async function GET() {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Commandes');
  ws.columns = [
    { header: 'Date', key: 'created_at', width: 16 },
    { header: 'Client', key: 'customer_name', width: 24 },
    { header: 'Téléphone', key: 'phone', width: 16 },
    { header: 'Instagram', key: 'instagram', width: 20 },
    { header: 'Adresse', key: 'address', width: 24 },
    { header: 'Article', key: 'product_name', width: 32 },
    { header: 'Source', key: 'source_url', width: 30 },
    { header: 'Prix achat', key: 'purchase_price', width: 14 },
    { header: 'Prix vente', key: 'selling_price', width: 14 },
    { header: 'Avance', key: 'advance_amount', width: 12 },
    { header: 'Statut', key: 'status', width: 12 },
    { header: 'Commentaires', key: 'comments', width: 32 }
  ];
  (data || []).forEach((o: any) => ws.addRow(o));

  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="orders.xlsx"'
    }
  });
}
