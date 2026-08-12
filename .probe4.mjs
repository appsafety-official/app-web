import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { writeFileSync, appendFileSync, readFileSync } from 'node:fs';

const CHROME = 'C:/Users/acer/AppData/Local/ms-playwright/chromium-1232/chrome-win64/chrome.exe';
const dbg = (m) => appendFileSync('D:/app-web/.probe4-debug.log', m + '\n');
const rlog = (m) => appendFileSync('D:/app-web/.probe4-result.txt', m + '\n');
writeFileSync('D:/app-web/.probe4-debug.log', 'START\n');
writeFileSync('D:/app-web/.probe4-result.txt', 'STARTING\n');

const EXPR = readFileSync('D:/app-web/expr.js', 'utf8');
const UA_MOBILE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

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
async function waitWs(port, tries = 35) {
  for (let i = 0; i < tries; i++) {
    try {
      const list = await httpGetJson(port, '/json/list');
      const t = list.find((x) => (x.url && x.url.includes('localhost:3000') && x.webSocketDebuggerUrl)) ||
                list.find((x) => (x.type === 'page' && x.url && x.url.startsWith('http') && x.webSocketDebugUrl));
      if (t) { dbg('target=' + t.url); return { url: t.webSocketDebuggerUrl, id: t.id }; }
    } catch (e) { dbg('tgerr=' + e.message); }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('no target');
}

class CDP {
  constructor(host, port, path) {
    this.host = host; this.port = port; this.path = path;
    this.sock = net.connect(port, host);
    this.buf = Buffer.alloc(0); this.hs = false;
    this.counter = 0; this.pending = new Map();
    this.sock.on('error', (e) => dbg('sockerr=' + e.message));
    this.sock.on('connect', () => {
      const key = Buffer.from('x-' + Date.now()).toString('base64');
      this.sock.write('GET ' + this.path + ' HTTP/1.1\r\nHost: ' + host + ':' + port + '\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ' + key + '\r\nSec-WebSocket-Version: 13\r\n\r\n');
    });
    this.sock.on('data', (d) => {
      this.buf = Buffer.concat([this.buf, d]);
      if (!this.hs) { const k = this.buf.indexOf('\r\n\r\n'); if (k === -1) return; this.buf = this.buf.slice(k + 4); this.hs = true; }
      let used = parseFrames(this.buf, (t) => {
        try { const j = JSON.parse(t); dbg('recv id=' + j.id); const p = this.pending.get(j.id); if (p) { this.pending.delete(j.id); p(j); } }
        catch (e) { /* ignore */ }
      });
      this.buf = this.buf.slice(used);
    });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      this.counter = (this.counter >= 1e6) ? 1 : this.counter + 1;
      const id = this.counter;
      const msg = JSON.stringify({ id, method, params });
      const to = setTimeout(() => { this.pending.delete(id); reject(new Error('cdp-timeout ' + method)); }, 12000);
      this.pending.set(id, (j) => { clearTimeout(to); resolve(j?.result || null); });
      this.sock.write(mkFrame(msg));
    });
  }
  eval(expr) {
    return this.send('Runtime.evaluate', { expression: expr, returnByValue: true });
  }
  close() { this.sock.destroy(); }
}

let cp = null; let cdp = null;
try {
  dbg('launch chrome mobile UA 390x844');
  cp = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--no-default-browser-check', '--disable-dev-shm-usage', '--force-device-scale-factor=1',
    '--window-size=390,844', '--user-agent=' + UA_MOBILE,
    '--remote-debugging-port=9348', 'http://localhost:3000/'
  ], { windowsHidden: true, detached: true });
  dbg('pid=' + cp.pid);
  cp.on('error', (e) => dbg('err=' + e.message));

  const { url } = await waitWs(9348);
  const m = url.match(/^wss?:\/\/([^:]+):(\d+)(.*)$/);
  cdp = new CDP(m[1], +m[2], m[3]);

  dbg('navigate'); await cdp.send('Page.navigate', { url: 'http://localhost:3000/' });
  await cdp.send('Page.enable');  // ensure events

  // poll
  let attempts = 0; const MAX = 40;
  let dims = null;
  while (attempts < MAX) {
    attempts++;
    try {
      const r = await cdp.eval(EXPR);
      dims = r?.value;
      dbg('poll ' + attempts + ' itemCount=' + (dims?.itemCount || 0));
      if (dims && dims.itemCount > 0) break;
    } catch (e) { dbg('pollerr ' + e.message); }
    await new Promise((r) => setTimeout(r, 250));
  }
  rlog('FINAL: ' + JSON.stringify(dims));
} catch (e) {
  dbg('FATAL=' + (e?.stack || e));
  rlog('ERROR=' + (e?.message || e));
} finally {
  try { if (cdp) cdp.close(); } catch (_) {}
  try { if (cp) cp.kill('SIGKILL'); } catch (_) {}
  setTimeout(() => process.exit(0), 400);
}
