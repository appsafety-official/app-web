// CDP raw: connect to chrome headless --remote-debugging-port (no puppeteer needed)
const net = require('net');
const http = require('http');
const fs = require('fs');

const PORT = 9351;
const CHROME = 'C:/Users/acer/AppData/Local/ms-playwright/chromium-1232/chrome-win64/chrome.exe';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
const log = (m) => process.stderr.write(m + '\n');
const out = (m) => fs.appendFileSync('D:/app-web/_probe7-out.txt', m);
fs.writeFileSync('D:/app-web/_probe7-out.txt', '');
fs.writeFileSync('D:/app-web/_probe7-debug.log', 'START\n');
const dbg = (m) => fs.appendFileSync('D:/app-web/_probe7-debug.log', m + '\n');

const { spawn } = require('child_process');
const cp = spawn(CHROME, [
  '--headless=new','--disable-gpu','--no-sandbox','--no-first-run','--no-default-browser-check',
  '--disable-dev-shm-usage','--force-device-scale-factor=1','--window-size=390,844',
    '--user-agent=' + UA, '--remote-debugging-port=' + PORT,
  'http://localhost:3000/id'
], { detached: true, windowsHidden: true });
dbg('pid=' + cp.pid);

function httpGetJson(path) {
  return new Promise((res, rej) => {
    const req = http.get({ host: '127.0.0.1', port: PORT, path }, (r) => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    });
    req.setTimeout(8000, () => { req.destroy(); rej(new Error('http-timeout')); });
    req.on('error', rej);
  });
}

function mkFrame(str) {
  const d = Buffer.from(str);
  const mk = Buffer.from([Math.random()*255|0, Math.random()*255|0, Math.random()*255|0, Math.random()*255|0]);
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
    const op = buf[i] & 0xf; let n = buf[i + 1] & 0x7f; let o = 2;
    if (n === 126) { n = buf.readUInt16BE(i + o); o += 2; } else if (n === 127) { n = Number(buf.readBigUInt64BE(i + o)); o += 8; }
    if (i + o + n > buf.length) break;
    if (op === 1) cb(buf.subarray(i + o, i + o + n).toString());
    i += o + n;
  }
  return i;
}

async function waitForWs(timeout) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const list = await httpGetJson('/json/list');
      dbg('list=' + JSON.stringify(list.map(t => (t.url||'?').slice(0, 45))));
            const t = list.find(x => x.url && x.url.includes('localhost:3000') && x.webSocketDebuggerUrl)
             || list.find(x => x.type === 'page' && x.url && x.url.startsWith('http') && x.webSocketDebuggerUrl);
      if (t) { dbg('target=' + t.url + ' ws=' + (t.webSocketDebuggerUrl||'').slice(0, 50)); return t.webSocketDebuggerUrl; }
    } catch (e) { dbg('tgerr=' + e.message); }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('no cdp target');
}

(async () => {
  try {
    const wsUrl = await waitForWs(20000);
    const m = wsUrl.match(/^wss?:\/\/([^:]+):(\d+)(.*)$/);
    const [host, port, path] = [m[1], +m[2], m[3]];
    const sock = net.connect(port, host);
    let buf = Buffer.alloc(0), hs = false, pending = new Map(), counter = 0;
    sock.on('connect', () => {
      const key = Buffer.from('k-' + Date.now()).toString('base64');
      sock.write('GET ' + path + ' HTTP/1.1\r\nHost: ' + host + ':' + port + '\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ' + key + '\r\nSec-WebSocket-Version: 13\r\n\r\n');
    });
    sock.on('error', e => dbg('sockerr=' + e.message));
    sock.on('data', d => {
      buf = Buffer.concat([buf, d]);
      if (!hs) { const k = buf.indexOf('\r\n\r\n'); if (k === -1) return; buf = buf.slice(k + 4); hs = true; }
      const used = parseFrames(buf, t => {
        try {
          const j = JSON.parse(t);
          const p = pending.get(j.id);
          if (j.method === 'Page.frameStoppedLoading') dbg('frameStoppedLoading');
          if (p) { pending.delete(j.id); p(j); }
        } catch (e) { /* ignore */ }
      });
      buf = buf.slice(used);
    });
    const send = (method, params = {}) => new Promise((res, rej) => {
      counter = (counter >= 1e6) ? 1 : counter + 1;
      const id = counter;
      const to = setTimeout(() => { pending.delete(id); rej(new Error('cdp-timeout ' + method)); }, 12000);
      pending.set(id, j => { clearTimeout(to); res(j?.result || null); });
      sock.write(mkFrame(JSON.stringify({ id, method, params })));
    });
        const evalExpr = (expr) => send('Runtime.evaluate', { expression: expr, returnByValue: true });

    dbg('waiting 800ms for tab ready');
    await new Promise(r => setTimeout(r, 800));
    dbg('Runtime.evaluate direct (skip Page.enable)');
    // diagnostic: verify tab is actually at a real page
    let diag = null;
    try {
      const dr = await evalExpr('JSON.stringify({href:location.href, ready:document.readyState, bodyLen:(document.body?document.body.innerHTML.length:0), hasMarquee:(document.querySelector(".marquee-row")!==null)})');
      diag = dr && dr.value;
      dbg('DIAG=' + JSON.stringify(diag));
    } catch (e) { dbg('diag err=' + e.message); }
    out('DIAG: ' + JSON.stringify(diag));

    const EXPR = fs.readFileSync('D:/app-web/expr.js', 'utf8');
    let dims = null;
    dbg('poll');
    for (let i = 0; i < 30; i++) {
      try {
        const r = await evalExpr(EXPR);
        dims = r && r.value;
        dbg('poll ' + i + ' itemCount=' + ((dims && dims.itemCount) || 0) + ' body=' + ((dims && dims.bodyText) ? dims.bodyText.slice(0, 30) : '(empty)'));
        if (dims && dims.itemCount > 0 && dims.bodyText && dims.bodyText.length > 10) break;
      } catch (e) { dbg('evalerr=' + e.message); }
      await new Promise(r => setTimeout(r, 500));
    }
        out('FINAL: ' + JSON.stringify(dims));
    dbg('done; capturing snapshot');
    try {
      const snap = await send('Page.captureSnapshot', { format: 'jpeg', quality: 75 });
      if (snap && snap.data) {
        // data is base64 (jpeg); convert to PNG via Buffer
        const raw = Buffer.from(snap.data, 'base64');
        fs.writeFileSync('D:/app-web/.mobile-check-buffer', raw);
        dbg('snap bytes=' + raw.length);
      } else { dbg('snap no data'); }
    } catch (e) { dbg('snap err=' + e.message); }
    out('SNAPSHOT_BYTES=' + (fs.existsSync('D:/app-web/.mobile-check-buffer') ? fs.statSync('D:/app-web/.mobile-check-buffer').size : 0));
    sock.destroy();
  } catch (e) {
    dbg('FATAL=' + (e && e.stack ? e.stack : e));
    out('ERROR: ' + (e && e.message ? e.message : e));
  } finally {
    try { cp.kill('SIGKILL'); } catch (_) {}
    setTimeout(() => process.exit(0), 300);
  }
})();
