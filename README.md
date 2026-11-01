# ruleta

Una ruleta para ponerse a escribir, a la manera de The Brainstormer (Andrew Bosley / Tapnik): tres ruedas
(**conflicto** / **estilo o ambiente** / **sujeto o lugar**), una tirada, candados para fijar lo que te gusta,
y debajo una caja para escribir lo que salga.

## Cómo se guarda

- La terna se **fija al empezar a escribir**: girar las ruedas después no la cambia.
- Lo que escribes se guarda solo como borrador (`localStorage`); recargar no lo pierde.
- **guardar** (o ⌘/ctrl + enter) lo pasa al archivo con su terna y su fecha, y vacía la caja.
- Cada texto del archivo se puede **borrar**; **descargar todo (.md)** baja el archivo entero en Markdown.
- Todo vive en el navegador: otro navegador u otro aparato no lo ve, y borrar los datos del sitio lo borra.

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
