// Cifra sorpresas.json (y las fotos o audios de la carpeta media/ que referencie) y genera
// sorpresas.enc.js, que es lo único que se sube al repositorio.
// Uso (PowerShell):  $env:ADVIENTO_USUARIO='USUARIO'; $env:ADVIENTO_CLAVE='CLAVE'; node cifrar.mjs
// Uso (bash):        ADVIENTO_USUARIO=USUARIO ADVIENTO_CLAVE=CLAVE node cifrar.mjs
import { webcrypto as crypto } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const usuario = (process.env.ADVIENTO_USUARIO || '').trim().toUpperCase();
const clave = process.env.ADVIENTO_CLAVE || '';
if (!usuario || !clave) {
  console.error('Define las variables de entorno ADVIENTO_USUARIO y ADVIENTO_CLAVE antes de ejecutar.');
  process.exit(1);
}

const MIME = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
  m4a: 'audio/mp4', mp3: 'audio/mpeg', ogg: 'audio/ogg', opus: 'audio/ogg', wav: 'audio/wav', aac: 'audio/aac', webm: 'audio/webm',
};
function dataUrl(nombre) {
  const ruta = new URL('./media/' + nombre, import.meta.url);
  if (!existsSync(ruta)) { console.error('No existe media/' + nombre); process.exit(1); }
  const ext = nombre.split('.').pop().toLowerCase();
  return 'data:' + (MIME[ext] || 'application/octet-stream') + ';base64,' + readFileSync(ruta).toString('base64');
}

const sorpresas = JSON.parse(readFileSync(new URL('./sorpresas.json', import.meta.url), 'utf8')).map((s) => ({
  ...s,
  ...(s.foto ? { foto: dataUrl(s.foto) } : {}),
  ...(s.audio ? { audio: dataUrl(s.audio) } : {}),
}));

const iteraciones = 300000;
// Se reutiliza la sal del archivo anterior (si existe) para que, al cambiar solo el contenido,
// la sesión recordada en el móvil siga siendo válida. Si cambias la contraseña, borra sorpresas.enc.js antes.
let salt = crypto.getRandomValues(new Uint8Array(16));
const rutaSalida = new URL('./sorpresas.enc.js', import.meta.url);
if (existsSync(rutaSalida)) {
  const previo = readFileSync(rutaSalida, 'utf8').match(/"salt":"([^"]+)"/);
  if (previo) salt = Uint8Array.from(Buffer.from(previo[1], 'base64'));
}
const iv = crypto.getRandomValues(new Uint8Array(12));

const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(usuario + '\n' + clave), 'PBKDF2', false, ['deriveKey']);
const llave = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: iteraciones, hash: 'SHA-256' },
  material, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const datos = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, llave, new TextEncoder().encode(JSON.stringify(sorpresas))));

const b64 = (u) => Buffer.from(u).toString('base64');
const salida = { iteraciones, salt: b64(salt), iv: b64(iv), datos: b64(datos) };
const texto = 'window.SORPRESAS_CIFRADAS=' + JSON.stringify(salida) + ';\n';
writeFileSync(rutaSalida, texto);
const mb = (texto.length / 1048576).toFixed(2);
console.log('sorpresas.enc.js generado con ' + sorpresas.length + ' sorpresas (' + mb + ' MB).');
if (texto.length > 8 * 1048576) console.warn('Aviso: el archivo pesa bastante. Reduce el tamaño de las fotos o audios.');
