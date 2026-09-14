# EcoDrop UI - Recycling Bin Locator

Mobile-responsive single-page map UI (Leaflet) with **runtime endpoints**:
1. `GET /whoami`
2. `GET /config`
3. `GET /health`

If browser geolocation is unavailable or denied, the UI automatically falls back to **Manhattan** coordinates.

The UI map renders data from:
1. `GET /api/bins` for all markers
2. `GET /api/bins/nearest?lat=...&lng=...` for nearest bin distance

Users can also choose **Set Location on Map** and tap any map point to use that location instead of GPS.

## Repository Structure

```text
.
|-- apps/
|   `-- ui/
|       |-- index.html
|       |-- style.css
|       |-- script.js
|       `-- functions/
|           |-- whoami.js
|           |-- config.js
|           |-- health.js
|           `-- _shared/
|               |-- app-config.js
|               `-- http.js
|-- infra/
|   `-- nginx/
|       `-- default.conf
|-- Dockerfile
|-- docker-compose.yml
|-- wrangler.toml
`-- .github/workflows/cloudflare-pages.yml
```

## Runtime Configuration

### UI runtime (`apps/ui/index.html`)

```html
window.ECODROP_CONFIG = {
  appName: "EcoDrop Locator",
  version: "1.3.1",
  companyName: "EcoDrop",
  backendBaseUrl: "http://localhost:3000"
};
```

### Endpoint runtime (`/config`, `/health`)

Set optional Cloudflare Pages variables:

- `BACKEND_BASE_URL` (default: `http://localhost:3000`)
- `BACKEND_NEAREST_BIN_PATH` (default: `/api/bins/nearest`)

The runtime constructs the nearest-bin endpoint as:  
`<BACKEND_BASE_URL><BACKEND_NEAREST_BIN_PATH>`.

## Run Locally (with endpoints)

Use Wrangler Pages dev so Functions endpoints are available:

```bash
npx wrangler pages dev apps/ui --compatibility-date=2026-09-14
```

Then open the printed local URL (usually `http://localhost:8788`).

Optional local binding:

```bash
npx wrangler pages dev apps/ui --compatibility-date=2026-09-14 -b BACKEND_BASE_URL=https://your-backend.example.com -b BACKEND_NEAREST_BIN_PATH=/api/bins/nearest
```

## Endpoints

### `GET /whoami`
Returns request/client metadata (`userAgent`, `ip` when available, geo hints, timestamp).

### `GET /config`
Returns public app metadata plus `backendBaseUrl`, `nearestBinPath`, and `backendApiUrl`.

### `GET /health`
Performs backend connectivity check against resolved backend endpoint (or provided `?lat=&lng=` probe values) and returns:
- `ok`
- `status`
- `latencyMs`
- `checkedAt`

## Docker Compose (UI only)

```bash
docker compose up --build -d
```

Open `http://localhost:8080`.

Note: Docker setup serves static UI only (Nginx). Runtime endpoints are provided by Cloudflare Pages Functions / Wrangler Pages dev.

## Cloudflare Pages CI/CD

### GitHub Actions workflow included

`.github/workflows/cloudflare-pages.yml` deploys on push to `main`:

```bash
wrangler pages deploy apps/ui --project-name ecodrop-ui --functions apps/ui/functions
```

### Required GitHub Secrets

1. `CLOUDFLARE_API_TOKEN`
2. `CLOUDFLARE_ACCOUNT_ID`

### Required Cloudflare Pages Variables

1. `BACKEND_BASE_URL` (optional)
2. `BACKEND_NEAREST_BIN_PATH` (optional)

### Cloudflare Pages project settings

1. Framework preset: `None`
2. Build command: *(empty)*
3. Root directory: `/apps/ui`
4. Build output directory: `/`
