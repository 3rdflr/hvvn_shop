import { postJSON, getJSON } from "./client";
import type { CheckoutInput } from "@/lib/validation/order";
import type { Order, OrderItem } from "@/types";

export type CreateOrderResponse = { order_number: string; id: string };
export function createOrder(input: CheckoutInput) {
  return postJSON<CreateOrderResponse, CheckoutInput>("/api/orders", input);
}

export type ShippingFees = { default: number; remote: number };
export function getShippingFees() {
  return getJSON<ShippingFees>("/api/settings/shipping");
}

export type PublicSettings = {
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  shipping_fee_default: number;
  shipping_fee_remote: number;
  instagram_url: string | null;
  contact_email: string | null;
  bg_youtube_url: string | null;
};
export function getPublicSettings() {
  return getJSON<PublicSettings>("/api/settings");
}

export function joinWaitlist(input: { product_id: string; email: string }) {
  return postJSON<{ ok: true }>("/api/waitlist", input);
}

export type OrderLookupResult = Order & { items: OrderItem[] };
export function lookupOrders(input: { name: string; phone: string }) {
  return postJSON<{ orders: OrderLookupResult[] }>("/api/orders/lookup", input);
}

export type InquiryInput = {
  order_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email: string;
  message: string;
};
export function createInquiry(input: InquiryInput) {
  return postJSON<{ ok: true }>("/api/inquiries", input);
}

export function subscribeEmail(input: { email: string; source?: string }) {
  return postJSON<{ ok: true }>("/api/subscribe", input);
}
