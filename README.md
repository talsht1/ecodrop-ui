# EcoDrop UI — Recycling Bin Locator

Mobile-first, single-page map UI (vanilla HTML/CSS/JS + [Leaflet](https://leafletjs.com/)) that finds recycling bins near you. Deployed on **Cloudflare Pages** with **Cloudflare Pages Functions** for runtime endpoints and a GitHub Actions CI/CD pipeline.

**Live:** https://ecodrop-ui.pages.dev

## Features

- **Full-screen responsive map** — framed container on desktop, edge-to-edge on mobile.
- **Geolocation with fallback** — uses `navigator.geolocation`; if denied/unavailable it falls back to **Manhattan** coordinates.
- **Auto-centers on you** — as soon as your location is resolved the map recenters on you (no wide zoom-out), even if the bin API is unavailable.
- **Live bin data** — renders markers from `GET /api/bins`; each type shows its own icon inside a **colored frame** matching the bin's color (green general waste, orange packaging, purple glass, blue paper, textile, electronics, cardboard, bulky waste, bottle-recycling machine, yard waste, generic) with a legend.
- **Nearest bin** — `GET /api/bins/nearest?lat=&lng=` drives the walking distance / ETA and the dashed route line.
- **Selectable bins** — click (or keyboard-select) **any** bin to see its distance/ETA in the status card, redraw the route, update directions, and highlight the marker. Popups also show distance from your location.
- **Register a bin** — an **Add Bin** button opens a dialog to create a bin (name, optional address, optional type) with its location picked by tapping the map; submits via `POST /api/bins` and drops the new marker.
- **Report a hazard** — a floating **Report Hazard** button opens a dialog with a description field and a location picker (tap the map or **use my location**). Submitting fires a `POST /api/reports` with `{ description, latitude, longitude }` and immediately closes the dialog with a success toast (fire-and-forget, no waiting on the network).
- **Current location field** — shows your coordinates, upgraded to a human-readable address via OSM Nominatim reverse geocoding.
- **Collapsible status card** — a clear minimize/expand toggle so the panel doesn't cover the map on mobile.
- **Manual location** — **Set Location on Map** lets you tap any point to use it instead of GPS.
- **Configurable map style** — choose the tile layer (see [Map style](#map-style)).
- **Bilingual UI (English / Hebrew)** — a language toggle in the header switches the entire interface, with full **RTL** layout for Hebrew. The choice is remembered and defaults to the browser language (see [Languages](#languages)).
- **Runtime endpoints** — `GET /whoami`, `GET /config`, `GET /health` (Pages Functions).

## Repository Structure

```text
.
|-- apps/
|   `-- ui/                     # Static site (Pages build output dir)
|       |-- index.html
|       |-- style.css
|       `-- script.js
|-- functions/                  # Cloudflare Pages Functions (MUST be at repo root)
|   |-- whoami.js               # GET /whoami
|   |-- config.js               # GET /config
|   |-- health.js               # GET /health
|   `-- _shared/
|       |-- app-config.js       # env resolution (backend URL, map style, ...)
|       `-- http.js             # jsonResponse helper
|-- infra/
|   `-- nginx/default.conf      # Nginx config for the Docker (static-only) image
|-- Dockerfile
|-- docker-compose.yml
|-- wrangler.toml               # Pages config + [vars] (deterministic runtime config)
`-- .github/workflows/cloudflare-pages.yml
```

> **Important:** Pages Functions live in `functions/` at the **repository root**, not inside the static output directory (`apps/ui`). If they are nested inside the output dir, Cloudflare uploads them as static files and they never execute (e.g. `/config` would return `index.html`).

## Runtime Configuration

Configuration is resolved in this order (later overrides earlier):

1. **Inline defaults** in `apps/ui/index.html` (`window.ECODROP_CONFIG`) — used before `/config` loads and as an offline fallback.
2. **`/config` endpoint** — the UI fetches this on load; values come from `wrangler.toml [vars]` / Cloudflare Pages environment variables.

### UI inline defaults (`apps/ui/index.html`)

```html
<script>
  window.ECODROP_CONFIG = {
    appName: "EcoDrop Locator",
    version: "1.3.1",
    companyName: "EcoDrop",
    backendBaseUrl: "http://localhost:3000",
    mapStyle: "osm"
  };
</script>
```

### Deterministic runtime config (`wrangler.toml`)

Because dashboard-set variables do **not** reliably bind to CI deployments made with `wrangler pages deploy`, the source of truth for runtime config is `[vars]` in `wrangler.toml` (version-controlled, always applied by CI):

```toml
[vars]
BACKEND_BASE_URL = "https://ecodrop-api-l2wd.onrender.com"
BACKEND_NEAREST_BIN_PATH = "/api/bins/nearest"
# Map tile style: osm | positron | dark | voyager | topo
MAP_STYLE = "osm"
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `BACKEND_BASE_URL` | `http://localhost:3000` | Base URL of the backend API |
| `BACKEND_NEAREST_BIN_PATH` | `/api/bins/nearest` | Path for the nearest-bin lookup |
| `MAP_STYLE` | `osm` | Tile layer / map projection preset |

The nearest-bin endpoint is constructed as `<BACKEND_BASE_URL><BACKEND_NEAREST_BIN_PATH>`.

### How to update values

- **Change the backend or map style for production:** edit `[vars]` in `wrangler.toml`, commit, and push to `main`. CI redeploys automatically and `/config` reflects the new values.
- **Local-only override:** pass bindings to `wrangler pages dev` (see [Run locally](#run-locally-with-endpoints)).
- **Verify:** `curl https://ecodrop-ui.pages.dev/config` should return JSON with your values.

### Map style

Set `MAP_STYLE` (or `mapStyle` in the inline config) to one of:

| Key | Tile layer |
| --- | --- |
| `osm` *(default)* | OpenStreetMap Standard |
| `positron` | CartoDB Positron (light) |
| `dark` | CartoDB Dark Matter |
| `voyager` | CartoDB Voyager |
| `topo` | OpenTopoMap |

Unknown values fall back to `osm`.

## Languages

The UI ships with English (`en`) and Hebrew (`he`). A 🌐 toggle in the header switches languages instantly and Hebrew renders the whole app **right-to-left** (`<html dir="rtl">`).

- **Selection order:** a previously chosen language (persisted in `localStorage` under `ecodrop_lang`) wins; otherwise the browser language is used (`he*` → Hebrew, everything else → English).
- **All strings are translated** — header, status card, legend, buttons, map marker tooltips/popups, the Add Bin dialog, and every error/toast message. Distances and ETAs are localized too (e.g. `120 m` → `120 מ׳`, `2 min walk` → `2 דק׳ הליכה`).

### Add a language

Everything lives in `apps/ui/script.js`:

1. Add the language code to `SUPPORTED_LANGS` (e.g. `"fr"`).
2. Add a matching block to the `TRANSLATIONS` object with the **same keys** as `en`.
3. Static markup is auto-translated via `data-i18n` / `data-i18n-title` / `data-i18n-placeholder` / `data-i18n-aria-label` attributes in `apps/ui/index.html`; add those attributes to any new text nodes.

RTL for a new language: extend the `dir` check in `applyLanguage()` (currently `lang === "he" ? "rtl" : "ltr"`).

## Run Locally (with endpoints)

Use Wrangler Pages dev so the Functions endpoints are available:

```bash
npx wrangler pages dev apps/ui --compatibility-date=2026-09-14
```

Then open the printed local URL (usually `http://localhost:8788`).

Optional local bindings:

```bash
npx wrangler pages dev apps/ui --compatibility-date=2026-09-14 \
  -b BACKEND_BASE_URL=https://your-backend.example.com \
  -b BACKEND_NEAREST_BIN_PATH=/api/bins/nearest \
  -b MAP_STYLE=positron
```

### Static-only (no endpoints)

```bash
npx http-server apps/ui -p 8080 -a 127.0.0.1
```

`/config`, `/whoami`, `/health` are not available in this mode; the UI uses its inline defaults.

## Endpoints

### `GET /whoami`
Returns request/client metadata (`userAgent`, `ip` when available, geo hints, timestamp).

### `GET /config`
Returns public app metadata plus `backendBaseUrl`, `nearestBinPath`, `backendApiUrl`, and `mapStyle`.

### `GET /health`
Performs a backend connectivity check against the resolved backend endpoint (optionally with `?latitude=&longitude=` probe values) and returns `ok`, `status`, `latencyMs`, `checkedAt`.

## Docker Compose (UI only)

```bash
docker compose up --build -d
```

Open `http://localhost:8080`.

> The Docker setup serves the **static UI only** (Nginx). Runtime endpoints are provided by Cloudflare Pages Functions / Wrangler Pages dev, not by the Docker image.

## Cloudflare Pages CI/CD

`.github/workflows/cloudflare-pages.yml` deploys on push to `main` and can be run manually.

### Triggers

- **Push to `main`** touching `apps/ui/**`, `functions/**`, `wrangler.toml`, or the workflow file. Empty commits do **not** trigger it (nothing on a watched path changes).
- **Manual:** `workflow_dispatch` — GitHub → **Actions** → **Deploy UI to Cloudflare Pages** → **Run workflow**.

### Deploy step

```bash
wrangler pages project create ecodrop-ui --production-branch main || true
wrangler pages deploy apps/ui --project-name ecodrop-ui --branch main
```

Functions are picked up automatically from the repo-root `functions/` directory.

### Required GitHub Secrets

1. `CLOUDFLARE_API_TOKEN` — token with **Cloudflare Pages: Edit** (plus account read).
2. `CLOUDFLARE_ACCOUNT_ID`

### Cloudflare Pages project settings (for Git-integration builds)

1. Framework preset: `None`
2. Build command: *(empty)* — vanilla assets, zero compilation
3. Build output directory: `apps/ui`

Runtime variables are defined in `wrangler.toml [vars]` and deployed by CI (see [Deterministic runtime config](#deterministic-runtime-config-wranglertoml)).
