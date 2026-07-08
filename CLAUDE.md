# CLAUDE.md — Alfred Email v2

## Projekt
Redesign všech transakčních e-mailů aplikace Alfred (myalfred.app) pro hotelové hosty a hotely. Produkuje se čisté HTML pro PHP backend systému Previo.

## Zdroje
- **Screenshoty stávajících emailů:** `resources/screenshots/` — základ pro copy a obsah
- **Assets:** `assets/` — alfred-avatar.svg, myalfred-logo.png, hotel.jpg, logo-pytloun.png
- **Excel s přehledem emailů:** `resources/Mail Sending - Alfred mails.xlsx`

## Design systém
| Token | Hodnota |
|---|---|
| Primary | `#6F2F6A` |
| Primary hover | `#5a2557` |
| Text hlavní | `#1a1a1a` |
| Text sekundární | `#555555` |
| Pozadí stránky | `#eeecee` |
| Pozadí emailu | `#ffffff` |
| Sekce / tabulka | `#f7f5f7` |
| Border | `#e0d8e0` |
| Font | Inter, Arial, sans-serif |

## Stav e-mailu: velký nadpis, ne barevné pozadí

**Od 2026-07-08 (rozhodnutí vedení):** Alfredova bublina má vždy jednotné neutrální pozadí `#f0e8ef`, bez ohledu na stav e-mailu. Barevné podbarvení bubliny podle stavu bylo zrušeno, protože každý hotel si bude moct šablonu obrandovat vlastní barvou — kolize barvy hotelu se stavovou barvou pozadí (např. zelený brand hotelu + zelená "pozitivní" bublina) by dělala obsah nečitelný.

Stav e-mailu místo toho nese **výrazný tučný nadpis** (`font-size:17px; font-weight:700`) hned nad Alfredovou bublinou, barevný podle stavu (barva textu, ne pozadí — text s brandem hotelu nekoliduje):

| Stav | Akcentová barva (text nadpisu) | Použití |
|---|---|---|
| Neutrální | `#6F2F6A` | pre-arrival, checkout reminder |
| Pozitivní | `#16a34a` | platba přijata, check-in, PIN, služby |
| Čekající | `#1d4ed8` | preautorizace, potvrzovací kód |
| Změna | `#d97706` | změna termínu, snížení hostů |
| Problém | `#c0392b` | zrušení, selhání platby, expirace |

Vzor (vzniklo podle `guest/05-reservation-cancel.html`):
```html
<p style="margin:0 0 12px; font-size:17px; font-weight:700; color:#c0392b; font-family:Inter,Arial,sans-serif;">Cancelled reservation</p>
```

## Struktura projektu
```
/emails
  _base.html              ← sdílená šablona (okomentovaná)
  /guest                  ← emaily pro hosty
    01-pre-arrival-7days.html
    02-pre-arrival-today.html
    03-checkin-completed.html
    04-checkout-reminder.html
    05-reservation-cancel.html
    06-reservation-date-change.html
    07-guest-count-lowered.html
    08-payment-online.html
    09-payment-terminal.html
    10-payment-fail.html
    11-preauth-terminal.html
    12-preauth-cancel-online.html
    13-alfred-confirmation-code.html
    14-pin-info.html
    15-key-reminder.html
    16-service-ordered.html
    17-ssbar-online.html
    18-ssbar-terminal.html
    19-group-pre-arrival.html
  /hotel
    01-checkin-completed.html
    02-payment-online.html
    03-payment-terminal.html
    04-payment-fail.html
    05-preauth-terminal.html
    06-preauth-cancel-online.html
    07-reservation-cancel.html
    08-reservation-date-change.html
    09-minibar.html
    10-commission-failed.html
    11-service-ordered.html
    12-ssbar-online.html
    13-ssbar-terminal.html
    14-expired-preauth.html
/preview
  index.html              ← přehled všech emailů s náhledy
```

## Architektura emailů

### Sdílené bloky (v každém emailu)
1. **Header** — hotel logo (img placeholder) + hero foto hotelu
2. **Alfred speech bubble** — kruhový avatar + fialová bublina s textem
3. **Obsah** — specifický pro každý email (tabulka, tlačítko, kód...)
4. **Footer** — myalfred logo, hotel jméno, tel., email

### Alfred speech bubble vzor
```html
<table class="bubble-wrap">
  <tr>
    <td class="avatar-cell">
      <img src="[AVATAR_URL]" class="avatar" />
    </td>
    <td class="bubble-cell">
      <p>[ALFRED_TEXT]</p>
    </td>
  </tr>
</table>
```

### Info tabulka vzor
```html
<table class="info-table">
  <tr><td class="label">Číslo rezervace:</td><td class="value"><strong>20181471</strong></td></tr>
  <tr><td class="label">Termín:</td><td class="value">22. září 2023 – 23. září 2023</td></tr>
</table>
```

### Tlačítko vzor
```html
<a href="#" class="btn-primary">PROVÉST ONLINE CHECK-IN</a>
```

## Copy vzorce (z reálných emailů)

### Alfred mluví vždy v 1. osobě, oslovuje hosta Vy/Váš

