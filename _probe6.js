const puppeteer = require('puppeteer-core');
const fs = require('fs');
const log = (m) => process.stderr.write(m + '\n');

const CDP_PATH = 'C:/Users/acer/AppData/Local/ms-playwright/chromium-1232/chrome-win64/chrome.exe';
const UA_MOBILE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

(async () => {
  let b;
  try {
    b = await puppeteer.launch({
      executablePath: CDP_PATH,
      headless: 'new',
      args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--force-device-scale-factor=1','--window-size=390,844','--user-agent=' + UA_MOBILE],
      defaultViewport: { width: 390, height: 844, isMobile: true }
    });
  } catch (e) { log('LAUNCH_FAIL=' + e.message); fs.writeFileSync('D:/_probe6-err.txt', e.message); process.exit(2); }
  const p = await b.newPage();
  try { await p.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 25000 }); }
  catch (e) { log('NAV_WARN=' + e.message); }
  await new Promise(r => setTimeout(r, 3000));
  let dims = null;
  for (let i = 0; i < 25; i++) {
    try {
      dims = await p.evaluate(() => {
        const items = document.querySelectorAll('.marquee-row > div');
        const row = document.querySelector('.marquee-row');
        const first = items[0];
        const img = first ? first.querySelector('img') : null;
        return {
          viewportW: Math.round(window.innerWidth),
          viewportH: Math.round(window.innerHeight),
          rowCount: document.querySelectorAll('.marquee-row').length,
          itemCount: items.length,
          first: first ? { width: Math.round(first.offsetWidth), height: Math.round(first.offsetHeight), class: first.getAttribute('class'), alt: img ? img.getAttribute('alt') : null, imgRect: img ? img.getBoundingClientRect() : null } : null,
          bodyText: (document.body && document.body.innerText) ? document.body.innerText.slice(0, 200) : ''
        };
      });
      log('poll ' + i + ' itemCount=' + (dims && dims.itemCount) + ' body=' + (dims && dims.bodyText ? dims.bodyText.slice(0, 30) : '(empty)'));
      if (dims && dims.itemCount > 0 && dims.bodyText && dims.bodyText.length > 10) break;
    } catch (e) { log('eval err=' + e.message); }
    await new Promise(r => setTimeout(r, 500));
  }
  fs.writeFileSync('D:/app-web/_probe6-out.json', JSON.stringify(dims));
  log('FINAL: ' + JSON.stringify(dims));
  await b.close();
  log('---done---');
})().catch((e) => { log('FATAL=' + (e && e.stack ? e.stack : e)); fs.writeFileSync('D:/app-web/_probe6-err.txt', String(e)); process.exit(1); });
