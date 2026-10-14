# Alfred Email v2

Redesign transakčních e-mailů aplikace [Alfred](https://myalfred.app) pro hotelové hosty a hotely. Produkuje čisté HTML pro PHP backend systému Previo.

## Přehled emailů

Živá prohlídka (firemní GitHub Pages): **[paveltrnka-prog.github.io/alfred-emaily/preview/](https://paveltrnka-prog.github.io/alfred-emaily/preview/)**

### Hosté (21 emailů)
| # | Název | Stav |
|---|---|---|
| 01 | Pre-arrival 7 dní | neutrální |
| 02 | Pre-arrival dnes | neutrální |
| 03 | Check-in dokončen | zelená |
| 04 | Checkout reminder | neutrální |
| 05 | Zrušení rezervace | červená |
| 06 | Změna termínu | oranžová |
| 07 | Snížení počtu hostů | oranžová |
| 08 | Platba online | zelená |
| 09 | Platba terminál | zelená |
| 10 | Selhání platby | červená |
| 11 | Preautorizace terminál | modrá |
| 12 | Zrušení preautorizace | modrá |
| 13 | Potvrzovací kód | modrá |
| 14 | PIN info | zelená |
| 15 | Připomínka klíče | zelená |
| 16 | Služba objednána | zelená |
| 17 | SSbar online | zelená |
| 18 | SSbar terminál | zelená |
| 19 | Group pre-arrival (více pokojů) | fialová |
| **23** | **ECI/LCO approved · Pay** | zelená |
| **24** | **ECI/LCO rejected · info** | červená |

### Hotel (15 emailů)
| # | Název | Stav |
|---|---|---|
| 01 | Check-in dokončen | zelená |
| 02 | Platba online | zelená |
| 03 | Platba terminál | zelená |
| 04 | Selhání platby | červená |
| 05 | Preautorizace terminál | modrá |
| 06 | Zrušení preautorizace | modrá |
| 07 | Storno rezervace | červená |
| 08 | Změna termínu | oranžová |
| 09 | Minibar | zelená |
| 10 | Selhání komise | červená |
| 11 | Služba objednána | zelená |
| 12 | SSbar online | zelená |
| 13 | SSbar terminál | zelená |
| 14 | Expirovaná preautorizace | červená |
| **15** | **ECI/LCO request · Approve/Decline** | modrá |

### Status pages (prohlížeč — ne email)
Po kliku Approve / Decline v hotelier mailu:

| Soubor | Obsah |
|---|---|
| `pages/request-approved.html` | Request approved · host dostane pay email |
| `pages/request-declined.html` | Request declined · standardní CI/CO |

### ECI/LCO MVP flow (říjen 2026)
1. Host žádá early check-in / late check-out v Alfredu  
2. **hotel/15** → hoteliér Approve / Decline (+ odkaz do planneru)  
3. **pages/** → status potvrzení v prohlížeči  
4. **guest/23** → schváleno · **Pay** · **guest/24** → zamítnuto · info  

LCO = stejné šablony, jen copy (arrival ↔ departure).

## Stavové barvy

Alfredova bublina má vždy neutrální pozadí `#f0e8ef` (nekoliduje s brandem hotelu). Stav nese tučný nadpis nad bublinou, barevný podle stavu:

| Stav | Barva nadpisu | Hex |
|---|---|---|
| Pozitivní | Zelená | `#16a34a` |
| Čekající | Modrá | `#1d4ed8` |
| Změna | Oranžová | `#d97706` |
| Problém | Červená | `#c0392b` |
| Neutrální | Fialová | `#6F2F6A` |

## Struktura projektu

```
/emails
  _base.html              sdílená šablona
  /guest                  emaily pro hosty (01–19, 23–24) + koncepty 20–22
  /hotel                  emaily pro hotely (01–15)
  → vyplněná testovacími daty (Hotel Pytloun Liberec, rezervace 20241471...), pro vizuální review a GitHub Pages preview
/emails-dev
  /guest, /hotel          zrcadlo /emails se stejnými soubory, ale s obnovenými [VARIABLE] placeholdery
  → k předání programátorům pro napojení na PHP backend; neodkazuje na něj preview ani GitHub Pages
/pages
  request-approved.html   status po Approve (prohlížeč)
  request-declined.html   status po Decline (prohlížeč)
/preview
  index.html              přehled všech emailů + status pages + koncepty (načítá /emails)
/assets
  alfred-avatar.svg
  alfred-mascot.png       3D maskot (hero pro koncepty)
  myalfred-logo.png
  hotel.jpg
  logo-pytloun.png
/scripts
  verify.mjs              binární kontrola všech emailů proti pravidlům (npm run verify)
  loop.sh                 automatický proposer/verifier loop nad verify.mjs (npm run loop)
  send-test-emails.mjs    odeslání testovacích emailů přes Gmail
  screenshot-test.mjs
  download-screenshots.mjs
/resources
  screenshots/            screenshoty stávajících emailů
```

## Technické detaily

- Čisté HTML, bez PHP proměnných
- Inline CSS pro kompatibilitu s email klienty
- Šířka 510px, centrovaný layout
- `/emails`: testovací data (Hotel Pytloun Liberec, host Jan Novák) — pro vizuální review
- `/emails-dev`: stejné soubory s dynamickými hodnotami jako `[HOTEL_NAME]`, `[RESERVATION_ID]` — pro předání programátorům

## GitHub

| | |
|--|--|
| **Firemní (Previo)** | https://github.com/paveltrnka-prog/alfred-emaily |
| **Živý preview** | https://paveltrnka-prog.github.io/alfred-emaily/preview/ |
| **Osobní záloha** | https://github.com/trnkapavel/alfred-e-maily |

```bash
# osobní
git push origin main

# firemní (Pages)
git push previo main
```
