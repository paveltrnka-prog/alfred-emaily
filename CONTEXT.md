# CONTEXT.md — Alfred Email Redesign v2

## Co je Alfred
Alfred je PWA aplikace od Previo pro hotelové hosty. Umožňuje online check-in, správu klíčů, platby a objednávky služeb. Komunikuje s hostem i s hotelem přes transakční emaily.

Živá aplikace: https://alfred.previo.app  
Backend: PHP / Previo systém (sender třídy ve `share/lib/Previo/library/Previo/Alfred/`)

## Scope redesignu
Předělat **33 emailových šablon** z datovaného designu na moderní flat styl.

### Proč redesign
- Stávající design je zastaralý (fialové plochy, starý font, těžké layouty)
- Inspirace: `assets/inspirace.png` — čistý white minimal styl (similar to Airbnb/booking.com emails)
- Zachovat: Alfred avatar s bublinou (charakter brandu), myalfred logo

## Přehled emailů

### Pro hosta (19)
| Soubor | Trigger | Klíčový obsah |
|---|---|---|
| 01-pre-arrival-7days | 7 dní před příjezdem | Výzva k online check-in, tlačítko CTA, kód rezervace |
| 02-pre-arrival-today | V den příjezdu | Výzva k online check-in, tlačítko CTA, kód rezervace |
| 03-checkin-completed | Po dokončení check-in | Potvrzení, detail rezervace (termín, hosté) |
| 04-checkout-reminder | Před odjezdem | Připomínka check-out |
| 05-reservation-cancel | Po stornování | Potvrzení storna, kontakt hotelu |
| 06-reservation-date-change | Po změně termínu | Nový termín, detail |
| 07-guest-count-lowered | Po snížení počtu hostů | Nový počet hostů |
| 08-payment-online | Po online platbě | Částka, datum, číslo rezervace |
| 09-payment-terminal | Po platbě na terminálu | Částka, datum, číslo rezervace |
| 10-payment-fail | Po selhání platby | Instrukce k opakování |
| 11-preauth-terminal | Pre-autorizace na terminálu | Výše pre-autorizace |
| 12-preauth-cancel-online | Zrušení online pre-autorizace | Potvrzení vrácení |
| 13-alfred-confirmation-code | Registrace Alfred profilu | Magic link tlačítko, 24h platnost |
| 14-pin-info | Přidělení PIN kódu | Pokoj + PIN tabulka |
| 15-key-reminder | Připomínka klíče | Připomínka + link na přístup |
| 16-service-ordered | Po objednání služby | Detail objednávky |
| 17-ssbar-online | SSBar online platba | Položky, celková cena |
| 18-ssbar-terminal | SSBar terminál platba | Položky, celková cena |
| 19-group-pre-arrival | Pre-arrival — skupinová rezervace (více pokojů) | Detail za každý pokoj (check-in/out, hosté, noci) |

### Pro hotel (14)
| Soubor | Klíčový obsah |
|---|---|
| 01-checkin-completed | Hosté dokončili check-in, detail (jméno, email, tel) |
| 02-payment-online | Potvrzení přijaté platby |
| 03-payment-terminal | Potvrzení platby na terminálu |
| 04-payment-fail | Upozornění na selhání platby |
| 05-preauth-terminal | Přijatá pre-autorizace |
| 06-preauth-cancel-online | Zrušení pre-autorizace |
| 07-reservation-cancel | Host stornoval rezervaci |
| 08-reservation-date-change | Host změnil termín |
| 09-minibar | Konzumace z minibaru, položky + cena |
| 10-commission-failed | Selhání přiřazení komise |
| 11-service-ordered | Host objednal službu |
| 12-ssbar-online | SSBar objednávka (online platba) |
| 13-ssbar-terminal | SSBar objednávka (terminál) |
| 14-expired-preauth | Upozornění na expirující pre-autorizaci |

## Koncepty (rozpracované návrhy, mimo finálních 33)
| Soubor | Popis |
|---|---|
| 20-mascot-concept | Varianta 01-pre-arrival-7days s hero foto pokoje nahrazeným 3D maskotem Alfreda na branded fialovém pozadí (`assets/alfred-mascot.png`) |
| 21-dark-mode-concept | Varianta 01-pre-arrival-7days inspirovaná booking.com potvrzovacím e-mailem: přidán price breakdown, cancellation policy a platební bezpečnostní upozornění, plus podpora dark mode přes `prefers-color-scheme` (funguje v Apple Mail/iOS Mail/Outlook.com/Thunderbirdu; Gmail si barvy invertuje sám) |

## Existující screenshoty
Všechny screenshoty stávajících emailů jsou v `resources/screenshots/`.
Slouží **pouze jako reference pro copy a obsah**, ne pro design.

## Klíčová rozhodnutí designu

### Co zachovat
- Alfred avatar s speech bubblou (charakter produktu)
- myalfred logo v zápatí
- "Alfred powered by Previo" v patičce
- Oslovování Vykáním (Vy/Váš)

### Co změnit
- Pozadí: z šedofialového na čistou bílou/světle šedou
- Font: Inter (moderní, čitelný)
- Barvy: pouze #6F2F6A jako primární, jinak černá a šedé tóny
- Layout: více whitespace, jednodušší struktura
- Tlačítka: flat, bez gradientů, border-radius 4px

### Co přidat (nové)
- Hero obrázek hotelu v headeru (hotel.jpg jako placeholder)
- Čistší tabulky s jemným borderem místo šedého pozadí

## Technické poznámky
- Email šířka: 600px max, centrovaný table layout
- Inline CSS (email klienti nepodporují stylesheets)
- Dynamické hodnoty: `[HOTEL_NAME]`, `[RESERVATION_ID]`, `[ARRIVAL_DATE]` apod.
- Fallback font: Arial, sans-serif
- Obrázky: absolutní URL (ve finální integraci nahradí PHP)
