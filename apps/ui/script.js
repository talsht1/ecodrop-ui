const MANHATTAN_CENTER = [40.7831, -73.9712];
const MAP_DEFAULT_ZOOM = 13;
const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 12000,
  maximumAge: 0
};
const WALKING_METERS_PER_MINUTE = 78;

const TYPE_ICON_MAP = {
  glass: { label: "Glass", icon: "🍾", cssClass: "type-glass" },
  paper: { label: "Paper", icon: "📰", cssClass: "type-paper" },
  plastic: { label: "Plastic", icon: "🧴", cssClass: "type-plastic" },
  metal: { label: "Metal", icon: "🥫", cssClass: "type-metal" },
  electronics: { label: "Electronics", icon: "💻", cssClass: "type-electronics" },
  mixed: { label: "Mixed", icon: "♻️", cssClass: "type-mixed" },
  generic: { label: "Unknown", icon: "🗑️", cssClass: "type-generic" }
};

const appConfig = {
  appName: window.ECODROP_CONFIG?.appName ?? "EcoDrop Locator",
  version: window.ECODROP_CONFIG?.version ?? "1.0.0",
  companyName: window.ECODROP_CONFIG?.companyName ?? "EcoDrop",
  backendBaseUrl: window.ECODROP_CONFIG?.backendBaseUrl ?? "http://localhost:3000"
};

const elements = {
  appName: document.getElementById("app-name"),
  appVersion: document.getElementById("app-version"),
  footerCopyright: document.getElementById("footer-copyright"),
  statusCard: document.getElementById("status-card"),
  cardBody: document.getElementById("card-body"),
  minimizeButton: document.getElementById("btn-minimize"),
  userLocationText: document.getElementById("user-location-text"),
  stateLabel: document.getElementById("state-label"),
  binName: document.getElementById("bin-name"),
  distanceText: document.getElementById("distance-text"),
  etaText: document.getElementById("eta-text"),
  directionsButton: document.getElementById("btn-directions"),
  manualLocationButton: document.getElementById("btn-manual-location"),
  retryButton: document.getElementById("btn-retry"),
  bannerRetryButton: document.getElementById("btn-banner-retry"),
  errorBanner: document.getElementById("error-banner"),
  errorText: document.getElementById("error-text")
};

