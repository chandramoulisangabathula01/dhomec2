export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PLACED'
  | 'ACCEPTED'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURN_REJECTED'
  | 'REFUNDED';

export interface Order {
  id: string;
  user_id: string;
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string | null;
  currency: string;
  shipping_address: any;
  items?: OrderItem[];
  order_items?: OrderItem[];
  user?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  customization_details?: any;
  product?: Product;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by: string;
  changed_at: string;
  changer?: Profile;
}
