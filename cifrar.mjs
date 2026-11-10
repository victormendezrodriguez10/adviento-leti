// Cifra sorpresas.json y genera sorpresas.enc.js, que es lo único que se sube al repositorio.
// Uso (PowerShell):  $env:ADVIENTO_USUARIO='USUARIO'; $env:ADVIENTO_CLAVE='CLAVE'; node cifrar.mjs
// Uso (bash):        ADVIENTO_USUARIO=USUARIO ADVIENTO_CLAVE=CLAVE node cifrar.mjs
import { webcrypto as crypto } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const usuario = (process.env.ADVIENTO_USUARIO || '').trim().toUpperCase();
const clave = process.env.ADVIENTO_CLAVE || '';
if (!usuario || !clave) {
  console.error('Define las variables de entorno ADVIENTO_USUARIO y ADVIENTO_CLAVE antes de ejecutar.');
  process.exit(1);
}

const sorpresas = JSON.parse(readFileSync(new URL('./sorpresas.json', import.meta.url), 'utf8'));
const iteraciones = 300000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));

const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(usuario + '\n' + clave), 'PBKDF2', false, ['deriveKey']);
const llave = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: iteraciones, hash: 'SHA-256' },
  material, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const datos = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, llave, new TextEncoder().encode(JSON.stringify(sorpresas))));

const b64 = (u) => Buffer.from(u).toString('base64');
const salida = { iteraciones, salt: b64(salt), iv: b64(iv), datos: b64(datos) };
writeFileSync(new URL('./sorpresas.enc.js', import.meta.url), 'window.SORPRESAS_CIFRADAS=' + JSON.stringify(salida) + ';\n');
console.log('sorpresas.enc.js generado con ' + sorpresas.length + ' sorpresas.');
