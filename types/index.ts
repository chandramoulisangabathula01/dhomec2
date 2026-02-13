export type UserRole = 'SUPER_ADMIN' | 'SUPPORT_STAFF' | 'LOGISTICS_STAFF' | 'CUSTOMER';

export interface Address {
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  gstin?: string;
  address?: string; // Used in checkout as single text area
  
  // Legacy/Structured fields if needed
  type?: string; 
  line1?: string;
  line2?: string;
  city: string;
  state?: string;
  pincode: string;
  country?: string;
}

export type ProductType = 'DIRECT_SALE' | 'CONSULTATION_ONLY';

export interface ProductDimensions {
  length: number;
  breadth: number;
  height: number;
}

export interface ProductSEO {
  title: string;
  desc: string;
}

export interface Product {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image_url?: string;
  images: string[];
  category_id?: string;
  is_featured: boolean;
  stock_quantity: number;
  min_stock_threshold: number;
  sku?: string;
  status: string;
  
  // New PRD Fields
  type: ProductType;
  hsn_code?: string;
  dimensions?: ProductDimensions;
  weight_kg?: number;
  zakeke_template_id?: string;
  seo?: ProductSEO;
  
  // Inventory & Lead Time Fields
  allow_backorder?: boolean;
  base_lead_time_days?: number;
  manufacturing_buffer_days?: number;
  min_quantity?: number;
  tax?: number;
  discount?: number;
  units?: string;
  sub_category?: string;
  three_d_model_url?: string;

  // Existing fields to keep
  brand?: string;
  model_name?: string;
  pdf_url?: string;
  material?: string;
  color?: string;
  usage_application?: string;
  automation_grade?: string;
  frequency?: string;
  voltage?: string;
  specifications?: any;
}

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

export interface TaxBreakdown {
  cgst: number;
  sgst: number;
}

export interface ShippingInfo {
  provider: string; // e.g., 'DELHIVERY', 'SHIPROCKET', 'MANUAL'
  awb_code?: string;
  label_url?: string;
  tracking_url?: string;
  shipped_date?: string;
}

export interface Order {
  id: string;
  user_id: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string | null;
  currency: string;
  
  // Expanded Address Handling
  shipping_address: Address;
  billing_address?: Address;
  
  // New PRD Fields
  tax_breakdown?: TaxBreakdown;
  shipping_info?: ShippingInfo;
  
  // Relational Data
  items?: OrderItem[];
  order_items?: OrderItem[]; // Handling both naming conventions for now
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

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  username?: string;
  avatar_url?: string;
  website?: string;
  role: UserRole;
  addresses?: Address[];
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by: string;
  changed_at: string;
  changer?: Profile;
}

// New Ticket Interfaces
export type TicketType = 'MEASUREMENT_REQ' | 'RETURN_REQ' | 'GENERAL_QUERY';
export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface TicketMetadata {
  preferred_date?: string;
  site_photos?: string[];
  approx_dimensions?: string;
  [key: string]: any;
}

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_staff_id?: string;
  metadata?: TicketMetadata;
  created_at: string;
  updated_at: string;
  
  // Relational
  user?: Profile;
  assigned_staff?: Profile;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_staff_reply: boolean;
  created_at: string;
  user?: Profile;
}
