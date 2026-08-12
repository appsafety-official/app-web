// Diagnose CDP WebSocket handshake + first frame
const net = require('net');
const http = require('http');
const { spawn } = require('child_process');
const PORT = 9353;
const CHROME = 'C:/Users/acer/AppData/Local/ms-playwright/chromium-1232/chrome-win64/chrome.exe';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)';

const cp = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
  '--force-device-scale-factor=1', '--window-size=390,844',
  '--user-agent=' + UA,
  '--remote-debugging-port=' + PORT,
  'http://localhost:3000/'
], { detached: true, windowsHidden: true });

setTimeout(async () => {
  try {
    const list = await new Promise((res, rej) => {
      const req = http.get({ host: '127.0.0.1', port: PORT, path: '/json/list' }, (r) => {
        let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
      });
      req.setTimeout(8000, () => { req.destroy(); rej(new Error('http-timeout')); });
      req.on('error', rej);
    });
    const t = list.find(x => x.url && x.url.includes('localhost:3000') && x.webSocketDebuggerUrl) || list[0];
    console.log('TARGET_WS=' + (t && t.webSocketDebuggerUrl));
    if (!t || !t.webSocketDebuggerUrl) { console.log('NO_TARGET'); cp.kill('SIGKILL'); process.exit(1); }
    const m = t.webSocketDebuggerUrl.match(/^wss?:\/\/([^:]+):(\d+)(.*)$/);
    const [host, port, path] = [m[1], +m[2], m[3]];
    const s = net.connect(port, host);
    s.on('connect', () => {
      const key = Buffer.from('k-' + Date.now()).toString('base64');
      s.write(`GET ${path} HTTP/1.1\r\nHost: ${host}:${port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);
      console.log('>>> SENT HANDSHAKE');
    });
    s.on('error', e => console.log('SOCK_ERR=' + e.message));
    let buf = Buffer.alloc(0);
    s.on('data', d => {
      buf = Buffer.concat([buf, d]);
      if (buf.length > 0) {
        let txt = buf.toString('latin1');
        const idx = txt.indexOf('\r\n\r\n');
        if (idx >= 0) {
          console.log('<<< HTTP RESPONSE HEADERS:\n' + txt.slice(0, idx));
          const body = buf.slice(idx + 4);
          if (body.length > 0) {
            // minimal frame parse: first byte = opcode/fin
            const b0 = body[0], b1 = body[1];
            const opcode = b0 & 0x0f; const masked = (b1 & 0x80) !== 0; const len = body[1] & 0x7f;
            const off = masked ? 6 : 2; // simplified (no ext len)
            const payload = body.slice(off, off + len);
            console.log(`<<< FIRST FRAME: opcode=${opcode} masked=${masked} len=${len} payload="${payload.toString().slice(0,200)}"`);
          }
        }
      }
      setTimeout(() => { try { s.destroy(); } catch (_) {} try { cp.kill('SIGKILL'); } catch (_) {} process.exit(0); }, 400);
    });
    // after handshake ok, send a ping frame
    setTimeout(() => {
      // unmasked ping frame (opcode 0x9, len 0)
      const ping = Buffer.from([0x89, 0x00]);
      s.write(ping);
      console.log('>>> SENT PING');
    }, 2500);
  } catch (e) {
    console.log('FATAL=' + (e && e.stack ? e.stack : e));
    cp.kill('SIGKILL');
    process.exit(1);
  }
}, 2500);
