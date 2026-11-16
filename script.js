// ===== DATOS EXACTOS (Puerto Iguazú, Misiones) =====
const CENTER = [-25.6030, -54.5720];

const STOPS = {
  "Terminal de Ómnibus": [-25.5985, -54.5711],
  "Hospital SAMIC": [-25.6012, -54.5742],
  "Plaza San Martín": [-25.5968, -54.5766],
  "Av. Victoria Aguirre": [-25.5992, -54.5738],
  "Hito Tres Fronteras": [-25.5948, -54.5908],
  "Barrio Villa Nueva": [-25.6112, -54.5685],
  "Rotonda Ruta 12": [-25.6145, -54.5610],
  "Barrio Belén": [-25.6180, -54.5580],
  "Barrio Santa Rosa": [-25.6065, -54.5650]
};

const SCHOOLS = [
  {
    id: "epet4",
    n: "EPET N.º 4",
    pos: [-25.5988, -54.5745],
    entries: ["07:30", "13:15"],
    k: ["epet", "epet 4", "tecnica", "industrial"]
  },
  {
    id: "ens8",
    n: "Escuela Normal N.º 8",
    pos: [-25.6112, -54.5675],
    entries: ["07:30", "13:00"],
    k: ["normal", "normal 8", "escuela 8", "ens 8"]
  },
  {
    id: "e615",
    n: "Escuela N.º 615 Mariano Moreno",
    pos: [-25.5962, -54.5785],
    entries: ["07:45", "13:00"],
    k: ["615", "escuela 615", "mariano moreno", "moreno"]
  },
  {
    id: "sjos",
    n: "Colegio San José",
    pos: [-25.5975, -54.5730],
    entries: ["07:30", "13:00"],
    k: ["san jose", "colegio san jose", "jose"]
  },
  {
    id: "bop11",
    n: "BOP N.º 11 (Comercio)",
    pos: [-25.6025, -54.5680],
    entries: ["07:15", "13:30"],
    k: ["bop", "bop 11", "comercio", "boponce"]
  },
  {
    id: "sam",
    n: "Instituto San Alberto Magno",
    pos: [-25.5990, -54.5790],
    entries: ["07:40", "13:00"],
    k: ["san alberto", "alberto magno", "magno", "instituto san alberto"]
  },
  {
    id: "itec",
    n: "ITEC Puerto Iguazú",
    pos: [-25.6215, -54.5532],
    entries: ["08:00", "14:00"],
    k: ["itec", "tecnologico", "instituto tecnologico", "itec iguazu"]
  }
];

const LINES = [
  {
    c: "1",
    stops: [
      { n: "Hito Tres Fronteras", o: 0 },
      { n: "Plaza San Martín", o: 6, s: "e615", w: 3 },
      { n: "Av. Victoria Aguirre", o: 10, s: "epet4", w: 2 },
      { n: "Terminal de Ómnibus", o: 13 },
      { n: "Hospital SAMIC", o: 16 }
    ],
    dep: {
      sem: ["06:30", "07:00", "07:15", "07:25", "12:15", "12:35", "12:50"],
      sab: ["07:00", "12:30"]
    }
  },
  {
    c: "2",
    stops: [
      { n: "Barrio Belén", o: 0 },
      { n: "Rotonda Ruta 12", o: 5 },
      { n: "Barrio Villa Nueva", o: 10, s: "ens8", w: 2 },
      { n: "Barrio Santa Rosa", o: 15 },
      { n: "Terminal de Ómnibus", o: 20 }
    ],
    dep: {
      sem: ["06:40", "07:05", "07:15", "12:10", "12:30", "12:40"],
      sab: ["07:30", "12:00"]
    }
  },
  {
    c: "3",
    stops: [
      { n: "Barrio Villa Nueva", o: 0, s: "ens8", w: 2 },
      { n: "Hospital SAMIC", o: 7 },
      { n: "Av. Victoria Aguirre", o: 10, s: "epet4", w: 2 },
      { n: "Plaza San Martín", o: 14, s: "e615", w: 3 }
    ],
    dep: {
      sem: ["06:45", "07:05", "07:20", "12:20", "12:40", "12:55"]
    }
  }
];

