# Segment 4/8 — Pamćenje konteksta razgovora

## Cilj

Potvrditi da jedan `session_id` čuva kompletan redosled korisničkih i AI poruka, da AI koristi prethodni kontekst i da se različite sesije ne mešaju.

## Automatske provjere

Pokrenuti:

```powershell
& "C:\Program Files\nodejs\node.exe" Testing\validate-segment-4.mjs
```

Očekivani rezultat:

```text
Segment 4 validacija: 49/49 provjera je prošlo.
```

## Test scenariji u n8n chatu

### Scenario 1 — Nastavak istog razgovora

1. Korisnik: `Želim generalno čišćenje stana u Zemunu.`
2. AI treba da potvrdi uslugu i pita samo za podatak koji nedostaje.
3. Korisnik: `Stan ima 70 kvadrata.`
4. AI ne sme ponovo da pita za uslugu, lokaciju, tip objekta ili kvadraturu.

Očekivano u `conversation_text`:

- poruke su hronološke,
- svaka poruka ima oznaku `KORISNIK:` ili `AI:`,
- nema dupliranih blokova istorije.

### Scenario 2 — Pitanje koje menja tok

1. Nastaviti Scenario 1.
2. Korisnik: `Da li vi donosite sredstva?`
3. AI prvo odgovara da firma donosi profesionalna sredstva.
4. Tek zatim postavlja jedno relevantno pitanje ako je potrebno.

### Scenario 3 — Ispravka podatka

1. Korisnik: `Telefon nije 0601111111 nego 0602222222.`
2. U Lead State-u i Google Sheets redu mora ostati `0602222222`.
3. AI ne sme kasnije da koristi stari broj.

### Scenario 4 — Odvojene sesije

1. Otvoriti novu chat sesiju.
2. Poslati drugačiju uslugu i lokaciju.
3. Novi `session_id` mora dobiti novi red ili svoj zaseban zapis.
4. Istorija iz prve sesije ne sme da se pojavi u drugoj.

### Scenario 5 — Povrat odgovora nakon čuvanja

1. Poslati bilo koje validno pitanje.
2. Workflow mora završiti u node-u `Return Chat Response`.
3. Chat mora prikazati samo AI tekst, a ne cijeli Google Sheets objekat.

## Status

- Offline validacija workflow strukture: spremna.
- Live n8n test: čeka pokrenutu lokalnu n8n instancu.
