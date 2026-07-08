/**
 * Odeslání testovacích emailů přes Gmail SMTP.
 *
 * Nastavení:
 *   export GMAIL_USER=tvuj@gmail.com
 *   export GMAIL_PASS=xxxx-xxxx-xxxx-xxxx   # Gmail App Password (ne heslo k účtu)
 *   export GMAIL_TO=prijemce@email.com       # kam poslat (výchozí = GMAIL_USER)
 *
 * Spuštění:
 *   node scripts/send-test-emails.mjs guest/01           # pošle jen emaily matchující "guest/01"
 *   node scripts/send-test-emails.mjs guest/01,guest/19  # více filtrů oddělených čárkou
 *   node scripts/send-test-emails.mjs --all              # pošle úplně všechny emaily
 *   node scripts/send-test-emails.mjs --list             # jen vypíše seznam dostupných emailů
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
const GMAIL_TO   = process.env.GMAIL_TO || GMAIL_USER;
const ARG        = process.argv[2] || '';

if (!GMAIL_USER || !GMAIL_PASS) {
  console.error('Chybi GMAIL_USER nebo GMAIL_PASS env promenne.');
  console.error('Navod: viz komentar na zacatku tohoto souboru.');
  process.exit(1);
}

const EMAILS = [
  { file: 'guest/01-pre-arrival-7days.html',      subject: '[TEST] Guest 01 — Pre-arrival (7 days)' },
  { file: 'guest/02-pre-arrival-today.html',       subject: '[TEST] Guest 02 — Pre-arrival (today)' },
  { file: 'guest/03-checkin-completed.html',       subject: '[TEST] Guest 03 — Check-in completed' },
  { file: 'guest/04-checkout-reminder.html',       subject: '[TEST] Guest 04 — Checkout reminder' },
  { file: 'guest/05-reservation-cancel.html',      subject: '[TEST] Guest 05 — Reservation cancel' },
  { file: 'guest/06-reservation-date-change.html', subject: '[TEST] Guest 06 — Date change' },
  { file: 'guest/07-guest-count-lowered.html',     subject: '[TEST] Guest 07 — Guest count lowered' },
  { file: 'guest/08-payment-online.html',          subject: '[TEST] Guest 08 — Payment online' },
  { file: 'guest/09-payment-terminal.html',        subject: '[TEST] Guest 09 — Payment terminal' },
  { file: 'guest/10-payment-fail.html',            subject: '[TEST] Guest 10 — Payment fail' },
  { file: 'guest/11-preauth-terminal.html',        subject: '[TEST] Guest 11 — Preauth terminal' },
  { file: 'guest/12-preauth-cancel-online.html',   subject: '[TEST] Guest 12 — Preauth cancel online' },
  { file: 'guest/13-alfred-confirmation-code.html',subject: '[TEST] Guest 13 — Confirmation code' },
  { file: 'guest/14-pin-info.html',                subject: '[TEST] Guest 14 — PIN info' },
  { file: 'guest/15-key-reminder.html',            subject: '[TEST] Guest 15 — Key reminder' },
  { file: 'guest/16-service-ordered.html',         subject: '[TEST] Guest 16 — Service ordered' },
  { file: 'guest/17-ssbar-online.html',            subject: '[TEST] Guest 17 — SSBar online' },
  { file: 'guest/18-ssbar-terminal.html',          subject: '[TEST] Guest 18 — SSBar terminal' },
  { file: 'guest/19-group-pre-arrival.html',       subject: '[TEST] Guest 19 — Group pre-arrival' },
  { file: 'guest/21-dark-mode-concept.html',       subject: '[KONCEPT] Guest 21 — Dark mode + price breakdown' },
  { file: 'hotel/01-checkin-completed.html',       subject: '[TEST] Hotel 01 — Check-in completed' },
  { file: 'hotel/02-payment-online.html',          subject: '[TEST] Hotel 02 — Payment online' },
  { file: 'hotel/03-payment-terminal.html',        subject: '[TEST] Hotel 03 — Payment terminal' },
  { file: 'hotel/04-payment-fail.html',            subject: '[TEST] Hotel 04 — Payment fail' },
  { file: 'hotel/05-preauth-terminal.html',        subject: '[TEST] Hotel 05 — Preauth terminal' },
  { file: 'hotel/06-preauth-cancel-online.html',   subject: '[TEST] Hotel 06 — Preauth cancel online' },
  { file: 'hotel/07-reservation-cancel.html',      subject: '[TEST] Hotel 07 — Reservation cancel' },
  { file: 'hotel/08-reservation-date-change.html', subject: '[TEST] Hotel 08 — Date change' },
  { file: 'hotel/09-minibar.html',                 subject: '[TEST] Hotel 09 — Minibar' },
  { file: 'hotel/10-commission-failed.html',       subject: '[TEST] Hotel 10 — Commission failed' },
  { file: 'hotel/11-service-ordered.html',         subject: '[TEST] Hotel 11 — Service ordered' },
  { file: 'hotel/12-ssbar-online.html',            subject: '[TEST] Hotel 12 — SSBar online' },
  { file: 'hotel/13-ssbar-terminal.html',          subject: '[TEST] Hotel 13 — SSBar terminal' },
  { file: 'hotel/14-expired-preauth.html',         subject: '[TEST] Hotel 14 — Expired preauth' },
];

if (ARG === '--list' || ARG === '') {
  console.log('Dostupne emaily:\n');
  for (const { file } of EMAILS) console.log(`  ${file}`);
  console.log('\nPouziti:');
  console.log('  node scripts/send-test-emails.mjs guest/01           # posle jen matchujici "guest/01"');
  console.log('  node scripts/send-test-emails.mjs guest/01,guest/19  # vice filtru oddelenych carkou');
  console.log('  node scripts/send-test-emails.mjs --all              # posle uplne vsechny emaily');
  process.exit(0);
}

const filters = ARG === '--all' ? null : ARG.split(',').map(f => f.trim()).filter(Boolean);
const filtered = filters ? EMAILS.filter(e => filters.some(f => e.file.includes(f))) : EMAILS;

if (filtered.length === 0) {
  console.error(`Zadny email neodpovida filtru: "${ARG}"`);
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

console.log(`Posilam ${filtered.length} emailu na ${GMAIL_TO}\n`);

for (const { file, subject } of filtered) {
  const filePath = path.join(ROOT, 'emails', file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (nenalezeno): ${file}`);
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf8');

  try {
    await transporter.sendMail({
      from: `Alfred Test <${GMAIL_USER}>`,
      to: GMAIL_TO,
      subject,
      html,
    });
    console.log(`OK: ${subject}`);
  } catch (err) {
    console.error(`CHYBA: ${subject}\n  ${err.message}`);
  }

  // kratka pauza aby Gmail SMTP neblokoval
  await new Promise(r => setTimeout(r, 500));
}

console.log('\nHotovo.');
