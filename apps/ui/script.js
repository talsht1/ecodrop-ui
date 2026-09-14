const MANHATTAN_CENTER = [40.7831, -73.9712];
const MAP_DEFAULT_ZOOM = 13;
const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 12000,
  maximumAge: 0
};
const WALKING_METERS_PER_MINUTE = 78;

const TYPE_ICON_MAP = {
  glass: { labelKey: "type.glass", icon: "🍾", cssClass: "type-glass" },
  paper: { labelKey: "type.paper", icon: "📰", cssClass: "type-paper" },
  plastic: { labelKey: "type.plastic", icon: "🧴", cssClass: "type-plastic" },
  metal: { labelKey: "type.metal", icon: "🥫", cssClass: "type-metal" },
  electronics: { labelKey: "type.electronics", icon: "💻", cssClass: "type-electronics" },
  mixed: { labelKey: "type.mixed", icon: "♻️", cssClass: "type-mixed" },
  generic: { labelKey: "type.generic", icon: "🗑️", cssClass: "type-generic" }
};

const appConfig = {
  appName: window.ECODROP_CONFIG?.appName ?? "EcoDrop Locator",
  version: window.ECODROP_CONFIG?.version ?? "1.0.0",
  companyName: window.ECODROP_CONFIG?.companyName ?? "EcoDrop",
  backendBaseUrl: window.ECODROP_CONFIG?.backendBaseUrl ?? "http://localhost:3000",
  mapStyle: window.ECODROP_CONFIG?.mapStyle ?? "osm"
};

const SUPPORTED_LANGS = ["en", "he"];
const LANG_STORAGE_KEY = "ecodrop_lang";

