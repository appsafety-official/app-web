import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { writeFileSync, appendFileSync, readFileSync } from 'node:fs';

const CHROME = 'C:/Users/acer/AppData/Local/ms-playwright/chromium-1232/chrome-win64/chrome.exe';
const dbg = (m) => appendFileSync('D:/app-web/.probe3b-debug.log', m + '\n');
const rlog = (m) => appendFileSync('D:/app-web/.probe3b-result.txt', m + '\n');
writeFileSync('D:/app-web/.probe3b-debug.log', 'START\n');
writeFileSync('D:/app-web/.probe3b-result.txt', 'STARTING\n');

const EXPR = readFileSync('D:/app-web/expr.js', 'utf8');

function mkFrame(s) {
  const d = Buffer.from(s);
  const mk = Buffer.from([Math.random() * 255 | 0, Math.random() * 255 | 0, Math.random() * 255 | 0, Math.random() * 255 | 0]);
  for (let i = 0; i < d.length; i++) d[i] ^= mk[i % 4];
  const n = d.length; const h = [0x81];
  if (n < 126) h.push(0x80 | n);
  else if (n < 65536) { h.push(0x80 | 126); h.push((n >> 8) & 0xff, n & 0xff); }
  else { h.push(0x80 | 127); for (let b = 7; b >= 0; b--) h.push((n >>> (b * 8)) & 0xff); }
  h.push(...mk);
  return Buffer.concat([Buffer.from(h), d]);
}
function parseFrames(buf, cb) {
  let i = 0;
  while (i + 2 <= buf.length) {
    const op = buf[i] & 0xf;
    let n = buf[i + 1] & 0x7f;
    let o = 2;
    if (n === 126) { n = buf.readUInt16BE(i + o); o += 2; }
    else if (n === 127) { n = Number(buf.readBigUInt64BE(i + o)); o += 8; }
    if (i + o + n > buf.length) break;
    if (op === 1) cb(buf.subarray(i + o, i + o + n).toString());
    i += o + n;
  }
  return i;
}
function httpGetJson(port, p) {
  return new Promise((res, rej) => {
    const req = http.get({ host: '127.0.0.1', port, path: p }, (r) => {
      let d = ''; r.on('data', (c) => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    });
    req.on('error', rej); req.setTimeout(6000, () => { req.destroy(); rej(new Error('http-timeout')); });
  });
}
async function waitWs(port, tries = 30) {
  for (let i = 0; i < tries; i++) {
    try {
      const list = await httpGetJson(port, '/json/list');
      const t = list.find((x) => (x.url && x.url.includes('localhost:3000') && x.webSocketDebuggerUrl)) ||
                list.find((x) => (x.type === 'page' && x.url && x.url.startsWith('http') && x.webSocketDebuggerUrl));
      if (t) { dbg('target=' + t.url); return t.webSocketDebuggerUrl; }
      dbg('list=' + JSON.stringify(list.map((x) => (x.url || '?').slice(0, 40))));
    } catch (e) { dbg('tgerr=' + e.message); }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('no target');
}

function cdpEval(wsUrl, expr, ms = 20000, delay = 3000) {
  return new Promise((resolve, reject) => {
    const m = wsUrl.match(/^wss?:\/\/([^:]+):(\d+)(.*)$/);
    const host = m[1], port = +m[2], path = m[3];
    const id = 1;
    const msg = JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } });
    const key = Buffer.from('x-' + Date.now()).toString('base64');
    const sock = net.connect(port, host);
    let buf = Buffer.alloc(0), hs = false, done = false;
    const to = setTimeout(() => { if (!done) { done = true; sock.destroy(); reject(new Error('cdp-timeout')); } }, ms + delay);
    sock.on('error', (e) => { if (!done) { done = true; reject(e); } });
    sock.on('connect', () => {
      sock.write('GET ' + path + ' HTTP/1.1\r\nHost: ' + host + ':' + port + '\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ' + key + '\r\nSec-WebSocket-Version: 13\r\n\r\n');
    });
    sock.on('data', (d) => {
      buf = Buffer.concat([buf, d]);
      if (!hs) { const k = buf.indexOf('\r\n\r\n'); if (k === -1) return; buf = buf.slice(k + 4); hs = true; }
      const used = parseFrames(buf, (t) => {
        try { const j = JSON.parse(t); dbg('recv id=' + j.id + ' hasRes=' + (!!j.result) + ' hasErr=' + (!!j.error)); if (j.id === id) { done = true; clearTimeout(to); sock.destroy(); resolve(j); } }
        catch (e) { /* ignore events */ }
      });
      buf = buf.slice(used);
    });
    setTimeout(() => { if (!done) sock.write(mkFrame(msg)); }, delay);
  });
}

const PORT = 9347;
let cp = null;
try {
  dbg('launch chrome 390x844');
  cp = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check', '--disable-dev-shm-usage', '--force-device-scale-factor=1', '--window-size=390,844', '--virtual-time-budget=15000', '--remote-debugging-port=' + PORT, 'http://localhost:3000/'], { windowsHidden: true, detached: true });
  dbg('pid=' + cp.pid);
  cp.on('error', (e) => dbg('err=' + e.message));
  const ws = await waitWs(PORT);
  const r = await cdpEval(ws, EXPR, 20000, 3000);
  const val = r?.result?.result?.value;
  rlog('DIMENSIONS: ' + JSON.stringify(val));
  if (r?.result?.result?.exceptionDetails) rlog('EXCEPTION: ' + JSON.stringify(r.result.result.exceptionDetails).slice(0, 400));
} catch (e) {
  dbg('FATAL=' + (e?.stack || e));
  rlog('ERROR=' + (e?.message || e));
} finally {
  try { if (cp) cp.kill('SIGKILL'); } catch (_) {}
  setTimeout(() => process.exit(0), 400);
}
