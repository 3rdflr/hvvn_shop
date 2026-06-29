import { postJSON } from "./client";
import type { ProductInput } from "@/lib/validation/product";

async function sendJSON<T>(url: string, method: "PATCH" | "DELETE", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error((json.error as string) ?? `요청 실패 (${res.status})`);
  return json as T;
}

export function createProduct(input: ProductInput) {
  return postJSON<{ id: string }, ProductInput>("/api/admin/products", input);
}
export function updateProduct(id: string, input: ProductInput) {
  return sendJSON<{ ok: true }>(`/api/admin/products/${id}`, "PATCH", input);
}
export function deleteProduct(id: string) {
  return sendJSON<{ ok: true }>(`/api/admin/products/${id}`, "DELETE");
}

export function updateOrderStatus(id: string, status: string) {
  return sendJSON<{ ok: true }>(`/api/admin/orders/${id}/status`, "PATCH", { status });
}

export function updateSettings(input: Record<string, unknown>) {
  return sendJSON<{ ok: true }>("/api/admin/settings", "PATCH", input);
}

export function reorderProducts(ids: string[]) {
  return postJSON<{ ok: true }, { ids: string[] }>("/api/admin/products/reorder", { ids });
}

export function notifyRestock(id: string) {
  return postJSON<{ sent: number; total?: number; message?: string }, Record<string, never>>(
    `/api/admin/products/${id}/notify-restock`,
    {}
  );
}