const map = L.map("map", { zoomControl: false }).setView(MANHATTAN_CENTER, MAP_DEFAULT_ZOOM);
L.control.zoom({ position: "bottomright" }).addTo(map);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 20,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const userIcon = L.divIcon({
  className: "",
  html: '<div class="user-marker" aria-hidden="true"><span class="user-marker__pulse"></span><span class="user-marker__dot"></span></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const binsLayer = L.layerGroup().addTo(map);
const binMarkersById = new Map();
let userMarker;
let routeLine;
let currentUserCoordinates = null;
let currentNearestCoordinates = null;
let selectedBinId = null;
let manualLocationMode = false;

function setCardState(state) {
  elements.statusCard.classList.remove("is-loading", "is-success", "is-error");
  elements.statusCard.classList.add(`is-${state}`);
}

function showErrorBanner(message) {
  elements.errorText.textContent = message;
  elements.errorBanner.classList.remove("hidden");
}

function hideErrorBanner() {
  elements.errorBanner.classList.add("hidden");
}

function resetDirectionsButton() {
  elements.directionsButton.classList.add("disabled");
  elements.directionsButton.setAttribute("href", "#");
}

function setDirectionsLink(origin, destination) {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", `${origin[0]},${origin[1]}`);
  url.searchParams.set("destination", `${destination[0]},${destination[1]}`);
  url.searchParams.set("travelmode", "walking");
  elements.directionsButton.setAttribute("href", url.toString());
  elements.directionsButton.classList.remove("disabled");
}

function setLoadingState() {
  setCardState("loading");
  elements.stateLabel.textContent = "Detecting your location & finding the nearest bin...";
  elements.binName.textContent = "Searching nearby bins";
  elements.distanceText.textContent = "-";
  elements.etaText.textContent = "-";
  elements.userLocationText.textContent = "Locating…";
  hideErrorBanner();
  resetDirectionsButton();
}

function formatCoords(coords) {
  return `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;
}

async function reverseGeocode(coords) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(coords[0]));
  url.searchParams.set("lon", String(coords[1]));
  url.searchParams.set("zoom", "18");

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) {
    throw new Error(`Reverse geocode failed with HTTP ${response.status}.`);
  }
  const payload = await response.json();
  return typeof payload?.display_name === "string" ? payload.display_name : "";
}

async function updateUserLocation(coords) {
  const coordsLabel = formatCoords(coords);
  elements.userLocationText.textContent = coordsLabel;

  try {
    const address = await reverseGeocode(coords);
    const stillCurrent =
      currentUserCoordinates &&
      currentUserCoordinates[0] === coords[0] &&
      currentUserCoordinates[1] === coords[1];
    if (address && stillCurrent) {
      elements.userLocationText.textContent = address;
    }
  } catch {
    // keep coordinate label on failure
  }
}

function setCardCollapsed(collapsed) {
  elements.statusCard.classList.toggle("is-collapsed", collapsed);
  elements.minimizeButton.setAttribute("aria-expanded", collapsed ? "false" : "true");
  elements.minimizeButton.setAttribute(
    "title",
    collapsed ? "Expand panel" : "Minimize panel"
  );
  const srLabel = elements.minimizeButton.querySelector(".sr-only");
  if (srLabel) {
    srLabel.textContent = collapsed ? "Expand panel" : "Minimize panel";
  }
}

function setManualLocationMode(enabled) {
  manualLocationMode = enabled;
  elements.manualLocationButton.classList.toggle("is-active", enabled);
  elements.manualLocationButton.setAttribute("aria-pressed", enabled ? "true" : "false");
  elements.manualLocationButton.textContent = enabled ? "Cancel Map Selection" : "Set Location on Map";
  map.getContainer().classList.toggle("pick-location", enabled);
  if (enabled) {
    elements.stateLabel.textContent = "Tap anywhere on the map to set your location.";
    hideErrorBanner();
  }
}

function setEmptyState() {
  setCardState("success");
  elements.stateLabel.textContent = "No bins available from API";
  elements.binName.textContent = "Try again later";
  elements.distanceText.textContent = "-";
  elements.etaText.textContent = "-";
  hideErrorBanner();
  resetDirectionsButton();
}

function setErrorState(message, details) {
  setCardState("error");
  elements.stateLabel.textContent = message;
  elements.binName.textContent = details;
  elements.distanceText.textContent = "-";
  elements.etaText.textContent = "-";
  resetDirectionsButton();
  showErrorBanner(message);
}

function setNearestState(binName, distanceMeters, fallback, manual) {
  setCardState("success");
  if (manual) {
    elements.stateLabel.textContent = "Nearest recycling bin from selected map point";
  } else {
    elements.stateLabel.textContent = fallback
      ? "Location unavailable. Using Manhattan as default."
      : "Nearest recycling bin found";
  }
  elements.binName.textContent = binName;
  elements.distanceText.textContent = `${Math.round(distanceMeters)} m`;
  elements.etaText.textContent = `${Math.max(1, Math.ceil(distanceMeters / WALKING_METERS_PER_MINUTE))} min walk`;
}

function highlightSelectedMarker(binId) {
  selectedBinId = binId;
  binMarkersById.forEach((marker, id) => {
    const el = marker.getElement();
    if (el) {
      el.classList.toggle("is-selected", id === binId);
    }
  });
}

function selectBin(bin) {
  if (!currentUserCoordinates) {
    return;
  }
  const binCoords = [bin.latitude, bin.longitude];
  const meters = distanceMeters(currentUserCoordinates, binCoords);

  currentNearestCoordinates = binCoords;
  upsertRouteLine(currentUserCoordinates, binCoords);
  setDirectionsLink(currentUserCoordinates, binCoords);

  setCardState("success");
  elements.stateLabel.textContent = "Selected recycling bin";
  elements.binName.textContent = bin.name;
  elements.distanceText.textContent = `${Math.round(meters)} m`;
  elements.etaText.textContent = `${Math.max(1, Math.ceil(meters / WALKING_METERS_PER_MINUTE))} min walk`;
  hideErrorBanner();
  highlightSelectedMarker(bin.id);
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function buildApiUrl(path, params) {
  const url = new URL(`${normalizeBaseUrl(appConfig.backendBaseUrl)}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

function getTypeMeta(rawType) {
  const key = typeof rawType === "string" ? rawType.toLowerCase() : "";
  return TYPE_ICON_MAP[key] ?? TYPE_ICON_MAP.generic;
}

function createBinIcon(rawType) {
  const typeMeta = getTypeMeta(rawType);
  return L.divIcon({
    className: "",
    html: `<div class="bin-marker"><span class="bin-marker-icon ${typeMeta.cssClass}" aria-hidden="true"><span>${typeMeta.icon}</span></span></div>`,
    iconSize: [36, 46],
    iconAnchor: [18, 42]
  });
}

function distanceMeters(from, to) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(to[0] - from[0]);
  const dLng = toRad(to[1] - from[1]);
  const lat1 = toRad(from[0]);
  const lat2 = toRad(to[0]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function createPopupContent(bin) {
  const container = document.createElement("div");
  container.className = "popup-content";

  const title = document.createElement("h4");
  title.textContent = bin.name;
  container.appendChild(title);

  const typeLine = document.createElement("p");
  typeLine.textContent = `Type: ${getTypeMeta(bin.type).label}`;
  container.appendChild(typeLine);

  const addressLine = document.createElement("p");
  addressLine.textContent = `Address: ${bin.address && bin.address.trim() ? bin.address : "Address unavailable"}`;
  container.appendChild(addressLine);

  if (currentUserCoordinates) {
    const meters = distanceMeters(currentUserCoordinates, [bin.latitude, bin.longitude]);
    const walkMinutes = Math.max(1, Math.ceil(meters / WALKING_METERS_PER_MINUTE));
    const distanceLine = document.createElement("p");
    distanceLine.className = "popup-distance";
    distanceLine.textContent = `Distance: ${Math.round(meters)} m · ${walkMinutes} min walk`;
    container.appendChild(distanceLine);
  }

  return container;
}

function parseBin(bin) {
  const id = Number(bin?.id);
  const name = typeof bin?.name === "string" && bin.name.trim() ? bin.name.trim() : `Bin ${id}`;
  const latitude = Number(bin?.latitude);
  const longitude = Number(bin?.longitude);
  const address = typeof bin?.address === "string" ? bin.address : null;
  const type = typeof bin?.type === "string" ? bin.type : null;

  if (!Number.isInteger(id)) {
    throw new Error("Bin id must be an integer.");
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error(`Bin ${id} is missing valid coordinates.`);
  }

  return { id, name, latitude, longitude, address, type };
}

async function loadRuntimeConfig() {
  try {
    const response = await fetch("/config", { headers: { Accept: "application/json" } });
    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    if (typeof payload.appName === "string" && payload.appName) {
      appConfig.appName = payload.appName;
    }
    if (typeof payload.version === "string" && payload.version) {
      appConfig.version = payload.version;
    }
    if (typeof payload.companyName === "string" && payload.companyName) {
      appConfig.companyName = payload.companyName;
    }
    if (typeof payload.backendBaseUrl === "string" && payload.backendBaseUrl) {
      appConfig.backendBaseUrl = payload.backendBaseUrl;
    }
  } catch {
    // keep local defaults
  }
}

async function fetchBins() {
  const response = await fetch(buildApiUrl("/api/bins"), {
    method: "GET",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    let details = `HTTP ${response.status}`;
    try {
      const payload = await response.json();
      if (typeof payload?.error === "string" && payload.error.trim()) {
        details = payload.error.trim();
      }
    } catch {
      // keep fallback details
    }
    throw new Error(details);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Invalid /api/bins response.");
  }
  return data.map(parseBin);
}

async function fetchNearestBin(lat, lng) {
  const response = await fetch(buildApiUrl("/api/bins/nearest", { lat, lng }), {
    method: "GET",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    let details = `HTTP ${response.status}`;
    try {
      const payload = await response.json();
      if (typeof payload?.error === "string" && payload.error.trim()) {
        details = payload.error.trim();
      }
    } catch {
      // keep fallback details
    }
    throw new Error(details);
  }

  const payload = await response.json();
  const nearestBin = parseBin(payload?.nearestBin);
  const distanceMeters = Number(payload?.distanceMeters ?? payload?.nearestBin?.distanceMeters);
  if (!Number.isFinite(distanceMeters)) {
    throw new Error("Nearest-bin response missing distanceMeters.");
  }

  return { nearestBin, distanceMeters };
}

function upsertUserMarker(lat, lng) {
  if (!userMarker) {
    userMarker = L.marker([lat, lng], {
      icon: userIcon,
      keyboard: true,
      title: "Your location",
      alt: "Your location"
    })
      .bindPopup("You are here")
      .addTo(map);
    return;
  }
  userMarker.setLatLng([lat, lng]);
}

function upsertRouteLine(userCoords, nearestCoords) {
  if (routeLine) {
    routeLine.remove();
  }

  routeLine = L.polyline([userCoords, nearestCoords], {
    color: "#2E7D32",
    weight: 3.5,
    dashArray: "8 10",
    lineCap: "round",
    opacity: 0.82
  }).addTo(map);
}

function renderBinMarkers(bins) {
  const seenIds = new Set();

  bins.forEach((bin) => {
    seenIds.add(bin.id);
    const coords = [bin.latitude, bin.longitude];
    const title = `${bin.name} (${getTypeMeta(bin.type).label})`;
    const popupFn = () => createPopupContent(bin);
    const onSelect = () => selectBin(bin);

    const existing = binMarkersById.get(bin.id);
    if (existing) {
      existing.setLatLng(coords);
      existing.setIcon(createBinIcon(bin.type));
      existing.options.title = title;
      existing.options.alt = title;
      existing.bindPopup(popupFn);
      existing.off("click", existing.__onSelect);
      existing.__onSelect = onSelect;
      existing.on("click", onSelect);
      existing.__bin = bin;
      return;
    }

    const marker = L.marker(coords, {
      icon: createBinIcon(bin.type),
      keyboard: true,
      title,
      alt: title,
      riseOnHover: true
    }).bindPopup(popupFn);

    marker.__bin = bin;
    marker.__onSelect = onSelect;
    marker.on("click", onSelect);

    marker.on("keypress", (event) => {
      const key = event?.originalEvent?.key;
      if (key === "Enter" || key === " ") {
        selectBin(bin);
        marker.openPopup();
      }
    });

    binsLayer.addLayer(marker);
    binMarkersById.set(bin.id, marker);
  });

  Array.from(binMarkersById.keys()).forEach((id) => {
    if (!seenIds.has(id)) {
      const marker = binMarkersById.get(id);
      if (marker) {
        binsLayer.removeLayer(marker);
      }
      binMarkersById.delete(id);
    }
  });
}

const USER_FOCUS_ZOOM = 16;

function focusOnUser(userCoords, nearestCoords) {
  if (nearestCoords) {
    const bounds = L.latLngBounds([userCoords, nearestCoords]);
    map.fitBounds(bounds, { padding: [70, 70], maxZoom: USER_FOCUS_ZOOM });
    map.panTo(userCoords, { animate: true });
    return;
  }
  map.setView(userCoords, USER_FOCUS_ZOOM, { animate: true });
}

function resolveLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        coords: MANHATTAN_CENTER,
        fallback: true,
        reason: "Geolocation is not supported in this browser."
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: [position.coords.latitude, position.coords.longitude],
          fallback: false,
          reason: ""
        });
      },
      (error) => {
        const reason = error.code === error.PERMISSION_DENIED
          ? "Location permission denied."
          : "Could not detect your location.";
        resolve({
          coords: MANHATTAN_CENTER,
          fallback: true,
          reason
        });
      },
      GEOLOCATION_OPTIONS
    );
  });
}

