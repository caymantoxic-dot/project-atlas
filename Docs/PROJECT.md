# Project Atlas

## Verzija

v0.3

## Status

Osnova sistema završena.

---

# Misija projekta

Project Atlas je AI automatizaciona platforma za mala i srednja preduzeća.

Prvi praktični proizvod je AI recepcionar za firme za čišćenje.

Cilj je da AI može da odgovara na pitanja klijenata koristeći bazu znanja konkretne firme.

---

# Trenutno završeno

## Sekcija 1/4 — Osnova sistema

### Segment 1/8 — Struktura projekta

Status: završeno

Urađeno:

- Napravljen GitHub repozitorijum
- Otvoren projekat u VS Code
- Napravljena osnovna struktura foldera
- Napravljen folder Docs
- Napravljen folder Knowledge Base
- Napravljen folder Workflows
- Napravljen folder Testing

---

### Segment 2/8 — Provera n8n okruženja

Status: završeno

Urađeno:

- Proveren n8n
- Proveren OpenAI credential
- Obrisani stari test workflow-i
- Pripremljeno čisto okruženje

---

### Segment 3/8 — Prvi AI chat

Status: završeno

Urađeno:

- Napravljen workflow Project Atlas v0.1
- Dodat Chat Trigger
- Dodat Basic LLM Chain
- Dodat OpenAI Chat Model
- AI uspešno odgovara kroz n8n chat

---

### Segment 4/8 — AI koristi bazu znanja

Status: završeno

Urađeno:

- Company.md kopiran u dozvoljeni n8n folder
- n8n uspešno čita Company.md
- Code node pretvara fajl u tekst
- Basic LLM Chain dobija pitanje korisnika i bazu znanja
- AI odgovara na osnovu baze znanja firme

---

### Segment 5/8 — Export workflow-a

Status: završeno

Urađeno:

- Workflow eksportovan iz n8n
- Workflow sačuvan u folder Workflows
- Workflow sačuvan u GitHub

Fajl:

Workflows/project-atlas-v0.2-knowledge-base.json

---

### Segment 6/8 — Ispravka naziva foldera

Status: završeno

Urađeno:

- Ispravljen naziv foldera Housekeeping
- Ažurirana putanja u GitHub projektu
- Ažurirana putanja u .n8n-files folderu
- Ažurirana putanja u n8n workflow-u
- Workflow ponovo testiran
- Workflow ponovo eksportovan

---

### Segment 7/8 — Test pitanja

Status: završeno

Urađeno:

- Napravljen folder Testing
- Napravljen fajl housekeeping-test-questions.md
- Definisana osnovna test pitanja za AI recepcionara

Fajl:

Testing/housekeeping-test-questions.md

---

### Segment 8/8 — Zaključavanje v0.2

Status: završeno

Urađeno:

- PROJECT.md ažuriran
- Verzija v0.2 dokumentovana
- Sekcija 1/4 završena

---

# Trenutna verzija proizvoda

Project Atlas v0.2

AI recepcionar može da:

- primi pitanje kroz n8n chat
- pročita Company.md
- pretvori bazu znanja u tekst
- pošalje pitanje i bazu znanja AI modelu
- odgovori korisniku na srpskom jeziku
- koristi podatke firme Housekeeping Beograd

---

# Trenutna struktura projekta

project-atlas/

- Assets/
- Clients/
- Docs/
  - README.md
  - PROJECT.md
- Knowledge Base/
  - Housekeeping/
    - Company.md
    - faq.md
    - pricing.md
    - rules.md
    - services.md
- Prompts/
- Testing/
  - housekeeping-test-questions.md
- Workflows/
  - project-atlas-v0.2-knowledge-base.json

---

---

# Sekcija 2/4 — Kvalitet baze znanja

Status: završeno

## Segment 1/8 — Sređivanje Company.md

Status: završeno

Urađeno:

- Sređen Company.md
- Podaci firme formatirani profesionalnije
- Dodata pravila za cene, zakazivanje, plaćanje i lokacije
- Fajl kopiran u .n8n-files

---

## Segment 2/8 — Popunjavanje services.md

Status: završeno

Urađeno:

- Dodati opisi usluga
- Definisano kada AI traži dodatne podatke
- Dodati primeri odgovora za svaku uslugu
- Fajl kopiran u .n8n-files

---

## Segment 3/8 — Popunjavanje pricing.md

Status: završeno

Urađeno:

- Dodate okvirne cene usluga
- Dodata pravila da AI ne sme da daje konačnu cenu bez dovoljno podataka
- Definisani podaci koje AI traži za procenu cene
- Fajl kopiran u .n8n-files

---

## Segment 4/8 — Popunjavanje faq.md

Status: završeno

Urađeno:

- Dodata česta pitanja
- Dodati preporučeni odgovori
- Dodata pitanja za kontakt, plaćanje, lokacije, cene i usluge
- Fajl kopiran u .n8n-files

---

## Segment 5/8 — Popunjavanje rules.md

Status: završeno

Urađeno:

- Definisana pravila ponašanja AI asistenta
- Definisana pravila za cene
- Definisana pravila za zakazivanje
- Definisana pravila za uključivanje operatera
- Fajl kopiran u .n8n-files

---

## Segment 6/8 — Testiranje AI odgovora

Status: završeno

Rezultat:

10/10

Urađeno:

- Testirana osnovna pitanja
- AI uspešno odgovara na pitanja iz baze znanja
- Rezultat upisan u Testing/housekeeping-test-questions.md

---

## Segment 7/8 — AI čita sve knowledge base fajlove

Status: završeno

Urađeno:

- Workflow promenjen da čita sve .md fajlove iz Housekeeping foldera
- Read/Write Files from Disk koristi *.md
- Code node spaja sve fajlove u jednu bazu znanja
- AI sada koristi:
  - Company.md
  - services.md
  - pricing.md
  - faq.md
  - rules.md
- Workflow eksportovan u Workflows/project-atlas-v0.2-knowledge-base.json

---

## Segment 8/8 — Zaključavanje v0.3

Status: završeno

Urađeno:

- PROJECT.md ažuriran
- Sekcija 2/4 dokumentovana
- Verzija v0.3 zaključana

---

# Trenutna verzija proizvoda

Project Atlas v0.3

AI recepcionar sada može da:

- primi pitanje kroz n8n chat
- pročita sve knowledge base fajlove
- spoji sve fajlove u jednu bazu znanja
- koristi podatke firme Housekeeping Beograd
- odgovara na srpskom jeziku
- ne izmišlja informacije
- traži dodatne podatke kada nema dovoljno informacija
- ne potvrđuje konačnu cenu bez dovoljno podataka
- ne potvrđuje termin bez provere rasporeda

---

# Sledeća sekcija

## Sekcija 3/4 — Prikupljanje kontakta i lead podataka

Cilj sledeće sekcije:

AI treba da počne da prikuplja podatke korisnika kada korisnik želi cenu, zakazivanje ili kontakt operatera.

Planirani segmenti:

1. Definisanje lead podataka
2. Ažuriranje prompta za prikupljanje kontakta
3. Dodavanje Google Sheets baze
4. Upis lead-a u Google Sheets
5. Testiranje prikupljanja lead-a
6. Ispravka grešaka
7. Export workflow-a
8. Zaključavanje v0.4