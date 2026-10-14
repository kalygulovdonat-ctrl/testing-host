/* ШАГ · крошечный сервер магазина: статика + JSON-база + загрузка фото.
   Без внешних зависимостей: нужен только Node.js 18+.
   Запуск: node server.js   (порт: переменная PORT, доступ: ADMIN_USER / ADMIN_PASS) */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';
const DB_FILE = path.join(ROOT, 'data', 'db.json');
const PHOTOS_DIR = path.join(ROOT, 'photos');
const PUBLIC_DIR = path.join(ROOT, 'public');
const MAX_BODY = 8 * 1024 * 1024;          // 8 МБ: вмещает фото до ~6 МБ в base64
const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // срок жизни входа: неделя

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

/* ── база данных (файл data/db.json) ─────────────────────── */
function loadDB() {
  try {
    const d = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (d && Array.isArray(d.prods)) {
      d.cats = Array.isArray(d.cats) ? d.cats : [];
      return d;
    }
  } catch (e) {}
  return { cats: [], prods: [] };
}
function persistDB() {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 1), 'utf8');
  fs.renameSync(tmp, DB_FILE);
}
function validDB(d) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.prods) || d.prods.length > 500) return false;
  if (!Array.isArray(d.cats) || d.cats.length > 60) return false;
  if (d.cats.some(c => typeof c !== 'string' || c.length > 60)) return false;
  return d.prods.every(p =>
    p && typeof p.id === 'string' && p.id.length <= 40 &&
    typeof p.n === 'string' && p.n.length <= 120 &&
    typeof p.b === 'string' && p.b.length <= 60 &&
    typeof p.cat === 'string' && p.cat.length <= 60 &&
    Number.isFinite(+p.p) && +p.p >= 0 && +p.p < 100000000 &&
    (!p.old || (Number.isFinite(+p.old) && +p.old >= 0)) &&
    (!p.sz || (Array.isArray(p.sz) && p.sz.length <= 30 && p.sz.every(s => Number.isInteger(+s)))) &&
    Array.isArray(p.colors) && p.colors.length >= 1 && p.colors.length <= 12 &&
    p.colors.every(c =>
      c && typeof c.n === 'string' && c.n.length <= 60 &&
      typeof c.h === 'string' && c.h.length <= 20 &&
      typeof c.img === 'string' && c.img.length <= 700000)
  );
}
let db = loadDB();

/* ── сессии и защита ─────────────────────────────────────── */
const tokens = new Map();
const tries = new Map();
function newToken() {
  const t = crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  tokens.set(t, now + TOKEN_TTL);
  for (const [k, v] of tokens) if (v < now) tokens.delete(k);
  return t;
}
function checkToken(t) { return Boolean(t) && tokens.has(t) && tokens.get(t) > Date.now(); }
function limited(ip) {
  const now = Date.now();
  let r = tries.get(ip);
  if (!r || now > r.reset) { r = { n: 0, reset: now + 10 * 60 * 1000 }; tries.set(ip, r); }
  r.n++;
  return r.n > 10;
}

/* ── утилиты запроса/ответа ──────────────────────────────── */
function readBody(req, cb) {
  let size = 0, done = false;
  const chunks = [];
  req.on('data', c => {
    size += c.length;
    if (size > MAX_BODY) { if (!done) { done = true; cb(new Error('large')); } req.destroy(); return; }
    chunks.push(c);
  });
  req.on('end', () => { if (!done) { done = true; cb(null, Buffer.concat(chunks)); } });
  req.on('error', () => { if (!done) { done = true; cb(new Error('read')); } });
}
function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
function serveFile(res, file) {
  fs.readFile(file, (err, buf) => {
    if (err) return json(res, 404, { error: 'not found' });
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
}
function safePath(dir, rel) {
  try {
    const p = path.normalize(path.join(dir, decodeURIComponent(rel)));
    return p === dir || p.startsWith(dir + path.sep) ? p : null;
  } catch (e) { return null; }
}

/* ── сервер ──────────────────────────────────────────────── */
const server = http.createServer((req, res) => {
  const u = (req.url || '/').split('?')[0];
  const ip = req.socket.remoteAddress || '?';

  if (req.method === 'GET' || req.method === 'HEAD') {
    if (u === '/api/db') return json(res, 200, { cats: db.cats, prods: db.prods });
    const rel = u === '/' ? '/index.html' : u;
    const isPhoto = rel.startsWith('/photos/');
    const file = safePath(isPhoto ? PHOTOS_DIR : PUBLIC_DIR, isPhoto ? rel.slice(7) : rel);
    if (!file) return json(res, 403, { error: 'forbidden' });
    return serveFile(res, file);
  }

  if (req.method === 'POST') {
    return readBody(req, (err, buf) => {
      if (err) return json(res, 413, { error: 'Слишком большой запрос' });
      let body;
      try { body = JSON.parse(buf.toString('utf8') || '{}'); }
      catch (e) { return json(res, 400, { error: 'Некорректный JSON' }); }

      if (u === '/api/login') {
        if (limited(ip)) return json(res, 429, { error: 'Много попыток входа: подождите 10 минут' });
        const okU = typeof body.u === 'string' && body.u.trim().toLowerCase() === ADMIN_USER;
        const okP = typeof body.p === 'string' && body.p === ADMIN_PASS;
        if (!okU || !okP) return json(res, 401, { error: 'Неверный логин или пароль' });
        return json(res, 200, { ok: true, auth: newToken() });
      }

      if (u === '/api/save-db') {
        if (!checkToken(req.headers['x-shag-auth'])) return json(res, 401, { error: 'Нужен вход администратора' });
        if (!validDB(body.db)) return json(res, 400, { error: 'Данные не прошли проверку' });
        db = { cats: body.db.cats, prods: body.db.prods };
        try { persistDB(); } catch (e) { return json(res, 500, { error: 'Не удалось записать базу' }); }
        return json(res, 200, { ok: true });
      }

      if (u === '/api/upload') {
        if (!checkToken(req.headers['x-shag-auth'])) return json(res, 401, { error: 'Нужен вход администратора' });
        const m = typeof body.data === 'string' && body.data.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
        if (!m) return json(res, 400, { error: 'Ожидалось фото в base64 (jpeg, png или webp)' });
        let buf;
        try { buf = Buffer.from(m[2], 'base64'); } catch (e) { return json(res, 400, { error: 'Повреждённое фото' }); }
        if (buf.length < 64 || buf.length > 6 * 1024 * 1024) return json(res, 400, { error: 'Размер фото не подходит' });
        const name = Date.now().toString(36) + crypto.randomBytes(4).toString('hex') + '.' + m[1];
        try {
          fs.mkdirSync(PHOTOS_DIR, { recursive: true });
          fs.writeFileSync(path.join(PHOTOS_DIR, name), buf);
        } catch (e) { return json(res, 500, { error: 'Не удалось сохранить фото' }); }
        return json(res, 200, { ok: true, url: '/photos/' + name });
      }

      return json(res, 404, { error: 'not found' });
    });
  }

  json(res, 405, { error: 'method not allowed' });
});

server.listen(PORT, () => {
  console.log('ШАГ: сервер запущен: http://localhost:' + PORT);
  console.log('Админка: кнопка «Войти», логин ' + ADMIN_USER + ' / пароль ' + ADMIN_PASS);
  console.log('База: ' + DB_FILE + '   Фото: ' + PHOTOS_DIR);
});
