export type Profile = {
  id: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'worker';
  avatar_url: string | null;
  created_at: string;
};

export type Area = {
  id: string;
  name: string;
  type: 'warehouse' | 'site' | 'workshop';
  location: string | null;
  manager_id: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
};

export type Item = {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  category_id: string | null;
  unit_of_measure: 'kg' | 'm' | 'pcs' | 'tons' | 'l' | 'm2';
  reorder_level: number;
  created_at: string;
  // joined fields
  category?: Category;
};

export type Stock = {
  id: string;
  item_id: string;
  area_id: string;
  quantity: number;
  last_updated: string;
};

export type Movement = {
  id: string;
  item_id: string;
  from_area_id: string | null;
  to_area_id: string | null;
  quantity: number;
  movement_type: 'receipt' | 'issue' | 'transfer' | 'adjustment';
  reference: string | null;
  performed_by: string | null;
  note: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  order_type: 'purchase' | 'work';
  order_number: string;
  area_id: string | null;
  supplier_customer: string | null;
  status: 'draft' | 'pending' | 'approved' | 'completed' | 'cancelled';
  created_by: string | null;
  expected_delivery_date: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  unit_price: number | null;
  received_quantity: number;
};
