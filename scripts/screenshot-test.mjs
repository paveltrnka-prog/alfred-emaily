import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'resources', 'screenshots-viewports');

const VIEWPORTS = [
  { name: 'desktop', width: 700, height: 900 },
  { name: 'iphone', width: 375, height: 812 },
  { name: 'narrow', width: 320, height: 568 },
];

const EMAILS = [
  // Guest
  { file: 'guest/01-pre-arrival-7days.html', label: 'guest-01-pre-arrival-7days' },
  { file: 'guest/02-pre-arrival-today.html', label: 'guest-02-pre-arrival-today' },
  { file: 'guest/03-checkin-completed.html', label: 'guest-03-checkin-completed' },
  { file: 'guest/04-checkout-reminder.html', label: 'guest-04-checkout-reminder' },
  { file: 'guest/05-reservation-cancel.html', label: 'guest-05-reservation-cancel' },
  { file: 'guest/06-reservation-date-change.html', label: 'guest-06-reservation-date-change' },
  { file: 'guest/07-guest-count-lowered.html', label: 'guest-07-guest-count-lowered' },
  { file: 'guest/08-payment-online.html', label: 'guest-08-payment-online' },
  { file: 'guest/09-payment-terminal.html', label: 'guest-09-payment-terminal' },
  { file: 'guest/10-payment-fail.html', label: 'guest-10-payment-fail' },
  { file: 'guest/11-preauth-terminal.html', label: 'guest-11-preauth-terminal' },
  { file: 'guest/12-preauth-cancel-online.html', label: 'guest-12-preauth-cancel-online' },
  { file: 'guest/13-alfred-confirmation-code.html', label: 'guest-13-alfred-confirmation-code' },
  { file: 'guest/14-pin-info.html', label: 'guest-14-pin-info' },
  { file: 'guest/15-key-reminder.html', label: 'guest-15-key-reminder' },
  { file: 'guest/16-service-ordered.html', label: 'guest-16-service-ordered' },
  { file: 'guest/17-ssbar-online.html', label: 'guest-17-ssbar-online' },
  { file: 'guest/18-ssbar-terminal.html', label: 'guest-18-ssbar-terminal' },
  // Hotel
  { file: 'hotel/01-checkin-completed.html', label: 'hotel-01-checkin-completed' },
  { file: 'hotel/02-payment-online.html', label: 'hotel-02-payment-online' },
  { file: 'hotel/03-payment-terminal.html', label: 'hotel-03-payment-terminal' },
  { file: 'hotel/04-payment-fail.html', label: 'hotel-04-payment-fail' },
  { file: 'hotel/05-preauth-terminal.html', label: 'hotel-05-preauth-terminal' },
  { file: 'hotel/06-preauth-cancel-online.html', label: 'hotel-06-preauth-cancel-online' },
  { file: 'hotel/07-reservation-cancel.html', label: 'hotel-07-reservation-cancel' },
  { file: 'hotel/08-reservation-date-change.html', label: 'hotel-08-reservation-date-change' },
  { file: 'hotel/09-minibar.html', label: 'hotel-09-minibar' },
  { file: 'hotel/10-commission-failed.html', label: 'hotel-10-commission-failed' },
  { file: 'hotel/11-service-ordered.html', label: 'hotel-11-service-ordered' },
  { file: 'hotel/12-ssbar-online.html', label: 'hotel-12-ssbar-online' },
  { file: 'hotel/13-ssbar-terminal.html', label: 'hotel-13-ssbar-terminal' },
  { file: 'hotel/14-expired-preauth.html', label: 'hotel-14-expired-preauth' },
];

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  let ok = 0;

  for (const { file, label } of EMAILS) {
    const filePath = path.join(ROOT, 'emails', file);
    if (!fs.existsSync(filePath)) {
      console.log(`SKIP (nenalezeno): ${file}`);
      continue;
    }

    const fileUrl = `file://${filePath}`;
    console.log(`\n[${label}]`);

    for (const vp of VIEWPORTS) {
      const outPath = path.join(OUTPUT_DIR, `${label}--${vp.name}.png`);
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(fileUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
      console.log(`  ${vp.name} (${vp.width}px) -> ${path.basename(outPath)}`);
      ok++;
    }
  }

  await browser.close();
  console.log(`\nHotovo: ${ok} screenshotů v ${OUTPUT_DIR}`);
})();
