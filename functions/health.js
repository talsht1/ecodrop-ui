import { jsonResponse } from "./_shared/http.js";
import { resolveBackendApiUrl } from "./_shared/app-config.js";

const DEFAULT_LATITUDE = 31.7683;
const DEFAULT_LONGITUDE = 35.2137;

export async function onRequest(context) {
  const { request, env } = context;
  const backendApiUrl = resolveBackendApiUrl(env);

  const incomingUrl = new URL(request.url);
  const latitude = Number(incomingUrl.searchParams.get("latitude") || DEFAULT_LATITUDE);
  const longitude = Number(incomingUrl.searchParams.get("longitude") || DEFAULT_LONGITUDE);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return jsonResponse(
      {
        ok: false,
        error: "Invalid latitude/longitude query values."
      },
      400
    );
  }

  const probeUrl = new URL(backendApiUrl);
  probeUrl.searchParams.set("lat", String(latitude));
  probeUrl.searchParams.set("lng", String(longitude));

  const start = Date.now();

  try {
    const response = await fetch(probeUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    const latencyMs = Date.now() - start;
    if (!response.ok) {
      return jsonResponse(
        {
          ok: false,
          status: response.status,
          latencyMs,
          error: `Backend responded with HTTP ${response.status}.`
        },
        502
      );
    }

    return jsonResponse({
      ok: true,
      status: response.status,
      latencyMs,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown connectivity error"
      },
      502
    );
  }
}
