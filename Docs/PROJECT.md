# Project Atlas

## Verzija

v0.2

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

# Sledeća sekcija

## Sekcija 2/4 — Kvalitet baze znanja

Cilj sledeće sekcije:

Srediti bazu znanja tako da AI daje tačnije, korisnije i prodajno bolje odgovore.

Planirani segmenti:

1. Sređivanje Company.md
2. Popunjavanje services.md
3. Popunjavanje pricing.md
4. Popunjavanje faq.md
5. Popunjavanje rules.md
6. Testiranje AI odgovora
7. Ispravka loših odgovora
8. Zaključavanje v0.3