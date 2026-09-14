import { jsonResponse } from "./_shared/http.js";
import { publicConfig } from "./_shared/app-config.js";

export async function onRequest(context) {
  const { request } = context;
  const cf = request.cf || {};

  return jsonResponse({
    appName: publicConfig.appName,
    version: publicConfig.version,
    timestamp: new Date().toISOString(),
    request: {
      method: request.method,
      path: new URL(request.url).pathname,
      userAgent: request.headers.get("user-agent") || "unknown",
      acceptLanguage: request.headers.get("accept-language") || "unknown"
    },
    network: {
      ip: request.headers.get("cf-connecting-ip") || "unavailable",
      country: cf.country || "unavailable",
      colo: cf.colo || "unavailable",
      city: cf.city || "unavailable",
      region: cf.region || "unavailable"
    }
  });
}
