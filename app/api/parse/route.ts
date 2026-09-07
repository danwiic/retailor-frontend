const BASE = process.env.RETAILOR_API_BASE ?? "http://localhost:8000";

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      { ok: false, status: 400, detail: "Expected a multipart file upload." },
      { status: 400 }
    );
  }

  try {
  const upstream = await fetch(`${BASE}/parse`, {
      method: "POST",
      body: form,
      headers: { "x-device-id": request.headers.get("x-device-id") ?? "" },
      signal: AbortSignal.timeout(45_000),
    });
    const raw = await upstream.text();
    let json: unknown = null;
    try {
      json = raw ? JSON.parse(raw) : null;
    } catch {
      /* non-JSON upstream body */
    }
    return Response.json(
      json ?? { ok: false, status: upstream.status, detail: raw.slice(0, 300) },
      { status: upstream.status }
    );
  } catch {
    return Response.json(
      {
        ok: false,
        status: 502,
        detail:
          "Couldn't reach the Retailor service. Make sure it's running on port 8000, then try again.",
      },
      { status: 502 }
    );
  }
}
