const RUEDAS = ["conflicto", "estilo", "sujeto"];
const CLAVE = "ruleta.textos";
const $ = (s) => document.querySelector(s);
const columnas = [];

async function cargar() {
  for (const nombre of RUEDAS) {
    const palabras = await (await fetch(`data/${nombre}.json`)).json();
    columnas.push(montar(nombre, palabras));
  }
  columnas.forEach((c) => girarA(c, Math.floor(Math.random() * c.items.length), false));
  pintarArchivo();
}

function montar(nombre, palabras) {
  const rueda = document.createElement("div");
  rueda.className = "rueda";
  const lista = document.createElement("ul");
  lista.className = "lista";
  lista.setAttribute("aria-label", nombre);
  for (const p of palabras) {
    const li = document.createElement("li");
    // el texto va en un span: si se transforma el li, el arco agranda el scroll de la lista y la tirada no llega
    li.append(Object.assign(document.createElement("span"), { textContent: p }));
    li.addEventListener("click", () => girarA(col, col.items.indexOf(li), true));
    lista.append(li);
  }
  const candado = document.createElement("button");
  candado.type = "button";
  candado.className = "candado";
  candado.textContent = "○ libre";
  candado.addEventListener("click", () => {
    col.cerrada = !col.cerrada;
    candado.classList.toggle("cerrado", col.cerrada);
    candado.textContent = col.cerrada ? "● fija" : "○ libre";
  });
  rueda.append(lista, candado);
  $("#ruedas").append(rueda);
  const col = { nombre, lista, items: [...lista.children], cerrada: false, sel: 0 };
  lista.addEventListener("scroll", () => pedirPintado(col), { passive: true });
  return col;
}

let pendiente = false;
function pedirPintado(col) {
  if (pendiente) return;
  pendiente = true;
  requestAnimationFrame(() => { pendiente = false; pintarColumna(col); });
}

function pintarColumna(col) {
  const centro = col.lista.scrollTop + col.lista.clientHeight / 2;
  let mejor = 0, mejorD = Infinity;
  col.items.forEach((li, i) => {
    const d = (li.offsetTop + li.offsetHeight / 2 - centro) / li.offsetHeight;
    const k = Math.max(-9, Math.min(9, d));
    li.firstChild.style.transform = `rotate(${k * 3}deg) translateX(${k * k * 1.5}px)`;
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

function terna() { return columnas.map((c) => c.items[c.sel].textContent); }

function pintarTerna() {
  $("#terna").replaceChildren(...terna().map((t) => Object.assign(document.createElement("span"), { textContent: t })));
}

function leer() { try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; } }

function guardar() {
  const texto = $("#texto").value.trim();
  if (!texto) return;
  const textos = leer();
  textos.unshift({ fecha: new Date().toISOString(), terna: terna(), texto });
  localStorage.setItem(CLAVE, JSON.stringify(textos));
  $("#texto").value = "";
  pintarArchivo();
}

function pintarArchivo() {
  $("#archivo").replaceChildren(...leer().map((t) => {
    const a = document.createElement("article");
    const time = document.createElement("time");
    time.dateTime = t.fecha;
    time.textContent = new Date(t.fecha).toLocaleString("es");
    const h = document.createElement("strong");
    h.textContent = " " + t.terna.join(" / ");
    const p = document.createElement("p");
    p.textContent = t.texto;
    a.append(time, h, p);
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

$("#tirar").addEventListener("click", () => { activarSacudida(); tirar(); }, { once: true });
$("#tirar").addEventListener("click", tirar);
$("#guardar").addEventListener("click", guardar);
addEventListener("resize", () => columnas.forEach((c) => girarA(c, c.sel, false)));
cargar();