async function refreshMapData(options = {}) {
  const { forcedCoords = null } = options;
  setLoadingState();
  hideErrorBanner();
  setManualLocationMode(false);

  const location = forcedCoords
    ? {
      coords: forcedCoords,
      fallback: false,
      reason: "",
      manual: true
    }
    : await resolveLocation();
  currentUserCoordinates = location.coords;
  upsertUserMarker(location.coords[0], location.coords[1]);
  updateUserLocation(location.coords);
  map.setView(location.coords, USER_FOCUS_ZOOM, { animate: true });

  try {
    const bins = await fetchBins();
    renderBinMarkers(bins);

    if (!bins.length) {
      setEmptyState();
      if (location.fallback) {
        showErrorBanner(`${location.reason} Showing Manhattan center.`);
      }
      map.setView(location.coords, USER_FOCUS_ZOOM, { animate: true });
      return;
    }

    const nearest = await fetchNearestBin(location.coords[0], location.coords[1]);
    currentNearestCoordinates = [nearest.nearestBin.latitude, nearest.nearestBin.longitude];
    upsertRouteLine(location.coords, currentNearestCoordinates);
    setDirectionsLink(location.coords, currentNearestCoordinates);
    setNearestState(nearest.nearestBin.name, nearest.distanceMeters, location.fallback, !!location.manual);

    if (location.fallback) {
      showErrorBanner(`${location.reason} Showing nearest Manhattan bin.`);
    }

    focusOnUser(location.coords, currentNearestCoordinates);
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unexpected API error.";
    setErrorState("Failed to load recycling bins.", details);
  }
}

function setupShell() {
  elements.appName.textContent = appConfig.appName;
  elements.appVersion.textContent = `v${appConfig.version}`;
  elements.footerCopyright.textContent = `© ${new Date().getFullYear()} ${appConfig.companyName}.`;
  setTimeout(() => map.invalidateSize(), 60);
  window.addEventListener("resize", () => map.invalidateSize());
  map.on("click", async (event) => {
    if (!manualLocationMode) {
      return;
    }
    await refreshMapData({ forcedCoords: [event.latlng.lat, event.latlng.lng] });
  });

  elements.manualLocationButton.addEventListener("click", () => {
    setManualLocationMode(!manualLocationMode);
  });
  elements.retryButton.addEventListener("click", refreshMapData);
  elements.bannerRetryButton.addEventListener("click", refreshMapData);

  elements.minimizeButton.addEventListener("click", () => {
    setCardCollapsed(!elements.statusCard.classList.contains("is-collapsed"));
  });
}

(async () => {
  await loadRuntimeConfig();
  setupShell();
  refreshMapData();
})();
