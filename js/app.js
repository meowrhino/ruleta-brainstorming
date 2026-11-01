const RUEDAS = ["conflicto", "estilo", "sujeto"];
const CLAVE = "ruleta.textos";
const BORRADOR = "ruleta.borrador";
let ternaFijada = null; // la terna con la que empezaste a escribir: girar después no la cambia
const $ = (s) => document.querySelector(s);
const columnas = [];

async function cargar() {
  for (const nombre of RUEDAS) {
    const palabras = await (await fetch(`data/${nombre}.json`)).json();
    columnas.push(montar(nombre, palabras));
  }
  columnas.forEach((c) => girarA(c, Math.floor(Math.random() * c.items.length), false));
  recuperarBorrador();
  pintarArchivo();
}

function montar(nombre, palabras) {
  const rueda = document.createElement("div");
  rueda.className = "rueda";
  rueda.style.setProperty("--tinta", `var(--c-${nombre})`);
  rueda.append(Object.assign(document.createElement("span"), { className: "nombre", textContent: nombre }));
  const lista = document.createElement("ul");
  lista.className = "lista";
  lista.setAttribute("aria-label", nombre);
  for (const p of palabras) {
    const li = document.createElement("li");
    // el texto va en un span: si se transforma el li, el tambor agranda el scroll de la lista y la tirada no llega
    li.append(Object.assign(document.createElement("span"), { textContent: p }));
    li.addEventListener("click", () => girarA(col, col.items.indexOf(li), true));
    lista.append(li);
  }
  const candado = document.createElement("button");
  candado.type = "button";
  candado.className = "candado";
  candado.textContent = "○ libre";
  candado.setAttribute("aria-pressed", "false");
  candado.addEventListener("click", () => {
    col.cerrada = !col.cerrada;
    candado.classList.toggle("cerrado", col.cerrada);
    candado.setAttribute("aria-pressed", String(col.cerrada));
    candado.textContent = col.cerrada ? "● fija" : "○ libre";
  });
  rueda.append(lista, candado);
  $("#ruedas").append(rueda);
  const col = { nombre, lista, items: [...lista.children], cerrada: false, sel: 0 };
  lista.addEventListener("scroll", pedirPintado, { passive: true });
  return col;
}

// un solo frame para las tres: si dos ruedas se mueven a la vez, ninguna se queda sin pintar
let pendiente = false;
function pedirPintado() {
  if (pendiente) return;
  pendiente = true;
  requestAnimationFrame(() => { pendiente = false; columnas.forEach(pintarColumna); });
}

function pintarColumna(col) {
  const centro = col.lista.scrollTop + col.lista.clientHeight / 2;
  let mejor = 0, mejorD = Infinity;
  col.items.forEach((li, i) => {
    const d = (li.offsetTop + li.offsetHeight / 2 - centro) / li.offsetHeight;
    // tambor: las filas lejanas se aplastan y se apagan, como en un rodillo
    const k = Math.min(1, Math.abs(d) / 7);
    li.firstChild.style.transform = `scaleY(${1 - k * 0.55})`;
    li.style.opacity = 1 - k * 0.75;
    const ad = Math.abs(d);
    if (ad < mejorD) { mejorD = ad; mejor = i; }
  });
  col.items.forEach((li, i) => li.classList.toggle("sel", i === mejor));
  col.sel = mejor;
  pintarTerna();
}

function girarA(col, i, suave) {
  const li = col.items[i];
  col.lista.scrollTo({ top: li.offsetTop - (col.lista.clientHeight - li.offsetHeight) / 2, behavior: suave ? "smooth" : "instant" });
  pintarColumna(col);
}

function tirar() {
  columnas.filter((c) => !c.cerrada).forEach((c) => girarA(c, Math.floor(Math.random() * c.items.length), true));
}

function ternaRuedas() { return columnas.map((c) => c.items[c.sel].textContent); }
function terna() { return ternaFijada || ternaRuedas(); }

function pintarTerna() {
  $("#terna").replaceChildren(...terna().map((t) => Object.assign(document.createElement("span"), { textContent: t })));
}

function alEscribir() {
  const texto = $("#texto").value;
  if (texto && !ternaFijada) ternaFijada = ternaRuedas();
  if (!texto) ternaFijada = null;
  localStorage.setItem(BORRADOR, JSON.stringify({ terna: ternaFijada, texto }));
  pintarTerna();
}

function recuperarBorrador() {
  try {
    const b = JSON.parse(localStorage.getItem(BORRADOR));
    if (b?.texto) { $("#texto").value = b.texto; ternaFijada = b.terna; pintarTerna(); }
  } catch {}
}

function leer() { try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; } }

function guardar() {
  const texto = $("#texto").value.trim();
  if (!texto) return;
  const textos = leer();
  textos.unshift({ fecha: new Date().toISOString(), terna: terna(), texto });
  localStorage.setItem(CLAVE, JSON.stringify(textos));
  localStorage.removeItem(BORRADOR);
  $("#texto").value = "";
  ternaFijada = null;
  pintarTerna();
  pintarArchivo();
}

function borrar(fecha) {
  if (!confirm("¿Borrar este texto? No se puede deshacer.")) return;
  localStorage.setItem(CLAVE, JSON.stringify(leer().filter((t) => t.fecha !== fecha)));
  pintarArchivo();
}

// todo el archivo en un .md, del más antiguo al más nuevo
function descargar() {
  const md = leer().reverse().map((t) => `## ${t.terna.join(" / ")}\n\n_${new Date(t.fecha).toLocaleString("es")}_\n\n${t.texto}\n`).join("\n");
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([md], { type: "text/markdown" })), download: "ruleta.md" });
  a.click();
  URL.revokeObjectURL(a.href);
}

function pintarArchivo() {
  const textos = leer();
  $("#descargar").hidden = textos.length === 0;
  $("#archivo").replaceChildren(...textos.map((t) => {
    const a = document.createElement("article");
    const time = document.createElement("time");
    time.dateTime = t.fecha;
    time.textContent = new Date(t.fecha).toLocaleString("es");
    const h = document.createElement("strong");
    h.textContent = " " + t.terna.join(" / ");
    const p = document.createElement("p");
    p.textContent = t.texto;
    const b = Object.assign(document.createElement("button"), { type: "button", className: "borrar", textContent: "borrar" });
    b.addEventListener("click", () => borrar(t.fecha));
    a.append(time, h, p, b);
    return a;
  }));
}

// agitar el móvil = tirar (iOS pide permiso; se pide en el primer toque a "tirar")
let ultimaSacudida = 0;
function alMover(e) {
  const a = e.accelerationIncludingGravity;
  if (!a) return;
  const fuerza = Math.hypot(a.x, a.y, a.z);
  if (fuerza > 25 && Date.now() - ultimaSacudida > 1200) { ultimaSacudida = Date.now(); tirar(); }
}
function activarSacudida() {
  if (typeof DeviceMotionEvent?.requestPermission === "function") {
    DeviceMotionEvent.requestPermission().then((r) => r === "granted" && addEventListener("devicemotion", alMover)).catch(() => {});
  } else {
    addEventListener("devicemotion", alMover);
  }
}

$("#tirar").addEventListener("click", activarSacudida, { once: true });
$("#tirar").addEventListener("click", tirar);
$("#guardar").addEventListener("click", guardar);
$("#descargar").addEventListener("click", descargar);
$("#texto").addEventListener("input", alEscribir);
// ⌘/ctrl + enter guarda sin soltar el teclado
$("#texto").addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) guardar(); });
addEventListener("resize", () => columnas.forEach((c) => girarA(c, c.sel, false)));
cargar();
