# Adviento de Leti

Calendario de adviento sorpresa en forma de web app: 31 puertas, una por cada día de diciembre. Cada puerta se desbloquea en su fecha a las 07:00 según el reloj del móvil (ajustable en `CONFIG.hora` de `index.html`) y, al abrirla, muestra un plan para los dos. El 25 es el regalo de Navidad y el 31, Nochevieja.

La página pide usuario y contraseña. Las sorpresas están cifradas en `sorpresas.enc.js` con una clave derivada del usuario y la contraseña (PBKDF2 + AES-GCM), así que ni la contraseña ni las sorpresas aparecen en este repositorio.

## Archivos

- `index.html`: la app completa (pantalla de acceso, calendario, puertas y tarjetas).
- `sorpresas.enc.js`: las sorpresas cifradas. Es lo que carga la web.
- `cifrar.mjs`: script que genera `sorpresas.enc.js` a partir de `sorpresas.json`.
- `sorpresas.json`: las sorpresas en claro. Está en `.gitignore` y solo existe en local.

## Cambiar las sorpresas o la contraseña

1. Edita `sorpresas.json` (icono, título y texto de cada día).
2. Ejecuta el cifrado con el usuario y la contraseña como variables de entorno. En PowerShell:

   ```powershell
   $env:ADVIENTO_USUARIO='USUARIO'; $env:ADVIENTO_CLAVE='CONTRASEÑA'; node cifrar.mjs
   ```

3. Haz commit y push de `sorpresas.enc.js`. GitHub Pages se actualiza en uno o dos minutos.

## Modo prueba

Una vez dentro, abre la página con `#prueba` al final de la dirección o mantén pulsado el título durante un segundo para desbloquear todas las puertas. Dentro hay un botón para volver a cerrarlas.
