/**
 * Thin typed fetch wrapper for internal API routes.
 * All storefront network calls go through here (or a hook that wraps it) —
 * UI components must never call fetch/axios directly (architecture guardrail).
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public issues?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function postJSON<TResponse, TBody = unknown>(
  url: string,
  body: TBody
): Promise<TResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const message =
      typeof json.error === "string" ? json.error : "요청 처리 중 오류가 발생했습니다.";
    throw new ApiError(message, res.status, json.issues);
  }

  return json as TResponse;
}

export async function getJSON<TResponse>(url: string): Promise<TResponse> {
  const res = await fetch(url);
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message =
      typeof json.error === "string" ? json.error : "요청 처리 중 오류가 발생했습니다.";
    throw new ApiError(message, res.status);
  }
  return json as TResponse;
}
