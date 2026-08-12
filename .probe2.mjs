import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { writeFileSync, appendFileSync } from 'node:fs';

const CHROME = 'C:/Users/acer/AppData/Local/ms-playwright/chromium-1232/chrome-win64/chrome.exe';
const dbg = (m) => appendFileSync('D:/app-web/.probe2-debug.log', m + '\n');
const ans = (m) => appendFileSync('D:/app-web/.probe2-result.txt', m + '\n');
writeFileSync('D:/app-web/.probe2-debug.log', 'START\n');
writeFileSync('D:/app-web/.probe2-result.txt', 'STARTING\n');

function makeFrame(payload) {
  const d = Buffer.from(payload);
  const mk = Buffer.from([Math.random() * 255 | 0, Math.random() * 255 | 0, Math.random() * 255 | 0, Math.random() * 255 | 0]);
  for (let i = 0; i < d.length; i++) d[i] ^= mk[i % 4];
  const n = d.length;
  const hdr = [0x81];
  if (n < 126) hdr.push(0x80 | n);
  else if (n < 65536) { hdr.push(0x80 | 126); hdr.push((n >> 8) & 0xff, n & 0xff); }
  else { hdr.push(0x80 | 127); for (let b = 7; b >= 0; b--) hdr.push((n >>> (b * 8)) & 0xff); }
  hdr.push(...mk);
  return Buffer.concat([Buffer.from(hdr), d]);
}

function parseFrames(buf, cb) {
  let i = 0;
  while (i + 2 <= buf.length) {
    const op = buf[i] & 0x0f;
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

function httpGet(port, p) {
  return new Promise((res, rej) => {
    const req = http.get({ host: '127.0.0.1', port, path: p }, (r) => {
      let d = ''; r.on('data', (c) => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    });
    req.on('error', rej); req.setTimeout(6000, () => { req.destroy(); rej(new Error('http-timeout')); });
  });
}

async function waitForWs(port, tries = 25) {
  for (let i = 0; i < tries; i++) {
    try {
      const list = await httpGet(port, '/json/list');
      const t = list.find((x) => x.webSocketDebuggerUrl);
      if (t) { dbg('found target ' + (t.url || '').slice(0, 80)); return t.webSocketDebuggerUrl; }
    } catch (e) { dbg('tgerr ' + e.message); }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('no target');
}

function cdpEval(wsUrl, expr, ms = 20000) {
  return new Promise((resolve, reject) => {
    const m = wsUrl.match(/^wss?:\/\/([^:]+):(\d+)(.*)$/);
    const host = m[1], port = +m[2], path = m[3];
    const id = 1;
    const msg = JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } });
    const key = Buffer.from('cdp-' + Date.now()).toString('base64');
    const sock = net.connect(port, host);
    let buf = Buffer.alloc(0), hs = false, done = false;
    const to = setTimeout(() => { if (!done) { done = true; sock.destroy(); reject(new Error('cdp-timeout')); } }, ms);
    sock.on('error', (e) => { if (!done) { done = true; reject(e); } });
    sock.on('connect', () => {
      sock.write('GET ' + path + ' HTTP/1.1\r\nHost: ' + host + ':' + port + '\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ' + key + '\r\nSec-WebSocket-Version: 13\r\n\r\n');
    });
    sock.on('data', (d) => {
      buf = Buffer.concat([buf, d]);
      if (!hs) { const k = buf.indexOf('\r\n\r\n'); if (k === -1) return; buf = buf.slice(k + 4); hs = true; }
      const used = parseFrames(buf, (t) => {
        try { const j = JSON.parse(t); dbg('recv id=' + j.id); if (j.id === id) { done = true; clearTimeout(to); sock.destroy(); resolve(j); } }
        catch (e) { /* ignore event frames */ }
      });
      buf = buf.slice(used);
    });
    setTimeout(() => { if (!done) sock.write(makeFrame(msg)); }, 1500);
  });
}

const PORT = 9345;
let cp = null;
try {
  dbg('launch chrome headless at 390x844');
  cp = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check', '--disable-dev-shm-usage', '--force-device-scale-factor=1', '--window-size=390,844', '--virtual-time-budget=12000', '--remote-debugging-port=' + PORT, 'http://localhost:3000/'], { windowsHidden: true, detached: true });
  dbg('pid=' + cp.pid);
  cp.on('error', (e) => dbg('err ' + e.message));
  const ws = await waitForWs(PORT);
  const expr = "JSON.stringify((function(){try{const it=document.querySelectorAll('.marquee-row > div');const row=document.querySelector('.marquee-row');const f=it[0];return{vw:Math.round(window.innerWidth),title:document.title,rowCount:document.querySelectorAll('.marquee-row').length,itemCount:it.length,first:f?{w:f.offsetWidth,h:f.offsetHeight,cls:f.getAttribute('class')}:null,body:(document.body.innerText||'').slice(0,120),rowHTML:row?row.outerHTML.slice(0,400):null};}catch(e){return{err:e.message};}})())";
  const r = await cdpEval(ws, expr);
  ans('RESULT: ' + JSON.stringify(r?.result?.result?.value || r));
} catch (e) {
  dbg('FATAL ' + (e?.stack || e));
  ans('ERROR: ' + (e?.message || e));
} finally {
  try { if (cp) cp.kill('SIGKILL'); } catch (_) {}
  setTimeout(() => process.exit(0), 400);
}
