export type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  phone?: string;
  instagram?: string;
  address?: string;
  product_name: string;
  source_url?: string;
  purchase_price: number;
  selling_price: number;
  advance_amount: number;
  status: 'pending' | 'ordered' | 'delivered' | 'cancelled';
  comments?: string;
  delivery_date?: string | null;
};