const TRANSLATIONS = {
  en: {
    "lang.name": "English",
    "brand.eyebrow": "Eco Navigation",
    "header.rights": "All rights reserved.",
    "fab.addBin": "Add Bin",
    "fab.addBinTitle": "Register a new recycling bin",
    "state.preparing": "Preparing map data",
    "card.searching": "Searching nearby bins",
    "panel.minimize": "Minimize panel",
    "panel.expand": "Expand panel",
    "loading.detecting": "Detecting your location & finding the nearest bin...",
    "location.yourLocation": "📍 Your location",
    "location.locating": "Locating…",
    "metric.walkingDistance": "Walking distance",
    "metric.estimatedTime": "Estimated time",
    "legend.title": "Bin Types",
    "type.glass": "Glass",
    "type.paper": "Paper",
    "type.plastic": "Plastic",
    "type.metal": "Metal",
    "type.electronics": "Electronics",
    "type.mixed": "Mixed",
    "type.generic": "Unknown",
    "btn.getDirections": "Get Directions",
    "btn.setLocationOnMap": "Set Location on Map",
    "btn.cancelMapSelection": "Cancel Map Selection",
    "btn.retry": "Retry",
    "error.default": "Something went wrong while loading nearby bins.",
    "error.failedLoad": "Failed to load recycling bins.",
    "hint.tapMap": "Tap the map to place your new bin.",
    "manual.tapMap": "Tap anywhere on the map to set your location.",
    "dialog.title": "Register a recycling bin",
    "dialog.close": "Close dialog",
    "field.name": "Name",
    "field.address": "Address",
    "field.type": "Type",
    "field.optional": "(optional)",
    "field.location": "Location",
    "placeholder.name": "e.g. Riverside Glass Bank",
    "placeholder.address": "e.g. 5th Ave & E 59th St",
    "binloc.notSet": "Not set",
    "btn.pickOnMap": "Pick on map",
    "btn.cancel": "Cancel",
    "btn.saveBin": "Save bin",
    "btn.saving": "Saving…",
    "state.noBins": "No bins available from API",
    "state.tryLater": "Try again later",
    "state.nearestFromPoint": "Nearest recycling bin from selected map point",
    "state.locationDefault": "Location unavailable. Using Manhattan as default.",
    "state.nearestFound": "Nearest recycling bin found",
    "state.selected": "Selected recycling bin",
    "state.newRegistered": "New bin registered",
    "unit.meters": "{n} m",
    "unit.walkMin": "{n} min walk",
    "popup.type": "Type: {value}",
    "popup.address": "Address: {value}",
    "popup.addressUnavailable": "Address unavailable",
    "popup.distance": "Distance: {meters} m · {minutes} min walk",
    "map.yourLocation": "Your location",
    "map.youAreHere": "You are here",
    "map.newBinLocation": "New bin location",
    "reason.geolocationUnsupported": "Geolocation is not supported in this browser.",
    "reason.permissionDenied": "Location permission denied.",
    "reason.locationUnavailable": "Could not detect your location.",
    "banner.manhattanCenter": "{reason} Showing Manhattan center.",
    "banner.manhattanBin": "{reason} Showing nearest Manhattan bin.",
    "addbin.enterName": "Please enter a bin name.",
    "addbin.pickLocation": "Please pick the bin location on the map.",
    "addbin.failed": "Failed to create bin.",
    "bin.fallbackName": "Bin {id}"
  },
  he: {
    "lang.name": "עברית",
    "brand.eyebrow": "ניווט אקולוגי",
    "header.rights": "כל הזכויות שמורות.",
    "fab.addBin": "הוסף פח",
    "fab.addBinTitle": "רישום פח מיחזור חדש",
    "state.preparing": "מכין את נתוני המפה",
    "card.searching": "מחפש פחים בקרבת מקום",
    "panel.minimize": "מזער חלונית",
    "panel.expand": "הרחב חלונית",
    "loading.detecting": "מאתר את מיקומך ומחפש את הפח הקרוב ביותר...",
    "location.yourLocation": "📍 המיקום שלך",
    "location.locating": "מאתר…",
    "metric.walkingDistance": "מרחק הליכה",
    "metric.estimatedTime": "זמן משוער",
    "legend.title": "סוגי פחים",
    "type.glass": "זכוכית",
    "type.paper": "נייר",
    "type.plastic": "פלסטיק",
    "type.metal": "מתכת",
    "type.electronics": "אלקטרוניקה",
    "type.mixed": "מעורב",
    "type.generic": "לא ידוע",
    "btn.getDirections": "קבל מסלול",
    "btn.setLocationOnMap": "בחר מיקום במפה",
    "btn.cancelMapSelection": "בטל בחירה במפה",
    "btn.retry": "נסה שוב",
    "error.default": "משהו השתבש בעת טעינת הפחים הסמוכים.",
    "error.failedLoad": "טעינת פחי המיחזור נכשלה.",
    "hint.tapMap": "הקש על המפה כדי למקם את הפח החדש.",
    "manual.tapMap": "הקש בכל מקום במפה כדי לקבוע את מיקומך.",
    "dialog.title": "רישום פח מיחזור",
    "dialog.close": "סגור חלון",
    "field.name": "שם",
    "field.address": "כתובת",
    "field.type": "סוג",
    "field.optional": "(אופציונלי)",
    "field.location": "מיקום",
    "placeholder.name": "לדוגמה: נקודת זכוכית ריברסייד",
    "placeholder.address": "לדוגמה: רחוב הרצל 5",
    "binloc.notSet": "לא נקבע",
    "btn.pickOnMap": "בחר במפה",
    "btn.cancel": "ביטול",
    "btn.saveBin": "שמור פח",
    "btn.saving": "שומר…",
    "state.noBins": "אין פחים זמינים מה-API",
    "state.tryLater": "נסה שוב מאוחר יותר",
    "state.nearestFromPoint": "הפח הקרוב ביותר מהנקודה שנבחרה במפה",
    "state.locationDefault": "המיקום אינו זמין. משתמש במנהטן כברירת מחדל.",
    "state.nearestFound": "נמצא הפח הקרוב ביותר",
    "state.selected": "פח המיחזור שנבחר",
    "state.newRegistered": "פח חדש נרשם",
    "unit.meters": "{n} מ׳",
    "unit.walkMin": "{n} דק׳ הליכה",
    "popup.type": "סוג: {value}",
    "popup.address": "כתובת: {value}",
    "popup.addressUnavailable": "הכתובת אינה זמינה",
    "popup.distance": "מרחק: {meters} מ׳ · {minutes} דק׳ הליכה",
    "map.yourLocation": "המיקום שלך",
    "map.youAreHere": "אתה כאן",
    "map.newBinLocation": "מיקום הפח החדש",
    "reason.geolocationUnsupported": "איתור מיקום אינו נתמך בדפדפן זה.",
    "reason.permissionDenied": "הגישה למיקום נדחתה.",
    "reason.locationUnavailable": "לא ניתן לאתר את מיקומך.",
    "banner.manhattanCenter": "{reason} מציג את מרכז מנהטן.",
    "banner.manhattanBin": "{reason} מציג את הפח הקרוב ביותר במנהטן.",
    "addbin.enterName": "נא להזין שם פח.",
    "addbin.pickLocation": "נא לבחור את מיקום הפח במפה.",
    "addbin.failed": "יצירת הפח נכשלה.",
    "bin.fallbackName": "פח {id}"
  }
};

function detectInitialLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (SUPPORTED_LANGS.includes(saved)) {
      return saved;
    }
  } catch {
    // storage unavailable
  }
  const nav = (navigator.language || "").toLowerCase();
  return nav.startsWith("he") ? "he" : "en";
}

let currentLang = detectInitialLang();

function t(key, vars) {
  const table = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  let str = table[key] ?? TRANSLATIONS.en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${name}\\}`, "g"), String(value));
    }
  }
  return str;
}

function formatMeters(meters) {
  return t("unit.meters", { n: Math.round(meters) });
}

function formatWalkMinutes(meters) {
  return t("unit.walkMin", {
    n: Math.max(1, Math.ceil(meters / WALKING_METERS_PER_MINUTE))
  });
}

let statusRenderer = null;
let bannerRenderer = null;

const MAP_STYLES = {
  osm: {
    label: "OpenStreetMap Standard",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  positron: {
    label: "CartoDB Positron (light)",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  dark: {
    label: "CartoDB Dark Matter",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  voyager: {
    label: "CartoDB Voyager",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  topo: {
    label: "OpenTopoMap",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    maxZoom: 17,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
  }
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
  errorText: document.getElementById("error-text"),
  addBinButton: document.getElementById("btn-add-bin"),
  addBinHint: document.getElementById("add-bin-hint"),
  addBinDialog: document.getElementById("add-bin-dialog"),
  addBinForm: document.getElementById("add-bin-form"),
  binNameInput: document.getElementById("bin-name-input"),
  binAddressInput: document.getElementById("bin-address-input"),
  binTypeInput: document.getElementById("bin-type-input"),
  binLocationText: document.getElementById("bin-location-text"),
  pickBinLocationButton: document.getElementById("btn-pick-bin-location"),
  closeAddBinButton: document.getElementById("btn-close-add-bin"),
  cancelAddBinButton: document.getElementById("btn-cancel-add-bin"),
  submitBinButton: document.getElementById("btn-submit-bin"),
  addBinError: document.getElementById("add-bin-error"),
  langToggle: document.getElementById("btn-lang"),
  langToggleText: document.getElementById("lang-toggle-text")
};

const map = L.map("map", { zoomControl: false }).setView(MANHATTAN_CENTER, MAP_DEFAULT_ZOOM);
L.control.zoom({ position: "bottomright" }).addTo(map);

let tileLayer = null;

function applyMapStyle(styleKey) {
  const style = MAP_STYLES[styleKey] ?? MAP_STYLES.osm;
  if (tileLayer) {
    tileLayer.remove();
  }
  tileLayer = L.tileLayer(style.url, {
    maxZoom: style.maxZoom,
    attribution: style.attribution
  }).addTo(map);
}

applyMapStyle(appConfig.mapStyle);

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
let addBinPickMode = false;
let addBinCoords = null;
let addBinPreviewMarker = null;

function setCardState(state) {
  elements.statusCard.classList.remove("is-loading", "is-success", "is-error");
  elements.statusCard.classList.add(`is-${state}`);
}

function renderBanner(key, vars) {
  bannerRenderer = () => {
    elements.errorText.textContent = t(key, vars);
  };
  bannerRenderer();
  elements.errorBanner.classList.remove("hidden");
}

function hideErrorBanner() {
  bannerRenderer = null;
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
  statusRenderer = () => {
    elements.stateLabel.textContent = t("loading.detecting");
    elements.binName.textContent = t("card.searching");
  };
  statusRenderer();
  elements.distanceText.textContent = "-";
  elements.etaText.textContent = "-";
  elements.userLocationText.textContent = t("location.locating");
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
  const label = t(collapsed ? "panel.expand" : "panel.minimize");
  elements.minimizeButton.setAttribute("title", label);
  const srLabel = elements.minimizeButton.querySelector(".sr-only");
  if (srLabel) {
    srLabel.textContent = label;
  }
}

function setManualLocationMode(enabled) {
  manualLocationMode = enabled;
  elements.manualLocationButton.classList.toggle("is-active", enabled);
  elements.manualLocationButton.setAttribute("aria-pressed", enabled ? "true" : "false");
  elements.manualLocationButton.textContent = t(enabled ? "btn.cancelMapSelection" : "btn.setLocationOnMap");
  map.getContainer().classList.toggle("pick-location", enabled);
  if (enabled) {
    statusRenderer = () => {
      elements.stateLabel.textContent = t("manual.tapMap");
    };
    statusRenderer();
    hideErrorBanner();
  }
}

function setEmptyState() {
  setCardState("success");
  statusRenderer = () => {
    elements.stateLabel.textContent = t("state.noBins");
    elements.binName.textContent = t("state.tryLater");
  };
  statusRenderer();
  elements.distanceText.textContent = "-";
  elements.etaText.textContent = "-";
  hideErrorBanner();
  resetDirectionsButton();
}

function setErrorState(messageKey, details) {
  setCardState("error");
  statusRenderer = () => {
    elements.stateLabel.textContent = t(messageKey);
    elements.binName.textContent = details;
  };
  statusRenderer();
  elements.distanceText.textContent = "-";
  elements.etaText.textContent = "-";
  resetDirectionsButton();
  renderBanner(messageKey);
}

function setNearestState(binName, distanceMeters, fallback, manual) {
  setCardState("success");
  statusRenderer = () => {
    if (manual) {
      elements.stateLabel.textContent = t("state.nearestFromPoint");
    } else {
      elements.stateLabel.textContent = fallback
        ? t("state.locationDefault")
        : t("state.nearestFound");
    }
    elements.binName.textContent = binName;
    elements.distanceText.textContent = formatMeters(distanceMeters);
    elements.etaText.textContent = formatWalkMinutes(distanceMeters);
  };
  statusRenderer();
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
  statusRenderer = () => {
    elements.stateLabel.textContent = t("state.selected");
    elements.binName.textContent = bin.name;
    elements.distanceText.textContent = formatMeters(meters);
    elements.etaText.textContent = formatWalkMinutes(meters);
  };
  statusRenderer();
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

function typeLabel(rawType) {
  return t(getTypeMeta(rawType).labelKey);
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
  typeLine.textContent = t("popup.type", { value: typeLabel(bin.type) });
  container.appendChild(typeLine);

  const addressLine = document.createElement("p");
  addressLine.textContent = t("popup.address", {
    value: bin.address && bin.address.trim() ? bin.address : t("popup.addressUnavailable")
  });
  container.appendChild(addressLine);

  if (currentUserCoordinates) {
    const meters = distanceMeters(currentUserCoordinates, [bin.latitude, bin.longitude]);
    const walkMinutes = Math.max(1, Math.ceil(meters / WALKING_METERS_PER_MINUTE));
    const distanceLine = document.createElement("p");
    distanceLine.className = "popup-distance";
    distanceLine.textContent = t("popup.distance", {
      meters: Math.round(meters),
      minutes: walkMinutes
    });
    container.appendChild(distanceLine);
  }

  return container;
}

function parseBin(bin) {
  const id = Number(bin?.id);
  const name = typeof bin?.name === "string" && bin.name.trim() ? bin.name.trim() : t("bin.fallbackName", { id });
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
    if (typeof payload.mapStyle === "string" && MAP_STYLES[payload.mapStyle]) {
      appConfig.mapStyle = payload.mapStyle;
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

async function createBin(binInput) {
  const response = await fetch(buildApiUrl("/api/bins"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(binInput)
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

  return parseBin(await response.json());
}

function upsertUserMarker(lat, lng) {
  if (!userMarker) {
    userMarker = L.marker([lat, lng], {
      icon: userIcon,
      keyboard: true,
      title: t("map.yourLocation"),
      alt: t("map.yourLocation")
    })
      .bindPopup(t("map.youAreHere"))
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

function createBinMarkerInstance(bin) {
  const title = `${bin.name} (${typeLabel(bin.type)})`;
  const marker = L.marker([bin.latitude, bin.longitude], {
    icon: createBinIcon(bin.type),
    keyboard: true,
    title,
    alt: title,
    riseOnHover: true
  }).bindPopup(() => createPopupContent(bin));

  marker.__bin = bin;
  const onSelect = () => selectBin(bin);
  marker.__onSelect = onSelect;
  marker.on("click", onSelect);

  marker.on("keypress", (event) => {
    const key = event?.originalEvent?.key;
    if (key === "Enter" || key === " ") {
      selectBin(bin);
      marker.openPopup();
    }
  });

  return marker;
}

function upsertBinMarker(bin) {
  const existing = binMarkersById.get(bin.id);
  if (existing) {
    binsLayer.removeLayer(existing);
    binMarkersById.delete(bin.id);
  }
  const marker = createBinMarkerInstance(bin);
  binsLayer.addLayer(marker);
  binMarkersById.set(bin.id, marker);
  return marker;
}

function renderBinMarkers(bins) {
  const seenIds = new Set();

  bins.forEach((bin) => {
    seenIds.add(bin.id);
    const coords = [bin.latitude, bin.longitude];
    const title = `${bin.name} (${typeLabel(bin.type)})`;
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

    const marker = createBinMarkerInstance(bin);
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
        reasonKey: "reason.geolocationUnsupported"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: [position.coords.latitude, position.coords.longitude],
          fallback: false,
          reasonKey: ""
        });
      },
      (error) => {
        const reasonKey = error.code === error.PERMISSION_DENIED
          ? "reason.permissionDenied"
          : "reason.locationUnavailable";
        resolve({
          coords: MANHATTAN_CENTER,
          fallback: true,
          reasonKey
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
      reasonKey: "",
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
        renderBanner("banner.manhattanCenter", { reason: t(location.reasonKey) });
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
      renderBanner("banner.manhattanBin", { reason: t(location.reasonKey) });
    }

    focusOnUser(location.coords, currentNearestCoordinates);
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unexpected API error.";
    setErrorState("error.failedLoad", details);
  }
}

function setAddBinPickMode(enabled) {
  addBinPickMode = enabled;
  map.getContainer().classList.toggle("pick-location", enabled);
  elements.addBinHint.classList.toggle("hidden", !enabled);
}

function updateAddBinLocationLabel() {
  elements.binLocationText.textContent = addBinCoords
    ? formatCoords(addBinCoords)
    : t("binloc.notSet");
}

function showAddBinError(message) {
  elements.addBinError.textContent = message;
  elements.addBinError.classList.remove("hidden");
}

function clearAddBinError() {
  elements.addBinError.textContent = "";
  elements.addBinError.classList.add("hidden");
}

function openAddBinDialog() {
  clearAddBinError();
  if (typeof elements.addBinDialog.showModal === "function") {
    if (!elements.addBinDialog.open) {
      elements.addBinDialog.showModal();
    }
  } else {
    elements.addBinDialog.setAttribute("open", "");
  }
}

function closeAddBinDialog() {
  if (typeof elements.addBinDialog.close === "function") {
    if (elements.addBinDialog.open) {
      elements.addBinDialog.close();
    }
  } else {
    elements.addBinDialog.removeAttribute("open");
  }
}

function resetAddBinForm() {
  elements.addBinForm.reset();
  addBinCoords = null;
  if (addBinPreviewMarker) {
    addBinPreviewMarker.remove();
    addBinPreviewMarker = null;
  }
  updateAddBinLocationLabel();
  clearAddBinError();
}

function beginAddBinLocationPick() {
  closeAddBinDialog();
  setManualLocationMode(false);
  setAddBinPickMode(true);
}

function handleAddBinMapClick(latlng) {
  addBinCoords = [latlng.lat, latlng.lng];
  if (addBinPreviewMarker) {
    addBinPreviewMarker.setLatLng(addBinCoords);
  } else {
    addBinPreviewMarker = L.marker(addBinCoords, {
      icon: createBinIcon(elements.binTypeInput.value || null),
      title: t("map.newBinLocation"),
      alt: t("map.newBinLocation")
    }).addTo(map);
  }
  setAddBinPickMode(false);
  updateAddBinLocationLabel();
  openAddBinDialog();
}

async function submitNewBin(event) {
  event.preventDefault();
  clearAddBinError();

  const name = elements.binNameInput.value.trim();
  if (!name) {
    showAddBinError(t("addbin.enterName"));
    elements.binNameInput.focus();
    return;
  }
  if (!addBinCoords) {
    showAddBinError(t("addbin.pickLocation"));
    return;
  }

  const payload = {
    name,
    latitude: addBinCoords[0],
    longitude: addBinCoords[1]
  };
  const address = elements.binAddressInput.value.trim();
  if (address) {
    payload.address = address;
  }
  const type = elements.binTypeInput.value;
  if (type) {
    payload.type = type;
  }

  elements.submitBinButton.disabled = true;
  elements.submitBinButton.textContent = t("btn.saving");

  try {
    const created = await createBin(payload);
    upsertBinMarker(created);
    if (addBinPreviewMarker) {
      addBinPreviewMarker.remove();
      addBinPreviewMarker = null;
    }
    closeAddBinDialog();
    resetAddBinForm();
    map.setView([created.latitude, created.longitude], USER_FOCUS_ZOOM, { animate: true });
    if (currentUserCoordinates) {
      selectBin(created);
    } else {
      setCardState("success");
      statusRenderer = () => {
        elements.stateLabel.textContent = t("state.newRegistered");
        elements.binName.textContent = created.name;
      };
      statusRenderer();
    }
  } catch (error) {
    const details = error instanceof Error ? error.message : t("addbin.failed");
    showAddBinError(details);
  } finally {
    elements.submitBinButton.disabled = false;
    elements.submitBinButton.textContent = t("btn.saveBin");
  }
}

function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.setAttribute("title", t(node.getAttribute("data-i18n-title")));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.getAttribute("data-i18n-placeholder")));
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria-label")));
  });
}

function applyLanguage(lang) {
  currentLang = SUPPORTED_LANGS.includes(lang) ? lang : "en";
  try {
    localStorage.setItem(LANG_STORAGE_KEY, currentLang);
  } catch {
    // storage unavailable
  }

  document.documentElement.setAttribute("lang", currentLang);
  document.documentElement.setAttribute("dir", currentLang === "he" ? "rtl" : "ltr");

  applyStaticTranslations();

  const other = SUPPORTED_LANGS.find((code) => code !== currentLang) || "en";
  elements.langToggleText.textContent = TRANSLATIONS[other]["lang.name"];
  elements.langToggle.setAttribute(
    "aria-label",
    `Switch language to ${TRANSLATIONS[other]["lang.name"]}`
  );

  if (statusRenderer) {
    statusRenderer();
  }
  if (bannerRenderer) {
    bannerRenderer();
  }
  setManualLocationMode(manualLocationMode);
  setCardCollapsed(elements.statusCard.classList.contains("is-collapsed"));
  updateAddBinLocationLabel();
  if (userMarker) {
    userMarker.setPopupContent(t("map.youAreHere"));
  }
}

function setupShell() {
  elements.appName.textContent = appConfig.appName;
  elements.appVersion.textContent = `v${appConfig.version}`;
  elements.footerCopyright.textContent = `© ${new Date().getFullYear()} ${appConfig.companyName}.`;
  setTimeout(() => map.invalidateSize(), 60);
  window.addEventListener("resize", () => map.invalidateSize());
  map.on("click", async (event) => {
    if (addBinPickMode) {
      handleAddBinMapClick(event.latlng);
      return;
    }
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

  elements.addBinButton.addEventListener("click", () => {
    resetAddBinForm();
    openAddBinDialog();
  });
  elements.pickBinLocationButton.addEventListener("click", beginAddBinLocationPick);
  elements.closeAddBinButton.addEventListener("click", closeAddBinDialog);
  elements.cancelAddBinButton.addEventListener("click", () => {
    closeAddBinDialog();
    resetAddBinForm();
  });
  elements.addBinForm.addEventListener("submit", submitNewBin);
  elements.binTypeInput.addEventListener("change", () => {
    if (addBinPreviewMarker) {
      addBinPreviewMarker.setIcon(createBinIcon(elements.binTypeInput.value || null));
    }
  });

  elements.langToggle.addEventListener("click", () => {
    const next = currentLang === "he" ? "en" : "he";
    applyLanguage(next);
  });
}

(async () => {
  await loadRuntimeConfig();
  applyMapStyle(appConfig.mapStyle);
  setupShell();
  applyLanguage(currentLang);
  refreshMapData();
})();
