const BASE = (process.env.RETAILOR_API_BASE ?? "http://localhost:8000").replace(/\/+$/, "");

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, status: 400, detail: "A JSON body with a text field is required." },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(`${BASE}/analyze-jd`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-device-id": request.headers.get("x-device-id") ?? "",
      },
      body: JSON.stringify(body),
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
