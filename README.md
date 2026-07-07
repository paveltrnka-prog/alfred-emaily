# Alfred Email v2

Redesign transakčních e-mailů aplikace [Alfred](https://myalfred.app) pro hotelové hosty a hotely. Produkuje čisté HTML pro PHP backend systému Previo.

## Přehled emailů

Prohlídka všech emailů: **[paveltrnka-prog.github.io/alfred-emaily/preview/](https://paveltrnka-prog.github.io/alfred-emaily/preview/)**

### Hosté (19 emailů)
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

### Hotel (14 emailů)
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

## Stavové barvy

| Stav | Barva | Hex |
|---|---|---|
| Pozitivní | Zelená | `#16a34a` / bg `#dcfce7` |
| Čekající | Modrá | `#1d4ed8` / bg `#dbeafe` |
| Změna | Oranžová | `#d97706` / bg `#fef3c7` |
| Problém | Červená | `#c0392b` / bg `#fde8e8` |
| Neutrální | Fialová | `#6F2F6A` / bg `#f0e8ef` |

## Struktura projektu

```
/emails
  _base.html              sdílená šablona
  /guest                  emaily pro hosty (01–19) + 20-mascot-concept.html (koncept)
  /hotel                  emaily pro hotely (01–14)
/preview
  index.html              přehled všech emailů + koncepty
/assets
  alfred-avatar.svg
  alfred-mascot.png       3D maskot (hero pro koncepty)
  myalfred-logo.png
  hotel.jpg
  logo-pytloun.png
/scripts
  send-test-emails.mjs    odeslání testovacích emailů přes Gmail
  screenshot-test.mjs
  download-screenshots.mjs
/resources
  screenshots/            screenshoty stávajících emailů
```

## Technické detaily

- Čisté HTML, bez PHP proměnných — dynamické hodnoty jako `[HOTEL_NAME]`, `[RESERVATION_ID]`
- Inline CSS pro kompatibilitu s email klienty
- Šířka 510px, centrovaný layout
- Testovací data: Hotel Pytloun Liberec, host Jan Novák

## GitHub Pages

1. Settings → Pages → Source: main branch, root `/`
2. Přehled dostupný na: `https://trnkapavel.github.io/alfred-e-maily/preview/`
