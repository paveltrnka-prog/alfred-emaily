/**
 * verify.mjs — binární verifier pro Alfred email project
 * Exit 0 = PASS, Exit 1 = FAIL
 *
 * Použití: node scripts/verify.mjs [guest/01-pre-arrival-7days.html]
 * Bez argumentu: zkontroluje všechny emaily.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const EMAILS_DIR = path.join(ROOT, 'emails');

// ── Pravidla z CLAUDE.md ──────────────────────────────────────────────────────

const RULES = [
  {
    name: 'width-510',
    description: 'Email musí mít šířku 510px (table width="510")',
    check: (html) => /width="510"/.test(html) || /width:\s*510px/.test(html),
  },
  {
    name: 'footer-previo',
    description: 'Footer musí obsahovat "Alfred powered by Previo"',
    check: (html) => html.includes('Alfred powered by Previo'),
  },
  {
    name: 'font-inter',
    description: 'Font musí být Inter,Arial,sans-serif',
    check: (html) => /Inter/.test(html),
  },
  {
    name: 'accent-color',
    description:
      'Musí obsahovat jednu ze stavových barev (primární #6F2F6A, pozitivní #16a34a, čekající #1d4ed8, změna #d97706, problém #c0392b)',
    check: (html) =>
      /#6[Ff]2[Ff]6[Aa]|#16[Aa]34[Aa]|#1[Dd]4[Ee][Dd]8|#[Dd]97706|#[Cc]0392[Bb]/.test(html),
  },
  {
    name: 'state-title',
    description:
      'Musí obsahovat výrazný tučný nadpis stavu nad Alfredovou bublinou (font-size:17px; font-weight:700; barevný text, ne podbarvení)',
    check: (html) =>
      /font-size:17px;\s*font-weight:700;\s*color:#(6[Ff]2[Ff]6[Aa]|16[Aa]34[Aa]|1[Dd]4[Ee][Dd]8|[Dd]97706|[Cc]0392[Bb]|92400[Ee])/.test(
        html
      ),
  },
  {
    name: 'no-colored-bubble-bg',
    description:
      'Alfredova bublina nesmí mít barevné pozadí podle stavu (koliduje s brandem hotelu) — musí být neutrální #f0e8ef',
    check: (html) => !/#(dcfce7|dbeafe|fef3c7|fde8e8)/i.test(html),
  },
  {
    name: 'no-php',
    description: 'Nesmí obsahovat PHP tagy (<?php, <?=)',
    check: (html) => !/<\?php|<\?=/.test(html),
  },
  {
    name: 'no-php-vars',
    description: 'Nesmí obsahovat PHP proměnné ($variable)',
    check: (html) => !/\$[a-zA-Z_][a-zA-Z0-9_]*/.test(html),
  },
  {
    name: 'no-external-css',
    description: 'Nesmí odkazovat na externí CSS soubory',
    check: (html) => !/<link[^>]+rel=["']stylesheet["']/.test(html),
  },
  {
    name: 'has-alfred-bubble',
    description: 'Musí obsahovat Alfredovu bublinu nebo avatar (speech bubble sekce)',
    check: (html) =>
      /bubble-cell|bubble-wrap|alfred.*bubble|alfred-avatar|alfred-avatar\.svg/i.test(html),
  },
  {
    name: 'no-emoji',
    description: 'Nesmí obsahovat emoji',
    check: (html) => {
      // Základní emoji rozsahy (Unicode)
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
      return !emojiRegex.test(html);
    },
  },
  {
    name: 'placeholders-format',
    description: 'Dynamické hodnoty musí být ve formátu [VARIABLE], ne {variable} nebo {{variable}}',
    check: (html) => !/\{\{[A-Z_]+\}\}|\{[A-Z_]+\}/.test(html),
  },
];

// ── Playwright render + responsivita ─────────────────────────────────────────

const VIEWPORTS = [
  { name: 'desktop', width: 700, height: 900 },
  { name: 'mobile',  width: 375, height: 812 },  // iPhone SE / standard
  { name: 'narrow',  width: 320, height: 568 },  // nejužší běžný telefon
];

