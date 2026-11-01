// node comprobar.mjs: las tres listas existen, son JSON y tienen palabras sin repetir
import { readFileSync } from "node:fs";
for (const n of ["conflicto", "estilo", "sujeto"]) {
  const l = JSON.parse(readFileSync(`data/${n}.json`, "utf8"));
  if (!Array.isArray(l) || l.length < 3) throw new Error(`data/${n}.json: hacen falta al menos 3 palabras`);
  if (new Set(l).size !== l.length) throw new Error(`data/${n}.json: hay palabras repetidas`);
  if (l.some((p) => typeof p !== "string" || !p.trim())) throw new Error(`data/${n}.json: cada palabra es un texto entre comillas`);
  console.log(`${n}: ${l.length} palabras, bien`);
}