| Email | Alfred říká |
|---|---|
| Pre-arrival 7 dní | "Vaše rezervace č. [X] začíná již za [N] dní, tedy [DATE]. Proto bych s Vámi nyní rád doplnil všechny potřebné údaje do Vaší ubytovací karty." |
| Pre-arrival dnes | "Vaše rezervace č. [X] začíná již dnes, tedy [DATE]. Proto bych s Vámi nyní rád doplnil všechny potřebné údaje do Vaší ubytovací karty." |
| Check-in dokončen | "Děkuji za doplnění údajů o hostech. Mám od Vás nyní vše potřebné." |
| Zrušení rezervace | "Dobrý den, potvrzuji, že Vaše rezervace v [HOTEL] byla zrušena. Nemusíte podnikat žádné další kroky." |
| Platba potvrzena | "Potvrzuji přijetí Vaší platby v hodnotě [AMOUNT]. Děkuji, že pro správu rezervace využíváte mých služeb." |
| PIN / klíč | "Nyní máte splněné veškeré předpříjezdové povinnosti a níže naleznete PIN, díky kterému se u nás můžete ubytovat." |
| Potvrzovací kód | "Dobrý den, obdržel jsem požadavek na přihlášení přes Váš e-mail. Pro bezpečné přihlášení klikněte na tlačítko níže." |

## GitHub

- **Previo repo:** https://github.com/paveltrnka-prog/alfred-emaily
- **GitHub Pages (živý přehled):** https://paveltrnka-prog.github.io/alfred-emaily/preview/
- Push: `git remote set-url previo https://TOKEN@github.com/paveltrnka-prog/alfred-emaily.git && git push previo main && git remote set-url previo https://github.com/paveltrnka-prog/alfred-emaily.git`
- PAT generovat na https://github.com/settings/tokens jako `paveltrnka-prog`, scope `repo`
- Osobní záloha: https://github.com/trnkapavel/alfred-e-maily

## UX principy — srozumitelnost a akce

Každý email musí splňovat tři věci, v tomto pořadí důležitosti:

### 1. Okamžitá jasnost — co se stalo?
- První věta Alfredovy bubliny = jednoznačné potvrzení situace. Host nesmí číst celý email, aby pochopil o co jde.
- Vzor: "Potvrzuji přijetí platby [AMOUNT]." / "Vaše rezervace byla zrušena." / "Váš PIN pro vstup je připraven."
- Nikdy nezačínat obecným pozdravem nebo kontextem — rovnou k věci.

### 2. Jedna hlavní akce — co mají udělat?
- Každý email má **maximálně jedno CTA tlačítko**. Pokud email jen informuje (platba přijata, zrušení), CTA není potřeba.
- Text tlačítka = konkrétní akce, ne obecné "Klikněte zde". Příklady: "PROVÉST ONLINE CHECK-IN", "ZOBRAZIT REZERVACI", "ZAPLATIT ONLINE".
- Tlačítko musí být vizuálně dominantní a tapovatelné na mobilu (min. výška 44px).

### 3. Rychlá informace — klíčová data na první pohled
- Info tabulka (číslo rezervace, termín, hotel) musí být přítomna u všech rezervačních emailů.
- Číselné hodnoty (částky, PIN, kódy) vizuálně zvýraznit — větší font nebo bold.
- Alfred text: max 2–3 věty. Pokud potřebuješ více, je toho příliš.

### Responsivita — funguje na všech zařízeních
Verify.mjs automaticky kontroluje:
- Žádný horizontální scroll na 320px, 375px, 700px
- Žádný element přetékající viewport
- CTA tlačítko viditelné v mobilním viewportu
- Obrázky mají alt atributy

Co verify nekontroluje (hlídá autor):
- Touch target min 44px výška na tlačítkách
- Kontrast textu na barevném pozadí bubliny

## Pravidla výstupu
- Čisté HTML, **bez PHP proměnných** (placeholdery jako `[HOTEL_NAME]`, `[RESERVATION_ID]` apod.)
- Inline CSS pro email kompatibilitu — žádné externí stylesheets
- Šířka emailu: **510px**, centrovaný
- **Žádné emoji** ve výstupu
- Zápatí vždy: "Alfred powered by Previo"
- Dynamické hodnoty: v hranatých závorkách `[VARIABLE]`

## Testovací data (vyplněna v souborech)
Pro účely review jsou placeholdery nahrazeny reálnými daty:
Hotel Pytloun Liberec, rezervace 20241471, host Jan Novák, 15.–18. července 2025.
Před předáním do PHP backendu je třeba placeholdery obnovit.

## Loop Engineering

### Binární exit condition (pro `--goal` a loop.sh)
Email PASSES pokud splní **všechny** podmínky z `verify.mjs`:
- `table width="510"` přítomno
- Font `Inter` přítomno
- Stavová barva přítomna (primární `#6F2F6A`, nebo akcentová dle stavu emailu — `#16a34a`, `#1d4ed8`, `#d97706`, `#c0392b`)
- Footer `Alfred powered by Previo` přítomno
- Žádné PHP tagy ani `$proměnné`
- Žádné externí CSS
- Alfred bublina a avatar přítomny
- Playwright renderuje stránku bez chyby (obsah > 50 znaků)
- Žádný horizontální scroll na 320px, 375px ani 700px
- Žádný element přetékající viewport
- Obrázky mají alt atributy

### Příkazy
```bash
npm run verify                           # zkontroluj všechny emaily
npm run verify guest/05-reservation-cancel.html  # jeden email
npm run loop                             # oprav všechny emaily (max 5 kol)
bash scripts/loop.sh guest/05-reservation-cancel.html  # oprav jeden email
```

### Claude Code `--goal` (headless)
```bash
claude --goal "node scripts/verify.mjs exits with code 0 for all emails" \
  --dangerously-skip-permissions --max-turns 10
```

### Verifier jako sub-agent (v Claude Code)
Po každé změně emailu použij Task tool:
```
You are a verifier. You did NOT write this email HTML.
Run: node scripts/verify.mjs [file]
Report only PASS or FAIL with specific rule names that failed. Nothing else.
```

### Loop flow
Proposer (Claude) → verify.mjs → PASS → git commit
                               → FAIL → Proposer dostane failure output → opakuj (max 5×)
