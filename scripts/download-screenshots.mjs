import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = '/Users/paveltrnka/Documents/GitHub/alfred-email-v2/resources/screenshots';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const EMAILS = [
  { id: 'QT6c31dK5IwtNLi4Ho0u8c9nMs6mWm', file: 'guest-01-pre-arrival-7days', name: 'Pre-arrival check-in výzva (7 dní)' },
  { id: 'e2WAmQ6lNeTFzcZRlc9pK4TyOGqKFj', file: 'guest-02-pre-arrival-today', name: 'Pre-arrival check-in výzva (dnes)' },
  { id: 'Nl63iGT9RFhcdjTPYwvHVnJrQg8b8c', file: 'guest-03-checkin-completed', name: 'Dokončený check-in' },
  { id: 'bhhn47KAB39IKwBWTzRkEjQ0Tz2ves', file: 'guest-04-reservation-cancel', name: 'Zrušení rezervace (host)' },
  { id: 'BTFVJWlYmYCzgv4YZhdwW2Vr97LMtU', file: 'guest-05-reservation-date-change', name: 'Změna data rezervace (host)' },
  { id: 'Mulb64y9peMHhOrUY4WC2V1OVXuUbW', file: 'guest-06-payment-online', name: 'Potvrzení platby online (host)' },
  { id: 'hat9xCL4uTCe3jB4NGpt2O4QoF30wq', file: 'guest-07-preauth-terminal', name: 'Pre-autorizace terminál' },
  { id: '1USLIjE04UPcgJXjsawXil83Y0KcO5', file: 'guest-08-preauth-cancel-online', name: 'Zrušení pre-autorizace online (host)' },
  { id: 'ZkQ69SeutNBHULbmVzbHH7ahzcJSQq', file: 'guest-09-alfred-confirmation-code', name: 'Potvrzovací kód Alfred profilu' },
  { id: 'E68bvs3DkJXuLQnq7HJlzo1dPxSAzh', file: 'guest-10-service-ordered', name: 'Objednaná služba (host)' },
  { id: 'IaS5IXQ3zxHEVCg2oe0dTDMNkZQbZT', file: 'guest-11-pin-info', name: 'Informace o PIN / klíči' },
  { id: 'yOKDhHy6mRWzsy3RuWjwfqcnJ6qoET', file: 'guest-12-key-reminder', name: 'Připomínka klíče Alfred' },
  { id: '7tNKWQdgTAFvYLLU6mU5mveWNoShzA', file: 'guest-13-ssbar-online', name: 'SSBar online platba (host)' },
  { id: 'hbNdid7b5FLOeUWroT7JdDP9dRD8Z7', file: 'guest-14-ssbar-terminal', name: 'SSBar terminál platba (host)' },
  { id: 'rqkgXDr8hR4arGuAJWIVllkyRjdumr', file: 'guest-15-payment-terminal', name: 'Potvrzení platby terminál (host)' },
  { id: 'J1eCERKohOfKQbzip5dfAVKXypoLXD', file: 'guest-16-payment-fail', name: 'Selhání online platby (host)' },
  { id: 'UUrrTepUjSC3Cp5PVGyTkfjpEaZrVX', file: 'guest-17-guest-count-lowered', name: 'Snížení počtu hostů (host)' },
  { id: 'v60HTsR69X6EzIB5BL1ydN928cXGTC', file: 'hotel-01-payment-online', name: 'Potvrzení platby online (hotel)' },
  { id: 'uc3X2l5l3Bxbktd6ZnxAr7xIQf33hL', file: 'hotel-02-preauth-cancel-online', name: 'Zrušení pre-autorizace online (hotel)' },
  { id: '8V4kD3VwAufuz5nb11BZjXOXO6XH2m', file: 'hotel-03-reservation-date-change', name: 'Změna data rezervace (hotel)' },
  { id: 'XCVcd8LdZ8jTllzVwEq7Z6e1mvowy0', file: 'hotel-04-minibar', name: 'Konzumace minibaru (hotel)' },
  { id: 'LebnccRCjsC1mPo58Ys0sdd8s8yIgE', file: 'hotel-05-commission-failed', name: 'Nepřiřazení komise (hotel)' },
  { id: 't7BYBlj56dTKTBmXLFwLxONg1SmUaK', file: 'hotel-06-service-ordered', name: 'Objednaná služba (hotel)' },
  { id: 'fiEjrpE3ROWF43jigyPGleVEfvlZCo', file: 'hotel-07-ssbar-online', name: 'SSBar online platba (hotel)' },
  { id: 'p5ODh2BxkALJiq1YWY8BCi7DJhvmBs', file: 'hotel-08-ssbar-terminal', name: 'SSBar terminál platba (hotel)' },
  { id: '3AdTpba8SxQQLBbB8tSWfXNl0m6eSr', file: 'hotel-09-payment-terminal', name: 'Potvrzení platby terminál (hotel)' },
  { id: 'atG5eISrdwQejeixquDi1oiCCpDT7p', file: 'hotel-10-payment-fail', name: 'Selhání online platby (hotel)' },
  { id: 'fvwNOLuQrWhBI8ow41khm2C5URxdsl', file: 'hotel-11-expired-preauth', name: 'Expirovaná pre-autorizace (hotel)' },
  { id: 'wGaCIAtO3dkK3L4If1xgCYDZmIQgiC', file: 'hotel-12-preauth-day-before', name: 'Pre-autorizace den předem (hotel)' },
  { id: 'IcJYOEYaD6DUNcNvjAhUZemC9k0sB2', file: 'hotel-13-payment-occupied', name: 'Platba obsazeno (hotel)' },
  { id: 'xWvesV3YZfhfpQAU0WrtXPI1VVpfkP', file: 'guest-old-01-payment', name: 'Platba stará verze (host)' },
  { id: 'KBFz7XASTlKcaKTPSZxM9lHmjWkKPr', file: 'hotel-old-01-payment', name: 'Platba stará verze (hotel)' },
];

async function downloadOne(page, item) {
  const outPath = path.join(OUTPUT_DIR, `${item.file}.png`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
    console.log(`  SKIP: ${item.file}`);
    return true;
  }

  const url = `https://monosnap.ai/file/${item.id}`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForSelector('img:not([src*="MS_Logo"])', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Screenshot just the image element (no CORS issues)
    const imgEl = await page.$('img:not([src*="MS_Logo"])');
    if (imgEl) {
      await imgEl.screenshot({ path: outPath });
      const size = fs.statSync(outPath).size;
      console.log(`  OK: ${item.file} (${Math.round(size / 1024)}KB)`);
      return true;
    }

    console.log(`  FAIL: ${item.file} - no image found`);
    return false;
  } catch (err) {
    console.log(`  ERROR: ${item.file} - ${err.message.split('\n')[0]}`);
    return false;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  console.log(`Stahuji ${EMAILS.length} screenshotů do ${OUTPUT_DIR}\n`);

  let ok = 0, fail = 0;
  for (const [i, item] of EMAILS.entries()) {
    process.stdout.write(`[${i + 1}/${EMAILS.length}] ${item.name}\n`);
    const success = await downloadOne(page, item);
    success ? ok++ : fail++;
  }

  await browser.close();
  console.log(`\nHotovo: ${ok} OK, ${fail} selhalo`);
})();
