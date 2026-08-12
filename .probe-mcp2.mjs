import { spawn } from 'node:child_process';
import { writeFileSync, appendFileSync } from 'node:fs';

const DBG = 'D:/app-web/.probe-debug.log';
const RES = 'D:/app-web/.probe-result.txt';
const IMG = 'D:/app-web/.mcp-mobile-check.png';

writeFileSync(DBG, '');
writeFileSync(RES, 'STARTING\n');
const dbg = (m) => appendFileSync(DBG, m + '\n');
const res = (m) => appendFileSync(RES, m + '\n');

let seq = 0;
const pending = [];

dbg('launching npx @playwright/mcp --mobile --headless');
const child = spawn('npx @playwright/mcp --mobile --headless', {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: 'D:/app-web',
  shell: true,
  windowsHidden: true,
});

dbg('pid=' + child.pid);
child.on('error', (e) => { dbg('SPAWN ERROR: ' + (e?.message || e)); res('SPAWN ERROR: ' + (e?.message || e)); });
child.on('exit', (code, sig) => { dbg('exit code=' + code + ' sig=' + sig); });
child.on('close', () => dbg('closed'));

let stdoutBuf = '';
child.stdout.on('data', (d) => {
  const s = d.toString('utf8');
  dbg('RAW len=' + s.length + ' head=' + JSON.stringify(s.slice(0, 120)));
  stdoutBuf += s;
  while (true) {
    const idx = stdoutBuf.indexOf('\r\n\r\n');
    if (idx === -1) break;
    const header = stdoutBuf.slice(0, idx);
    const cl = header.match(/content-length:\s*(\d+)/i);
    if (!cl) { dbg('no content-length head=' + JSON.stringify(header.slice(0, 120))); break; }
    const len = parseInt(cl[1], 10);
    const bodyStart = idx + 4;
    if (stdoutBuf.length < bodyStart + len) break;
    const body = stdoutBuf.slice(bodyStart, bodyStart + len);
    stdoutBuf = stdoutBuf.slice(bodyStart + len);
    try {
      const msg = JSON.parse(body);
      dbg('PARSED id=' + msg.id + ' method=' + (msg.method || '-') + ' hasRes=' + (!!msg.result) + ' hasErr=' + (!!msg.error));
      const r = pending.shift();
      if (r) r(msg);
    } catch (e) {
      dbg('PARSE FAIL: ' + e.message + ' body=' + body.slice(0, 300));
    }
  }
});
child.stderr.on('data', (d) => dbg('STDERR: ' + d.toString().replace(/\n/g, ' | ').replace(/\r/g, '')));

function call(method, params = {}, ms = 20000) {
  const id = ++seq;
  const json = JSON.stringify({ jsonrpc: '2.0', id, method, params });
  const bytes = Buffer.byteLength(json);
  child.stdin.write('Content-Length: ' + bytes + '\r\n\r\n' + json);
  return new Promise((resolve) => {
    const t = setTimeout(() => { dbg('TIMEOUT ' + method); resolve({ _timeout: true, method }); }, ms);
    pending.push((r) => { clearTimeout(t); resolve(r); });
  });
}

const URL = 'http://localhost:3000/';

(async () => {
  try {
    const init = await call('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: { roots: { listDynamic: true }, sampling: {} },
      clientInfo: { name: 'app-web-check', version: '1.0.0' },
    }, 15000);
    if (init?._timeout) { res('RESULT: initialize timed out'); return finish(); }
    res('INIT_SERVER: ' + JSON.stringify(init?.result?.serverInfo || init?.result));

    await call('notifications/initialized');
    dbg('initialized notification sent');

    const tools = await call('tools/list', {}, 15000);
    if (tools?._timeout) { res('RESULT: tools/list timed out'); return finish(); }
    const list = tools?.result?.tools || [];
    res('TOOLS: ' + JSON.stringify(list.map((t) => t.name)));

    let saved = false;
    const grabImages = (r) => {
      const content = r?.result?.content || [];
      for (const c of content) {
        if (c.type === 'image') {
          writeFileSync(IMG, Buffer.from(c.data, 'base64'));
          dbg('IMAGE SAVED bytes=' + c.data.length + ' mime=' + c.mimeType);
          saved = true;
        }
        if (c.type === 'text') dbg('TEXT: ' + String(c.text).slice(0, 1000));
        if (c.type === 'resource') dbg('RESOURCE: ' + JSON.stringify(c).slice(0, 300));
      }
    };

    if (list.find((t) => t.name === 'snapshot')) {
      res('ACTION: snapshot');
      grabImages(await call('tools/call', { tool: 'snapshot', arguments: { url: URL } }, 25000));
    } else {
      if (list.find((t) => t.name === 'browser_navigate')) { res('ACTION: navigate'); grabImages(await call('tools/call', { tool: 'browser_navigate', arguments: { url: URL } }, 25000)); }
      if (list.find((t) => t.name === 'browser_take_screenshot')) { res('ACTION: screenshot'); grabImages(await call('tools/call', { tool: 'browser_take_screenshot', arguments: {} }, 25000)); }
    }
    res(saved ? 'RESULT: screenshot saved -> ' + IMG : 'RESULT: no image captured');
  } catch (e) {
    res('ERROR: ' + (e?.message || e));
    dbg('FATAL: ' + (e?.stack || e));
  } finally {
    await finish();
  }

  function finish() {
    return new Promise((done) => {
      try { child.stdin.end(); } catch {}
      setTimeout(() => { try { child.kill('SIGKILL'); } catch {}; dbg('killed'); done(); }, 2000);
    });
  }
})();
