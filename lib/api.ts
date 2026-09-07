export class ApiTimeoutError extends Error {
  constructor() {
    super("The request took too long and was stopped.");
    this.name = "ApiTimeoutError";
  }
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id: string | null = null;
  try {
    id = window.localStorage.getItem("retailor.deviceId");
  } catch {
    /* storage may be unavailable; fall through */
  }
  if (!id) {
    id =
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    try {
      window.localStorage.setItem("retailor.deviceId", id);
    } catch {
      /* non-persistent session */
    }
  }
  return id;
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

async function request(
  url: string,
  init: RequestInit,
  opts: RequestOptions
): Promise<{ data: unknown; status: number }> {
  const { signal, timeoutMs = 120_000 } = opts;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onExternalAbort, { once: true });
  }
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return { data: await readJson(res), status: res.status };
  } catch (err) {
    if (controller.signal.aborted && !signal?.aborted) {
      throw new ApiTimeoutError();
    }
    throw err;
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener("abort", onExternalAbort);
  }
}

export async function parseResume(
  file: File,
  opts: RequestOptions = {}
): Promise<{ data: unknown; status: number }> {
  const form = new FormData();
  form.append("file", file);
  return request(
    "/api/parse",
    { method: "POST", headers: { "x-device-id": getDeviceId() }, body: form },
    { ...opts, timeoutMs: 60_000 }
  );
}

export async function analyzeJd(
  text: string,
  opts: RequestOptions = {}
): Promise<{ data: unknown; status: number }> {
  return request(
    "/api/analyze-jd",
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-device-id": getDeviceId() },
      body: JSON.stringify({ text }),
    },
    { ...opts, timeoutMs: 60_000 }
  );
}

export async function tailor(
  resume: unknown,
  jd: unknown,
  opts: RequestOptions = {}
): Promise<{ data: unknown; status: number }> {
  return request(
    "/api/tailor",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-device-id": getDeviceId(),
      },
      body: JSON.stringify({ resume, jd }),
    },
    { ...opts, timeoutMs: 150_000 }
  );
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; detail: string };

export function asResult(
  json: unknown,
  status: number,
  fallback: string
): Result<unknown> {
  if (status >= 400 || (json as { ok?: boolean } | null)?.ok === false) {
    const d = (json as { detail?: string } | null)?.detail;
    return { ok: false, status, detail: d || fallback };
  }
  if (json == null) return { ok: false, status, detail: fallback };
  return { ok: true, value: json };
}

export function readUsage(json: unknown): number | null {
  if (json == null || typeof json !== "object") return null;
  const j = json as Record<string, unknown>;
  if (typeof j.remaining === "number") return j.remaining;
  if (typeof j.uses_left === "number") return j.uses_left;
  const usage = j.usage as Record<string, unknown> | undefined;
  if (usage && typeof usage.remaining === "number") {
    return usage.remaining as number;
  }
  return null;
}