const COL = { "1": "#E11D48", "2": "#0284C7", "3": "#16A34A" };
const DAYS = { sem: "Lunes a viernes", sab: "Sábado", dom: "Domingo" };
const MODEL = "claude-sonnet-4-6";
const ALIASES = {
  "Barrio Villa Nueva": ["villa nueva"],
  "Hito Tres Fronteras": ["hito", "tres fronteras"],
  "Plaza San Martín": ["plaza"],
  "Terminal de Ómnibus": ["terminal"],
  "Hospital SAMIC": ["hospital", "samic"],
  "Av. Victoria Aguirre": ["victoria aguirre"],
  "Barrio Belén": ["belen"],
  "Barrio Santa Rosa": ["santa rosa"],
  "Rotonda Ruta 12": ["rotonda", "ruta 12"]
};

// ===== UTILIDADES =====
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const SERVED = new Set(LINES.flatMap(l => l.stops.map(p => p.n)));
const APPROX = new Set(Object.keys(STOPS));
SCHOOLS.forEach(s => { s.approx = true; });
let refreshLists = () => {};
const $ = id => document.getElementById(id);
const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fmt = m => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const dayNow = () => { const d = new Date().getDay(); return d === 0 ? "dom" : d === 6 ? "sab" : "sem"; };
const sel = () => ({ origin: $("origen").value, school: $("cole").value, entry: $("turno").value, day: $("dia").value });

