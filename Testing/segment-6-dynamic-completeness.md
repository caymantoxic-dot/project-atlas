# Segment 6 — Dinamička procena kompletnosti

## Cilj

Potvrditi da workflow računa kompletnost prema stvarnim obaveznim poljima za konkretnu vrstu zahteva, a ne prema jednoj fiksnoj listi.

## Automatska validacija

Pokrenuti:

```powershell
node Testing/validate-segment-6.mjs
```

Očekivanje: sve provjere prolaze.

## Živi n8n test

### Scenario 1 — generalno čišćenje

1. `ATLAS S6 TEST: Želim generalno čišćenje.`
2. `Stan je u Zemunu i ima 70 kvadrata.`
3. `Odgovara mi sledeća nedelja.`
4. `Telefon je 0601111111, zovem se Atlas Test.`

Očekivanje:

- status ide iz `collecting` u `ready_for_operator`;
- procenat raste do 100;
- `missing_required_fields` je na kraju prazan;
- nakon kompletnosti nema novog pitanja za lead podatke.

### Scenario 2 — FAQ

Poruka: `Da li vi donosite sredstva?`

Očekivanje:

- status je `informational`;
- `completeness_applicable` je `false`;
- nema pitanja za lead podatke.

### Scenario 3 — dubinsko pranje

Poruka: `Treba mi dubinsko pranje dve fotelje u Beogradu.`

Očekivanje:

- `item_details` se smatra poznatim iz istorije;
- obavezna polja se razlikuju od generalnog čišćenja;
- workflow ne traži tip objekta ni kvadraturu.
