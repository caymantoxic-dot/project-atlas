# Segment 5/8 — Inteligentno naredno pitanje

## Cilj

AI odgovara na korisnikovu poruku, a zatim postavlja najviše jedno pitanje za najvažniji podatak koji nedostaje.

## Lokalna validacija

```powershell
& "C:\Program Files\nodejs\node.exe" Testing\build-segment-5.mjs
& "C:\Program Files\nodejs\node.exe" Testing\validate-segment-5.mjs
```

## Live scenariji

### 1. Razgovor ne izgleda kao formular

1. `Želim generalno čišćenje.`
2. Očekivanje: AI odgovara i pita samo za lokaciju.
3. `Stan je u Zemunu.`
4. Očekivanje: AI ne ponavlja uslugu ili lokaciju i pita samo za tip objekta.

### 2. Poznat objekat i kvadratura

1. `U pitanju je stan od 70 kvadrata.`
2. Očekivanje: AI priznaje oba podatka i pita samo za okvirni termin.

### 3. FAQ bez lead namere

1. Nova sesija: `Da li vi donosite sredstva?`
2. Očekivanje: AI odgovara na pitanje i ne započinje nepotrebno prikupljanje podataka.

### 4. Kontakt operatera

1. Nova sesija: `Molim da me operater pozove.`
2. Očekivanje: prvo pitanje traži samo broj telefona.

### 5. Dubinsko pranje

1. Nova sesija: `Treba mi dubinsko pranje na Novom Beogradu.`
2. Očekivanje: AI pita samo šta se pere i koliko komada.

## Kriterijum prolaza

- odgovor sadrži najviše jedno novo pitanje,
- poznati podaci se ne traže ponovo,
- `next_field`, `next_question` i `question_count` postoje u workflow stanju,
- FAQ bez lead namere ne pokreće formular,
- odgovor i dalje prolazi kroz čuvanje istorije razgovora.