// ===== INTERFAZ (HAMBURGUESA, TEMA SOL/LUNA Y CHIPS) =====
function setupUIControls() {
  const header = document.querySelector("header");
  const topBar = document.createElement("div");
  topBar.className = "top-nav-bar";
  topBar.innerHTML = `
    <button id="menuBtn" type="button" class="icon-btn" aria-label="Abrir menú" title="Menú">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
    <div>
      <h1>¿Qué colectivo me lleva al cole?</h1>
      <p class="sub">Puerto Iguazú · Elegí tu parada, escuela o escribilo abajo.</p>
    </div>
    <button id="themeBtn" type="button" class="icon-btn" aria-label="Cambiar tema" title="Cambiar tema"></button>
  `;
  header.innerHTML = "";
  header.appendChild(topBar);

  const sunIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const moonIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

  const applyTheme = theme => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) {}
    $("themeBtn").innerHTML = theme === "dark" ? sunIcon : moonIcon;
  };

  let stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  const savedTheme = stored ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(savedTheme);

  $("themeBtn").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  const overlay = document.createElement("div");
  overlay.className = "drawer-overlay";

  const drawer = document.createElement("aside");
  drawer.className = "side-drawer";
  drawer.inert = true;


  drawer.innerHTML = `
    <div class="drawer-head">
      <span>Menú Principal</span>
      <button id="closeDrawer" type="button" class="icon-btn" aria-label="Cerrar menú">✕</button>
    </div>
    <nav class="drawer-tabs" role="tablist">
      <button type="button" class="d-tab active" data-panel="info">Info</button>
      <button type="button" class="d-tab" data-panel="escuelas">Escuelas</button>
      <button type="button" class="d-tab" data-panel="paradas">Paradas</button>
    </nav>
    <div class="drawer-body">
      <div class="d-panel active" id="panel-info">
        <h3>Sobre la App</h3>
        <p class="d-desc">Calculador de colectivos escolares para <strong>Puerto Iguazú</strong>.</p>
        <div class="info-box">
          <p><strong>💡 Tips de uso:</strong></p>
          <ul>
            <li>Tocá <strong>"Cerca mío"</strong> para autodetectar tu parada con el GPS.</li>
            <li>Usa los botones rápidos debajo del buscador para probar consultas en un toque.</li>
            <li>El mapa traza la ruta real sobre las calles de Iguazú.</li>
          </ul>
        </div>
      </div>
      <div class="d-panel" id="panel-escuelas">
        <h3>Escuelas (<span id="schoolsCount"></span>)</h3>
        <p class="d-desc">Establecimientos disponibles:</p>
        <ul class="d-list" id="schoolsList"></ul>
      </div>
      <div class="d-panel" id="panel-paradas">
        <h3>Paradas (<span id="stopsCount"></span>)</h3>
        <p class="d-desc">Tocá cualquier parada para seleccionarla:</p>
        <ul class="d-list stops-list" id="stopsList"></ul>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  const toggleDrawer = open => {
    drawer.classList.toggle("open", open);
    overlay.classList.toggle("open", open);
    drawer.inert = !open;
    if (open) $("closeDrawer").focus(); else $("menuBtn").focus();
  };
  document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) toggleDrawer(false); });

  $("menuBtn").addEventListener("click", () => toggleDrawer(true));
  $("closeDrawer").addEventListener("click", () => toggleDrawer(false));
  overlay.addEventListener("click", () => toggleDrawer(false));

  drawer.querySelectorAll(".d-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      drawer.querySelectorAll(".d-tab").forEach(b => b.classList.remove("active"));
      drawer.querySelectorAll(".d-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      $("panel-" + btn.dataset.panel).classList.add("active");
    });
  });

  refreshLists = () => {
    const byName = (a, b) => a.localeCompare(b, "es");
    $("schoolsCount").textContent = SCHOOLS.length;
    $("schoolsList").innerHTML = SCHOOLS.slice().sort((a, b) => byName(a.n, b.n)).map(sc =>
      `<li><strong>${esc(sc.n)}</strong><small>${sc.entries.length ? "Entradas: " + sc.entries.join(" hs · ") + " hs" : "Sin horarios cargados"}${sc.approx ? " · ubicación aproximada" : ""}</small></li>`
    ).join("");
    const names = Object.keys(STOPS).sort(byName);
    $("stopsCount").textContent = names.length;
    $("stopsList").innerHTML = names.map(st =>
      `<li><button type="button" class="drawer-stop-link" data-stop="${esc(st)}">📍 ${esc(st)}</button></li>`
    ).join("");
  };
  $("stopsList").addEventListener("click", e => {
    const btn = e.target.closest(".drawer-stop-link");
    if (!btn) return;
    $("origen").value = btn.dataset.stop;
    render();
    toggleDrawer(false);
  });
  refreshLists();

  document.querySelectorAll(".chip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $("q").value = btn.dataset.query;
      ask();
    });
  });
}

// ===== LÓGICA DE RUTAS Y CÁLCULO =====
function findOptions(origin, schoolId, entryStr, day) {
  const entry = toMin(entryStr), res = [];
  LINES.forEach(line => {
    const i = line.stops.findIndex(p => p.n === origin);
    const j = line.stops.findIndex(p => p.s === schoolId);
    if (i < 0 || j <= i) return;
    (line.dep[day] || []).forEach(d => {
      const base = toMin(d);
      const board = base + line.stops[i].o;
      const arrive = base + line.stops[j].o + line.stops[j].w;
      if (arrive <= entry && arrive >= entry - 90) {
        res.push({ line, i, j, board, arrive, margin: entry - arrive, drop: line.stops[j] });
      }
    });
  });
  res.sort((a, b) => b.arrive - a.arrive);
  const best = res.find(o => o.margin >= 5) || res[0] || null;
  return { best, others: res.filter(o => o !== best && o.arrive >= entry - 60).slice(0, 3) };
}

function reachableFrom(schoolId) {
  const set = new Set();
  LINES.forEach(l => {
    const jx = l.stops.findIndex(p => p.s === schoolId);
    if (jx > 0) l.stops.slice(0, jx).forEach(p => set.add(p.n));
  });
  return [...set];
}

function renderList(s, r) {
  const out = $("out");
  if (!r) {
    out.innerHTML = '<div class="empty">Elegí tu parada y tu colegio arriba para calcular el mejor colectivo.</div>';
    return;
  }
  if (!r.best) {
    const school = SCHOOLS.find(x => x.id === s.school);
    const hereStop = LINES.flatMap(l => l.stops).find(p => p.n === s.origin && p.s === s.school);
    const from = reachableFrom(s.school);
    let msg;
    if (hereStop) {
      msg = 'Esta parada ya es la del colegio: caminá unos ' + hereStop.w + ' min hasta ' + esc(school.n) + '.';
    } else if (!from.includes(s.origin)) {
      msg = 'Desde ' + esc(s.origin) + ' no hay colectivo directo a ' + esc(school.n) + '. Probá subir en: ' + (from.map(esc).join(", ") || 'ninguna parada cargada') + '.';
    } else if (!LINES.some(l => l.dep[s.day])) {
      msg = 'No hay servicio ' + DAYS[s.day].toLowerCase() + '.';
    } else {
      msg = 'Ningún colectivo llega a horario ' + DAYS[s.day].toLowerCase() + '. Probá otro horario de entrada o salí antes.';
    }
    out.innerHTML = '<div class="err">' + msg + '</div>';
    return;
  }

  const b = r.best;
  const stops = b.line.stops.slice(b.i, b.j + 1)
    .map((p, k, a) => '<li class="' + (k === 0 || k === a.length - 1 ? 'on' : '') + '">' + p.n + '</li>')
    .join("");
  const tight = b.margin < 5;
  const nowD = new Date(), now = nowD.getHours() * 60 + nowD.getMinutes();
  const wait = s.day === dayNow() && b.board >= now ? ' · sale en ' + (b.board - now) + ' min' : '';

  const alternativesHTML = r.others.length
    ? '<h2>Alternativas anteriores</h2><div class="alt-list">' +
      r.others.map(o =>
        '<div class="alt">' +
          '<div><span class="alt-badge">Línea ' + o.line.c + '</span>' +
          '<small>Subís ' + fmt(o.board) + ' en ' + esc(s.origin) + '</small></div>' +
          '<div class="alt-time">Llegás ' + fmt(o.arrive) +
          '<small>Sobran ' + o.margin + ' min</small></div>' +
        '</div>'
      ).join("") +
      '</div>'
    : '';

  out.innerHTML =
    '<div class="best">' +
      '<div class="band">' +
        '<div class="num">' + b.line.c + '</div>' +
        '<div><b>Subite a las ' + fmt(b.board) + '</b><span>Parada: ' + esc(s.origin) + wait + '</span></div>' +
      '</div>' +
      '<div class="body">' +
        '<div class="margin-pill' + (tight ? ' tight' : '') + '">⏱ Llegás ' + fmt(b.arrive) + ' · ' +
        (tight ? 'Justo, sobran ' : 'Sobran ') + b.margin + ' min</div>' +
        '<ul class="route">' + stops + '</ul>' +
        '<p class="walk-note">🚶 Bajás en <b>' + b.drop.n + '</b> y caminás ' + b.drop.w + ' min hasta la entrada.</p>' +
      '</div>' +
    '</div>' +
    alternativesHTML;
}

// ===== MAPA (Leaflet + OSRM) =====
const map = L.map("map", { scrollWheelZoom: false }).setView(CENTER, 14);
const tiles = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 19,
  attribution: "Tiles &copy; Esri"
}).addTo(map);

const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 19,
  attribution: "Tiles &copy; Esri"
});

L.control.layers({ "Calles": tiles, "OpenStreetMap": osm, "Satélite": sat }, null, { position: "topright" }).addTo(map);

let tileErrors = 0;
tiles.on("tileerror", () => { if (++tileErrors >= 3) $("mapmsg").hidden = false; });
tiles.on("tileload", () => { $("mapmsg").hidden = true; });

async function roadPath(line) {
  const pts = line.stops.map(p => STOPS[p.n]);
  const url = "https://router.project-osrm.org/route/v1/driving/" + pts.map(c => c[1] + "," + c[0]).join(";") + "?overview=full&geometries=geojson";
  try {
    const j = await (await fetch(url)).json();
    if (j.code === "Ok") return j.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
  } catch (e) {}
  return pts;
}

const lineLayers = {}, stopMarkers = {}, schoolMarkers = {};
let me = null;

function drawLines() {
  LINES.forEach(l => {
    const pts = l.stops.map(p => STOPS[p.n]);
    if (lineLayers[l.c]) lineLayers[l.c].setLatLngs(pts);
    else lineLayers[l.c] = L.polyline(pts, { color: COL[l.c], weight: 4, opacity: 0.85 }).addTo(map);
    roadPath(l).then(path => lineLayers[l.c].setLatLngs(path));
  });
}
drawLines();

function addStop(n) {
  const style = SERVED.has(n)
    ? { radius: 7, color: "#0F172A", weight: 3, fillColor: "#fff", fillOpacity: 1 }
    : { radius: 5, color: "#64748B", weight: 2, fillColor: "#fff", fillOpacity: 1 };
  stopMarkers[n] = L.circleMarker(STOPS[n], style)
    .addTo(map)
    .bindTooltip(esc(n) + (APPROX.has(n) ? " (ubicación aproximada)" : ""))
    .on("click", () => { $("origen").value = n; render(); });
}

const sqIcon = on => L.divIcon({
  className: "",
  html: '<div class="sq' + (on ? ' on' : '') + '"></div>',
  iconSize: [20, 20]
});

function addSchool(s) {
  schoolMarkers[s.id] = L.marker(s.pos, { icon: sqIcon(false), title: s.n })
    .addTo(map)
    .bindTooltip(esc(s.n) + (s.approx ? " (ubicación aproximada)" : ""))
    .on("click", () => { $("cole").value = s.id; fillTurnos(); render(); });
}

Object.keys(STOPS).forEach(addStop);
SCHOOLS.forEach(addSchool);

function drawMap(s, r) {
  const best = r && r.best;
  const route = best ? best.line.stops.slice(best.i, best.j + 1).map(p => p.n) : [];
  LINES.forEach(l => {
    const on = !best || best.line === l;
    lineLayers[l.c].setStyle({ weight: best && on ? 7 : 4, opacity: on ? 0.92 : 0.22 });
  });
  Object.keys(stopMarkers).forEach(n => {
    const on = n === s.origin;
    stopMarkers[n].setStyle({ fillColor: on ? "#FACC15" : "#fff" });
    stopMarkers[n].setRadius(on ? 11 : route.includes(n) ? 9 : SERVED.has(n) ? 7 : 5);
  });
  SCHOOLS.forEach(sc => schoolMarkers[sc.id].setIcon(sqIcon(sc.id === s.school)));
  const school = SCHOOLS.find(sc => sc.id === s.school);
  if (best && school) {
    map.fitBounds(L.latLngBounds(route.map(n => STOPS[n]).concat([school.pos])).pad(0.3));
  }
}

// ===== UBICACIÓN GPS =====
function dist(a, b) {
  const R = 6371000, t = Math.PI / 180, dLa = (b[0] - a[0]) * t, dLo = (b[1] - a[1]) * t;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * t) * Math.cos(b[0] * t) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function useLocation() {
  const msg = t => { $("geoMsg").textContent = t; };
  if (!navigator.geolocation) {
    msg("Tu navegador no permite usar la ubicación.");
    return;
  }
  msg("Buscando tu ubicación…");
  navigator.geolocation.getCurrentPosition(p => {
    const pos = [p.coords.latitude, p.coords.longitude];
    let near = null;
    Object.keys(STOPS).forEach(n => {
      const d = dist(pos, STOPS[n]);
      if (!near || d < near.d) near = { n, d };
    });
    if (me) me.remove();
    me = L.circleMarker(pos, { radius: 8, color: "#fff", weight: 3, fillColor: "#2563EB", fillOpacity: 1 })
      .addTo(map)
      .bindTooltip("Tu ubicación");
    $("origen").value = near.n;
    msg("Parada más cercana: " + near.n + " (" + Math.round(near.d) + " m · ~" + Math.max(1, Math.round(near.d / 80)) + " min caminando)." +
      (near.d > 3000 ? " Estás lejos de Puerto Iguazú." : ""));
    render();
  }, () => msg("No pude obtener tu ubicación. Revisá el permiso del navegador."), { timeout: 10000 });
}

// ===== ASISTENTE INTELIGENTE =====
const say = t => { $("say").textContent = t; };

function localIntent(t) {
  const n = norm(t);
  let origin = null, bestLen = 0;
  Object.keys(STOPS).forEach(s => {
    [norm(s), ...(ALIASES[s] || [])].forEach(k => {
      if (n.includes(k) && k.length > bestLen) { origin = s; bestLen = k.length; }
    });
  });
  const sc = SCHOOLS.find(s => s.k.some(k => n.includes(k)));
  return {
    origin,
    school: sc ? sc.id : null,
    shift: n.includes("manana") ? "manana" : n.includes("tarde") ? "tarde" : null,
    day: n.includes("sabado") ? "sab" : n.includes("domingo") ? "dom" : null
  };
}

async function aiIntent(text, key) {
  const system = "Extraé la intención del usuario para una app de colectivos escolares. Respondé SOLO un JSON con las claves origin, school, shift y day, sin texto extra. " +
    "origin: uno de " + JSON.stringify(Object.keys(STOPS)) + " o null. " +
    "school: el id de uno de " + JSON.stringify(SCHOOLS.map(s => ({ id: s.id, n: s.n }))) + " o null. " +
    'shift: "manana", "tarde" o null. day: "sem", "sab", "dom" o null. Si algo no se menciona, usá null; no inventes datos.';
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 200, system, messages: [{ role: "user", content: text }] })
  });
  const j = await res.json();
  if (!res.ok) throw new Error((j.error && j.error.message) || "error " + res.status);
  const raw = j.content.map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
  return JSON.parse(raw);
}

function applyIntent(it, via) {
  if (it.origin && STOPS[it.origin]) $("origen").value = it.origin;
  if (it.school && SCHOOLS.some(s => s.id === it.school)) {
    $("cole").value = it.school;
    fillTurnos();
  }
  if (it.day && DAYS[it.day]) $("dia").value = it.day;
  const sc = SCHOOLS.find(s => s.id === $("cole").value);
  if (sc && it.shift) {
    const e = sc.entries.find(x => it.shift === "manana" ? toMin(x) < 720 : toMin(x) >= 720);
    if (e) $("turno").value = e;
  }
  const miss = [];
  if (!$("origen").value) miss.push("la parada");
  if (!$("cole").value) miss.push("el colegio");
  render();
  say(miss.length ? "Falta elegir " + miss.join(" y ") + "." : "Ruta actualizada (" + via + ").");
}

async function ask() {
  const t = $("q").value.trim(), key = $("key").value.trim();
  if (!t) {
    say("Escribí tu consulta arriba.");
    return;
  }
  let it = null, via = "reglas locales";
  if (key) {
    say("Consultando a Claude…");
    try {
      it = await aiIntent(t, key);
      via = "Claude AI";
    } catch (e) {
      via = "reglas locales (error API)";
    }
  }
  applyIntent(it || localIntent(t), via);
}

// ===== DATOS REALES (OpenStreetMap / Overpass) =====
const BBOX = "-25.70,-54.66,-25.52,-54.48";
async function fetchOSM() {
  try {
    const c = JSON.parse(localStorage.getItem("osm_v3") || "null");
    if (c && Date.now() - c.t < 7 * 864e5) return c.d;
  } catch (e) {}
  const body = a => '[out:json][timeout:25];' + a + '(nwr["amenity"="school"](area.z)(' + BBOX + ');nwr["highway"="bus_stop"]["name"](area.z)(' + BBOX + '););out center tags;';
  const queries = [
    body('area["boundary"="administrative"]["name"="Puerto Iguazú"]->.z;'),
    body('area["ISO3166-1"="AR"][admin_level=2]->.z;')
  ];
  for (const q of queries) {
    for (const url of ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]) {
      try {
        const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(q) });
        if (!r.ok) continue;
        const d = (await r.json()).elements;
        if (!d || !d.length) break;
        try { localStorage.setItem("osm_v3", JSON.stringify({ t: Date.now(), d })); } catch (e) {}
        return d;
      } catch (e) {}
    }
  }
  return null;
}

function applyOSM(els) {
  const nName = s => norm(s).replace(/\./g, "").replace(/\bn[°º]?\s*(?=\d)/g, "").replace(/\s+/g, " ").trim();
  const rx = k => new RegExp("(^|\\s)" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(\\s|$)");
  const used = new Set(), seen = [];
  let ns = 0, nb = 0;
  els.forEach(el => {
    const t = el.tags || {};
    if (!t.name) return;
    const pos = el.lat != null ? [el.lat, el.lon] : el.center ? [el.center.lat, el.center.lon] : null;
    if (!pos) return;
    const uid = "osm" + el.type + el.id;
    if (t.amenity === "school") {
      const nn = nName(t.name);
      const sc = SCHOOLS.find(x => !used.has(x.id) && !x.osm &&
        x.k.some(k => (/\d/.test(k) || k.includes(" ")) && rx(k).test(nn)));
      if (sc) {
        used.add(sc.id); sc.pos = pos; sc.approx = false;
        schoolMarkers[sc.id].setLatLng(pos).setTooltipContent(esc(sc.n));
      } else if (!SCHOOLS.some(x => x.id === uid)) {
        const n = { id: uid, n: t.name.trim(), pos, entries: [], k: [nn], osm: true, approx: false };
        SCHOOLS.push(n); addSchool(n); ns++;
      }
    } else if (t.highway === "bus_stop") {
      const name = t.name.trim(), nk = norm(name);
      const ex = Object.keys(STOPS).find(n => norm(n) === nk);
      if (ex && APPROX.has(ex)) {
        STOPS[ex] = pos; APPROX.delete(ex);
        stopMarkers[ex].setLatLng(pos).setTooltipContent(esc(ex));
        seen.push({ nk, pos });
        return;
      }
      if (seen.some(a => a.nk === nk && dist(a.pos, pos) < 150)) return;
      let fin = name, c = 2;
      while (STOPS[fin]) fin = name + " (" + c++ + ")";
      STOPS[fin] = pos; seen.push({ nk, pos }); addStop(fin); nb++;
    }
  });
  return { ns, nb };
}

async function loadOSM() {
  say("Cargando colegios y paradas reales…");
  const els = await fetchOSM();
  if (!els) { say("No pude cargar OpenStreetMap: se muestran solo datos locales (aproximados)."); return; }
  const r = applyOSM(els);
  fillSelects(); refreshLists(); drawLines(); render();
  say("Listo: " + SCHOOLS.length + " colegios y " + Object.keys(STOPS).length + " paradas (" + r.ns + " colegios y " + r.nb + " paradas nuevas).");
}

function renderNoSchedule(s, sc) {
  const near = Object.keys(STOPS).map(n => ({ n, d: dist(STOPS[n], sc.pos) })).sort((a, b) => a.d - b.d).slice(0, 3);
  const li = near.map(x => '<div class="alt"><div><b>' + esc(x.n) + '</b></div><div class="alt-time">' + Math.round(x.d) +
    ' m<small>~' + Math.max(1, Math.round(x.d / 80)) + ' min caminando</small></div></div>').join("");
  const walk = s.origin ? '<p class="walk-note">🚶 Desde ' + esc(s.origin) + ' hasta el colegio hay ' + Math.round(dist(STOPS[s.origin], sc.pos)) + ' m en línea recta.</p>' : "";
  $("out").innerHTML = '<div class="best"><div class="body"><p style="margin:0 0 6px"><b>' + esc(sc.n) +
    '</b></p><p class="hint" style="margin:0">Todavía no hay horarios de entrada ni líneas cargadas para este colegio.</p></div></div>' +
    '<h2>Paradas más cercanas al colegio</h2><div class="alt-list">' + li + '</div>' + walk;
}

function fillSelects() {
  const o = $("origen").value, c = $("cole").value;
  const byName = (a, b) => a.localeCompare(b, "es");
  const names = Object.keys(STOPS).sort(byName);
  const opt = n => "<option>" + esc(n) + "</option>";
  $("origen").innerHTML = '<option value="">Elegí una parada…</option>' +
    '<optgroup label="Con horarios">' + names.filter(n => SERVED.has(n)).map(opt).join("") + "</optgroup>" +
    '<optgroup label="Otras paradas">' + names.filter(n => !SERVED.has(n)).map(opt).join("") + "</optgroup>";
  const so = x => '<option value="' + x.id + '">' + esc(x.n) + "</option>";
  const sorted = SCHOOLS.slice().sort((a, b) => byName(a.n, b.n));
  $("cole").innerHTML = '<option value="">Elegí un colegio…</option>' +
    '<optgroup label="Con horarios">' + sorted.filter(x => x.entries.length).map(so).join("") + "</optgroup>" +
    '<optgroup label="Sin horarios cargados">' + sorted.filter(x => !x.entries.length).map(so).join("") + "</optgroup>";
  $("origen").value = o; $("cole").value = c;
}

// ===== INICIO =====
function fillTurnos() {
  const sc = SCHOOLS.find(s => s.id === $("cole").value);
  const t = $("turno");
  if (!sc) t.innerHTML = '<option value="">Elegí un colegio primero</option>';
  else if (!sc.entries.length) t.innerHTML = '<option value="">Sin horarios cargados</option>';
  else t.innerHTML = sc.entries.map(e => "<option>" + e + "</option>").join("");
  t.disabled = !sc || !sc.entries.length;
}

function render() {
  const s = sel();
  const sch = SCHOOLS.find(x => x.id === s.school);
  if (sch && !sch.entries.length) {
    renderNoSchedule(s, sch);
    drawMap(s, null);
    map.setView(sch.pos, 16);
    return;
  }
  const r = s.origin && s.school && s.entry ? findOptions(s.origin, s.school, s.entry, s.day) : null;
  renderList(s, r);
  drawMap(s, r);
}

function init() {
  setupUIControls();
  fillSelects();
  $("dia").innerHTML = Object.keys(DAYS).map(d => '<option value="' + d + '">' + DAYS[d] + "</option>").join("");
  $("dia").value = dayNow();
  fillTurnos();
  $("origen").addEventListener("change", render);
  $("cole").addEventListener("change", () => { fillTurnos(); render(); });
  $("turno").addEventListener("change", render);
  $("dia").addEventListener("change", render);
  $("geo").addEventListener("click", useLocation);
  $("ask").addEventListener("click", ask);
  $("q").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  });
  window.addEventListener("resize", () => map.invalidateSize());
  render();
  loadOSM();
}

init();