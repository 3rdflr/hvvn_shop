export type Product = {
  id: string;
  slug: string;
  name: string;
  price_krw: number;
  short_description: string | null;
  description_html: string | null;
  stock: number;
  is_published: boolean;
  is_set: boolean;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  position: number;
};

export type ProductWithImages = Product & {
  images: ProductImage[];
  set_members?: Product[];
};

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "shipping"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "입금 대기",
  paid: "입금 확인",
  shipping: "배송중",
  delivered: "배송 완료",
  cancelled: "취소",
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_postcode: string;
  shipping_address1: string;
  shipping_address2: string | null;
  shipping_memo: string | null;
  subtotal_krw: number;
  shipping_fee_krw: number;
  total_krw: number;
  is_remote_area: boolean;
  depositor_name: string;
  status: OrderStatus;
  payment_method: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price_krw: number;
  quantity: number;
};

export type InquiryStatus = "open" | "answered" | "closed";

export type Inquiry = {
  id: string;
  order_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  message: string;
  status: InquiryStatus;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
};

export type WaitlistEntry = {
  id: string;
  product_id: string;
  email: string;
  notified_at: string | null;
  created_at: string;
};

export type EmailSubscriber = {
  id: string;
  email: string;
  source: string | null;
  is_active: boolean;
  unsubscribe_token: string;
  created_at: string;
  unsubscribed_at: string | null;
};

export type Settings = {
  id: number;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  shipping_fee_default: number;
  shipping_fee_remote: number;
  about_html: string | null;
  instagram_url: string | null;
  contact_email: string | null;
};

export type CartLine = {
  product_id: string;
  slug: string;
  name: string;
  price_krw: number;
  thumbnail_url: string | null;
  quantity: number;
  stock: number;
};
