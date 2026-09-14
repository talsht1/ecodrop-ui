export const publicConfig = {
  appName: "EcoDrop Locator",
  version: "1.3.1",
  companyName: "EcoDrop"
};

export function resolveBackendBaseUrl(env) {
  return env.BACKEND_BASE_URL || "http://localhost:3000";
}

export function resolveNearestBinPath(env) {
  return env.BACKEND_NEAREST_BIN_PATH || "/api/bins/nearest";
}

export function resolveBackendApiUrl(env) {
  const baseUrl = resolveBackendBaseUrl(env).replace(/\/+$/, "");
  const path = resolveNearestBinPath(env).startsWith("/")
    ? resolveNearestBinPath(env)
    : `/${resolveNearestBinPath(env)}`;
  return `${baseUrl}${path}`;
}