async function checkRenders(emailFiles) {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const filePath of emailFiles) {
    const fileUrl = `file://${filePath}`;
    const fileIssues = [];

    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

      try {
        await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(200);

        // 1. Obsah existuje
        const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || '');
        if (bodyText.length < 50) {
          fileIssues.push(`[${vp.name}] Prázdná stránka`);
          continue;
        }

        // 2. Žádný horizontální scroll — email nesmí přetékat viewport
        const hasHorizontalScroll = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
        if (hasHorizontalScroll) {
          fileIssues.push(`[${vp.name} ${vp.width}px] Horizontální scroll — email přetéká viewport`);
        }

        // 3. Žádný element širší než viewport
        const overflowingEl = await page.evaluate((vpWidth) => {
          const all = document.querySelectorAll('*');
          for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.width > vpWidth + 2) { // +2px tolerance
              return `<${el.tagName.toLowerCase()}> šířka ${Math.round(rect.width)}px`;
            }
          }
          return null;
        }, vp.width);
        if (overflowingEl) {
          fileIssues.push(`[${vp.name} ${vp.width}px] Přetékající element: ${overflowingEl}`);
        }

        // 4. CTA tlačítko viditelné (pouze pokud existuje)
        const ctaVisible = await page.evaluate(() => {
          const btns = document.querySelectorAll('a[class*="btn"], td[class*="btn"], .btn-primary');
          if (btns.length === 0) return true; // email bez CTA — OK
          for (const btn of btns) {
            const rect = btn.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) return true;
          }
          return false;
        });
        if (!ctaVisible) {
          fileIssues.push(`[${vp.name}] CTA tlačítko není viditelné`);
        }

        // 5. Alt atributy na obrázcích
        if (vp.name === 'desktop') { // stačí jednou
          const imgsWithoutAlt = await page.evaluate(() => {
            const imgs = document.querySelectorAll('img');
            return Array.from(imgs)
              .filter((img) => !img.hasAttribute('alt'))
              .map((img) => img.src.split('/').pop() || 'neznámý obrázek');
          });
          if (imgsWithoutAlt.length > 0) {
            fileIssues.push(`[a11y] Obrázky bez alt: ${imgsWithoutAlt.join(', ')}`);
          }
        }

      } catch (err) {
        fileIssues.push(`[${vp.name}] Chyba: ${err.message}`);
      } finally {
        await page.close();
      }
    }

    if (fileIssues.length === 0) {
      results.push({ file: filePath, ok: true });
    } else {
      results.push({ file: filePath, ok: false, error: fileIssues.join(' | ') });
    }
  }

  await browser.close();
  return results;
}

// ── Hlavní logika ────────────────────────────────────────────────────────────

async function main() {
  const targetArg = process.argv[2];

  // Zjisti seznam souborů ke kontrole
  let emailFiles = [];
  if (targetArg) {
    const absPath = path.isAbsolute(targetArg)
      ? targetArg
      : path.join(EMAILS_DIR, targetArg);
    emailFiles = [absPath];
  } else {
    // Všechny emaily
    for (const subdir of ['guest', 'hotel']) {
      const dir = path.join(EMAILS_DIR, subdir);
      if (!fs.existsSync(dir)) continue;
      for (const file of fs.readdirSync(dir).sort()) {
        if (file.endsWith('.html')) {
          emailFiles.push(path.join(dir, file));
        }
      }
    }
  }

  if (emailFiles.length === 0) {
    console.error('FAIL: Žádné HTML soubory nenalezeny');
    process.exit(1);
  }

  let totalFails = 0;
  const report = [];

  // ── Statické kontroly ──
  for (const filePath of emailFiles) {
    const relPath = path.relative(ROOT, filePath);
    const fileResults = { file: relPath, rules: [], renderOk: null };

    if (!fs.existsSync(filePath)) {
      fileResults.rules.push({ name: 'file-exists', ok: false, description: 'Soubor neexistuje' });
      totalFails++;
      report.push(fileResults);
      continue;
    }

    const html = fs.readFileSync(filePath, 'utf8');

    for (const rule of RULES) {
      const ok = rule.check(html);
      fileResults.rules.push({ name: rule.name, ok, description: rule.description });
      if (!ok) totalFails++;
    }

    report.push(fileResults);
  }

  // ── Playwright render test ──
  console.log('\nSpouštím Playwright render test...');
  let renderResults;
  try {
    renderResults = await checkRenders(emailFiles);
  } catch (err) {
    console.error(`Playwright selhal: ${err.message}`);
    renderResults = emailFiles.map((f) => ({ file: f, ok: false, error: err.message }));
  }

  for (const rr of renderResults) {
    const relPath = path.relative(ROOT, rr.file);
    const fileResult = report.find((r) => r.file === relPath);
    if (fileResult) {
      fileResult.renderOk = rr.ok;
      fileResult.renderError = rr.error;
      if (!rr.ok) totalFails++;
    }
  }

  // ── Výstup ──
  console.log('\n══════════════════════════════════════════');
  console.log('  ALFRED EMAIL VERIFIER');
  console.log('══════════════════════════════════════════\n');

  for (const fileResult of report) {
    const fileOk = fileResult.rules.every((r) => r.ok) && fileResult.renderOk !== false;
    const icon = fileOk ? '✓' : '✗';
    console.log(`${icon} ${fileResult.file}`);

    for (const rule of fileResult.rules) {
      if (!rule.ok) {
        console.log(`    FAIL [${rule.name}]: ${rule.description}`);
      }
    }

    if (fileResult.renderOk === false) {
      console.log(`    FAIL [render]: ${fileResult.renderError}`);
    }
  }

  console.log('\n──────────────────────────────────────────');
  if (totalFails === 0) {
    console.log(`PASS: Všechny emaily (${emailFiles.length}) prošly kontrolou.`);
    console.log('──────────────────────────────────────────\n');
    process.exit(0);
  } else {
    console.log(`FAIL: ${totalFails} problémů v ${emailFiles.length} emailech.`);
    console.log('──────────────────────────────────────────\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Neočekávaná chyba:', err);
  process.exit(1);
});
