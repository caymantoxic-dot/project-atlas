# Segment 2/8 — Pouzdanost, greške i bezbednost

Datum završne provere: 20.07.2026.

## Rezultat

Segment 2 je tehnički prihvaćen za objavu kao Project Atlas v1.1.

- automatska validacija: **88/88**;
- glavni workflow: **24 jedinstvena čvora**;
- error workflow: **3 jedinstvena čvora**;
- retry zaštita: najviše 3 pokušaja, sa kontrolisanim razmakom;
- fallback odgovori nikada ne tvrde da je neuspešan zahtev sačuvan ili potvrđen;
- privremeni testni okidači i čvorovi uklonjeni su posle svake probe.

## Živi testovi

### Centralni error workflow — PASS

- Pokrenut je izolovani kontrolisani kvar.
- `Error Trigger` je prosledio zapis kroz `Sanitize Error Record`.
- Telefon i email se rediguju, stack se ne upisuje, a poruka je ograničena na 500 znakova.
- U Google Sheets tabu `Errors` napravljen je zapis sa statusom `TEST`.
- Kvar samog upisa greške ne može da pokrene beskonačnu petlju.

### Nedostupna Knowledge Base — PASS

- Putanja baze znanja privremeno je zamenjena nepostojećom putanjom.
- Retry zaštita je izvršena pre fallback odgovora.
- Završni rezultat: `KNOWLEDGE_UNAVAILABLE`, `saved: false`.
- Korisniku nije prikazana izmišljena informacija niti potvrda zahteva.

### Nedostupan Google Sheets — PASS posle korekcije

Prva izolovana proba otkrila je da kombinacija `alwaysOutputData` i posebnog error izlaza može paralelno da pošalje prazan glavni izlaz i grešku. Pre objave je ugrađena korekcija:

- Sheets čvorovi koriste jedan kontrolisani izlaz;
- tri IF kontrole razdvajaju rezultat od greške;
- samo rezultat bez greške nastavlja normalan tok;
- samo greška ide na `Return Sheets Failure`.

Ponovljena izolovana proba nije imala nijedan čvor za upis i završila se samo na:

- `failure_code: DATA_STORE_UNAVAILABLE`;
- `saved: false`;
- jasnoj poruci da zahtev nije označen kao primljen.

### Nedostupan AI model — PASS

- OpenAI credential je u izolovanoj probi zamenjen nepostojećim testnim ID-em.
- Model je pokušao 3 puta.
- Uspešna grana nije pokrenuta.
- Završni rezultat: `AI_UNAVAILABLE`, `saved: false`.

## Čišćenje testnih podataka

Neuspešna rana Sheets proba napravila je jedan zapis `unknown-session` u redu 7 taba `Leads`.

- red je ponovo pročitan i potvrđen kombinacijom `row_number = 7` i `session_id = unknown-session`;
- obrisan je samo taj red;
- naknadna pretraga vratila je prazan rezultat;
- nijedan drugi lead red nije obrisan.

## Backup i restart — PASS

- pošto je n8n proces bio aktivan, baza je kopirana ugrađenim SQLite online backup postupkom umesto običnim kopiranjem aktivnog fajla;
- konzistentni backup je napravljen van Git repozitorijuma i OneDrive projekta;
- backup sadrži bazu, odgovarajući `config`, Atlas lokalne fajlove i oba v1.1 workflow eksporta;
- kopirana SQLite baza je otvorena kao samostalna restore proba;
- `PRAGMA integrity_check` je vratio `ok`;
- potvrđeno je prisustvo v1.0.1, v1.1 i error workflow-a;
- n8n je ponovo pokrenut, a `/healthz` je vratio HTTP 200 i `status: ok`.

Provereni završni hladni backup:

`C:\Users\dalib\.n8n\backups\project-atlas-segment-2-cold-20260720-002656`

## Objava i završni restart — PASS

- v1.1 je objavljen tek nakon uspešnog hladnog backup-a;
- potvrđeno je da je v1.1 aktivan pre gašenja v1.0.1;
- v1.0.1 je zatim isključen;
- n8n je ponovo pokrenut;
- `/healthz` je vratio HTTP 200 i `status: ok`;
- startni log je aktivirao tačno `Project Atlas v1.1 - AI Receptionist`;
- n8n je obradio tačno jedan objavljeni workflow.

Javni Chat Trigger ostaje isključen i zato javna webhook adresa vraća 404 bez pokretanja izvršenja ili pravljenja lead reda. Javni web chat je predmet Segmenta 4. Lokalni v1.1 prihvat zasniva se na živim izolovanim n8n testovima, automatskoj validaciji i potvrđenom restartu aktivnog workflow-a.

## Stabilni eksporti

- `Workflows/project-atlas-v1.1-ai-receptionist.json`
- `Workflows/project-atlas-v1.1-error-handler.json`

Kredencijali, tokeni, n8n baza i n8n `config` nisu deo Git repozitorijuma.
