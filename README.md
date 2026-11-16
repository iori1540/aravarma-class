# Aravarma class · Unidad 1

Web de clase de español (HTML, CSS y JavaScript, sin librerías).

## Cómo abrirla en Visual Studio Code
1. Descomprime el zip y abre la carpeta con **File > Open Folder**.
2. Instala la extensión **Live Server** (Ritwick Dey).
3. Clic derecho en `index.html` > **Open with Live Server**.

También funciona con doble clic en `index.html`. Las fuentes de Google necesitan internet.

## Audio de la profesora
Guarda tu audio de "mariposa" como `audio/mariposa.mp3`. Si no existe, se usa la voz del navegador.

## Video de los sonidos (de la A a la Z)
El video ya está recortado y está en `video/sonido-letras.mp4` (empieza en la A y termina en la Z). Si quieres cambiarlo, reemplaza ese archivo por otro con el mismo nombre.

## Cómo agregar una unidad nueva
1. En `index.html` copia un bloque `<article class="lesson" ...>` (por ejemplo BAS-03) y cámbiale el id, por ejemplo `lesson-bas-04`.
2. Agrega su botón en `<div class="tabs">` y su nombre (`bas-04`) en la lista `TABS` de `app.js`.
3. Crea sus actividades en `app.js` siguiendo el patrón de `initSD` o `initSustituye`, y llámalas en `initAll`.
