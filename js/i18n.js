'use strict';
/* =========================================================
   Çoklu dil
   - Sayfanın dili <html lang="xx"> ile belirlenir (/, /en/, /es/ …).
   - Çeviriler lang/xx.js içinde window.I18N = { 'Türkçe metin': 'çeviri', … } olarak durur
     ve bu dosyadan ÖNCE yüklenir. Türkçe sayfada sözlük yoktur, metin olduğu gibi kalır.
   - T('metin')  ya da  T`metin ${x}` : şablonlarda değişkenler {0}, {1} … ile eşleşir.
   ========================================================= */
const LANGS = [
  { c: 'tr', n: 'Türkçe', l: 'tr-TR' }, { c: 'en', n: 'English', l: 'en-US' }, { c: 'zh', n: '中文', l: 'zh-CN' },
  { c: 'hi', n: 'हिन्दी', l: 'hi-IN' }, { c: 'es', n: 'Español', l: 'es-ES' }, { c: 'ar', n: 'العربية', l: 'ar-SA', rtl: true },
  { c: 'fr', n: 'Français', l: 'fr-FR' }, { c: 'bn', n: 'বাংলা', l: 'bn-BD' }, { c: 'pt', n: 'Português', l: 'pt-BR' },
  { c: 'ru', n: 'Русский', l: 'ru-RU' }, { c: 'ur', n: 'اردو', l: 'ur-PK', rtl: true }
];
const LANG = ((document.documentElement.lang || 'tr').slice(0, 2).toLowerCase());
const LOCALE = (LANGS.find(x => x.c === LANG) || LANGS[0]).l;
function T(s, ...v) {
  const D = window.I18N;
  if (typeof s === 'string') return D && typeof D[s] === 'string' ? D[s] : s;
  if (!D) { let o = s[0]; for (let i = 1; i < s.length; i++) o += v[i - 1] + s[i]; return o; }
  let key = s[0]; for (let i = 1; i < s.length; i++) key += '{' + (i - 1) + '}' + s[i];
  const tr = D[key];
  if (typeof tr !== 'string') { let o = s[0]; for (let i = 1; i < s.length; i++) o += v[i - 1] + s[i]; return o; }
  return tr.replace(/\{(\d+)\}/g, (m, i) => (v[i] !== undefined ? v[i] : m));
}
const langUrl = c => (c === 'tr' ? '/' : '/' + c + '/');
// Ondalık ayraç: Türkçe, İspanyolca, Fransızca, Portekizce, Rusça virgül; diğerleri nokta
const DECSEP = ['tr', 'es', 'fr', 'pt', 'ru'].includes(LANG) ? ',' : '.';
if (LANGS.find(x => x.c === LANG && x.rtl)) document.documentElement.dir = 'rtl';
