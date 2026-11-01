# ruleta

Una ruleta para ponerse a escribir, a la manera de The Brainstormer (Andrew Bosley / Tapnik): tres ruedas
(**conflicto** / **estilo o ambiente** / **sujeto o lugar**), una tirada, candados para fijar lo que te gusta,
y debajo una caja para escribir lo que salga. Lo escrito se guarda en el navegador con su terna y su fecha.

Web estática, sin build ni dependencias. Abrir `index.html` con cualquier servidor local
(`python3 -m http.server`) o publicar la rama `main` en GitHub Pages.

## Editar las palabras

Cada rueda es un archivo en `data/`: `conflicto.json`, `estilo.json`, `sujeto.json`.
Una lista de textos entre comillas, separados por comas. Para comprobar que están bien:

    node comprobar.mjs

## Lo que viene

1. **Palabras que se gastan**: cada palabra que uses con un texto guardado desaparece de su rueda.
2. **La terna del día**: `/hoy/`, la misma terna para todo el mundo, semilla por fecha.
3. **Sala con amigos**: cada uno rellena una rueda a ciegas y se comparte por enlace.

Las listas son propias, en castellano. El nombre y las ilustraciones de The Brainstormer no se usan.
