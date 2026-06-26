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

## Stavové barvy (Alfredova bublina)
| Stav | Bublina bg | Akcentová barva | Použití |
|---|---|---|---|
| Neutrální | `#f0e8ef` | `#6F2F6A` | pre-arrival, checkout reminder |
| Pozitivní | `#dcfce7` | `#16a34a` | platba přijata, check-in, PIN, služby |
| Čekající | `#dbeafe` | `#1d4ed8` | preautorizace, potvrzovací kód |
| Změna | `#fef3c7` | `#d97706` | změna termínu, snížení hostů |
| Problém | `#fde8e8` | `#c0392b` | zrušení, selhání platby, expirace |

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
- Push: `git push previo main` — vyžaduje PAT účtu `paveltrnka-prog` (generovat na https://github.com/settings/tokens)
- Osobní záloha: https://github.com/trnkapavel/alfred-e-maily

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
