import { Capacitor, CapacitorHttp } from "@capacitor/core";

export async function clubApiRequest(path: `/api/${string}`, options: RequestInit = {}) {
  if (!Capacitor.isNativePlatform()) return fetch(path, options);

  const url = new URL(path, "https://turfburnersfc.soccer");
  const method = options.method ?? "GET";
  const result = await CapacitorHttp.request({
    url: url.href,
    method,
    headers: {
      "Cache-Control": "no-cache",
      ...(method !== "GET" && { Origin: url.origin }),
      ...(options.body && { "Content-Type": "application/json" }),
    },
    data:
      typeof options.body === "string" ? JSON.parse(options.body) : undefined,
    responseType: "text",
    disableRedirects: true,
  });
  return new Response(
    result.status === 204 ? null : typeof result.data === "string" ? result.data : JSON.stringify(result.data),
    {
      status: result.status,
      headers: result.headers,
    },
  );
}
