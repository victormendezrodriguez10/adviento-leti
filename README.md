# Adviento de Leti

Calendario de adviento sorpresa en forma de web app: 31 puertas, una por cada día de diciembre. Cada puerta se desbloquea en su fecha a las 07:00 según el reloj del móvil (ajustable en `CONFIG.hora` de `index.html`) y, al abrirla, muestra un regalo para ella. El 25 es el regalo de Navidad y el 31, Nochevieja.

La página pide usuario y contraseña. Las sorpresas están cifradas en `sorpresas.enc.js` con una clave derivada del usuario y la contraseña (PBKDF2 + AES-GCM), así que ni la contraseña ni las sorpresas aparecen en este repositorio.

## Qué hace

- Puertas como regalos envueltos; confeti y cascabel al abrir (el sonido se activa con el botón de la cabecera).
- Cada sorpresa se puede **canjear**: queda con sello "canjeado" y fecha.
- Cada tarjeta termina con una **pista** del día siguiente.
- Saludo del día, contador hasta el regalo grande y estado de las puertas.
- Funciona **sin conexión** una vez abierta (service worker) y se puede añadir a la pantalla de inicio.
- **Avisos a las 07:00** si se activan en la cabecera. Solo suenan si la app está abierta o en segundo plano en ese momento; un aviso con la app cerrada necesitaría un servidor de notificaciones push.
- Soporta **fotos y notas de voz** en las tarjetas, cifradas igual que el texto.

## Archivos

- `index.html`: la app completa.
- `sw.js`: service worker para el modo sin conexión y los avisos.
- `sorpresas.enc.js`: las sorpresas cifradas. Es lo que carga la web.
- `cifrar.mjs`: script que genera `sorpresas.enc.js` a partir de `sorpresas.json` y la carpeta `media/`.
- `sorpresas.json` y `media/`: contenido en claro. Están en `.gitignore` y solo existen en local.

## Cambiar las sorpresas, añadir fotos o audio, o cambiar la contraseña

1. Edita `sorpresas.json`. Campos por día: `icono`, `titulo`, `texto`, `pista` (pista del día siguiente), `fuera` (true si es plan de salir), y opcionalmente `foto` y `audio` con el nombre de un archivo dentro de la carpeta `media/` (por ejemplo `"foto": "nosotros.jpg"`, `"audio": "nota.m4a"`). Fotos de menos de 500 KB y audios cortos; todo acaba dentro del archivo cifrado.
2. Ejecuta el cifrado con el usuario y la contraseña como variables de entorno. En PowerShell:

   ```powershell
   $env:ADVIENTO_USUARIO='USUARIO'; $env:ADVIENTO_CLAVE='CONTRASEÑA'; node cifrar.mjs
   ```

3. Haz commit y push de `sorpresas.enc.js`. GitHub Pages se actualiza en uno o dos minutos.

## Modo prueba

Una vez dentro, abre la página con `#prueba` al final de la dirección o mantén pulsado el título durante un segundo para desbloquear todas las puertas. Dentro hay un botón para volver a cerrarlas.
