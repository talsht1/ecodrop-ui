import { jsonResponse } from "./_shared/http.js";
import {
  publicConfig,
  resolveBackendApiUrl,
  resolveBackendBaseUrl,
  resolveNearestBinPath
} from "./_shared/app-config.js";

export async function onRequest(context) {
  return jsonResponse({
    ...publicConfig,
    backendBaseUrl: resolveBackendBaseUrl(context.env),
    nearestBinPath: resolveNearestBinPath(context.env),
    backendApiUrl: resolveBackendApiUrl(context.env)
  });
}
