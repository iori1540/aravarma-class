# Aravarma class · Unidad 1

Web de clase de español (HTML, CSS y JavaScript, sin librerías).

## Cómo abrirla en Visual Studio Code
1. Descomprime el zip y abre la carpeta con **File > Open Folder**.
2. Instala la extensión **Live Server** (Ritwick Dey).
3. Clic derecho en `index.html` > **Open with Live Server**.

También funciona con doble clic en `index.html`. Las fuentes de Google necesitan internet.

## Audio de la profesora
Guarda tu audio de "mariposa" como `audio/mariposa.mp3`. Si no existe, se usa la voz del navegador.

## Recortar el video de los sonidos (de la A a la Z)
En `index.html` busca `id="video-player"` y cambia `data-start` y `data-end` (en segundos).
Ejemplo: empieza en 1:02 y termina en 3:45 → `data-start="62" data-end="225"`.
El video solo se reproduce desde Live Server o desde la dirección de GitHub Pages, no con doble clic en el archivo.

## Cómo agregar una unidad nueva
1. En `index.html` copia un bloque `<article class="lesson" ...>` (por ejemplo BAS-03) y cámbiale el id, por ejemplo `lesson-bas-04`.
2. Agrega su botón en `<div class="tabs">` y su nombre (`bas-04`) en la lista `TABS` de `app.js`.
3. Crea sus actividades en `app.js` siguiendo el patrón de `initSD` o `initSustituye`, y llámalas en `initAll`.
