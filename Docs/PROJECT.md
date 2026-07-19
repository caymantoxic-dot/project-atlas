# Project Atlas

## Verzija

v0.3

## Status

Kvalitet baze znanja završen.

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

# Verzija posle Sekcije 1/4

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
  - project-atlas-v0.3-knowledge-base.json

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
- Workflow eksportovan u Workflows/project-atlas-v0.3-knowledge-base.json

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

# Sekcija 3/4 — Prikupljanje kontakta i lead podataka

Status: završeno

## Segment 7/8 — Export workflow-a

Status: završeno

Urađeno:

- Workflow eksportovan
- Sačuvan u GitHub projektu

Fajl:

Workflows/project-atlas-v0.4-lead-capture.json

---

## Segment 8/8 — Zaključavanje v0.4

Status: završeno

Urađeno:

- PROJECT.md ažuriran
- Sekcija 3/4 dokumentovana
- Verzija v0.4 zaključana

---

# Trenutna verzija proizvoda

Project Atlas v0.4

AI recepcionar sada može da:

- odgovara koristeći kompletnu bazu znanja
- prikuplja lead podatke tokom razgovora
- kreira jedan lead po chat sesiji
- dopunjava isti lead tokom razgovora
- upisuje i ažurira podatke u Google Sheets
- razlikuje više klijenata preko session_id
- čuva kompletan tok razgovora u conversation_text

---

# Sledeća sekcija

## Sekcija 4/4 — AI Receptionist

Cilj:

Napraviti AI recepcionara koji vodi kompletan razgovor sa klijentom i inteligentno prikuplja samo informacije koje nedostaju.

Planirani segmenti:

1. Pamćenje konteksta razgovora
2. Inteligentno postavljanje narednog pitanja
3. Dinamička procena da li ima dovoljno podataka
4. Generisanje rezimea zahteva
5. Prosleđivanje operateru
6. Poboljšanje prompta
7. Finalno testiranje
8. Zaključavanje verzije v1.0
---

## Segment 2/8 — Standardizacija Prompt Engine-a

Status: završeno

Urađeno:

- Kreiran Prompt Engine.
- Razdvojene odgovornosti AI modula.
- Kreiran zajednički sistem pravila.
- Definisan Conversation Manager.
- Definisan Lead Extraction modul.
- Definisan Operator Summary modul.
- AI Receptionist povezan sa svim prompt modulima.

Kreirani fajlovi:

C:\Users\dalib\OneDrive\Dokumenti\GitHub\project-atlas\Prompts\

- ai-receptionist.md
- system-rules.md
- conversation-manager.md
- lead-extraction.md
- operator-summary.md
---

## Segment 3/8 — Povezivanje Prompt Engine-a sa n8n

Status: Završeno

### Urađeno

- Napravljen workflow `Project Atlas v0.5 - AI Receptionist`.
- Knowledge Base učitava Markdown fajlove.
- Prompt Engine učitava 5 prompt fajlova.
- Dodat node `Combine Prompt Files`.
- Prompt fajlovi objedinjeni u jedan `promptEngine`.
- `Basic LLM Chain` koristi dinamički `promptEngine`.
- Lead State ostaje sačuvan tokom celog workflow-a.
- Workflow uspešno testiran.
- Workflow eksportovan.
- Commit i Push završeni.

### Workflow

```
When chat message received
        │
Read/Write Files from Disk
        │
Code in JavaScript
        │
Prepare Lead Data
        │
Find Existing Lead
        │
Merge Lead Data
        │
Append or update row in sheet
        │
Load Prompt Files
        │
Combine Prompt Files
        │
Basic LLM Chain
        │
OpenAI Chat Model
```

### Eksport

```
C:\Users\dalib\OneDrive\Dokumenti\GitHub\project-atlas\Workflows\project-atlas-v0.5-ai-receptionist-segment-3.json
```

---

## Segment 4/8 — Pamćenje konteksta razgovora

Status: završeno

Urađeno:

- istorija razgovora se čuva po `session_id`;
- korisničke i AI poruke se upisuju hronološki u `conversation_text`;
- poznata lead polja se prenose u svaki naredni odgovor;
- ponovljena pitanja za već poznate podatke su uklonjena;
- workflow je uvezen i testiran u n8n.

Eksport:

`Workflows/project-atlas-v0.5-ai-receptionist-segment-4.json`

---

## Segment 5/8 — Inteligentno naredno pitanje

Status: završeno

Urađeno:

- dodat čvor `Select Next Question`;
- workflow bira tačno jedno najvažnije pitanje;
- poznata polja se automatski preskaču;
- čisti FAQ upiti ne pokreću lead prikupljanje;
- automatska validacija: 55/55;
- živi n8n test je prošao za višekoračni razgovor i FAQ;
- Segment 5 je objavljen kao jedini aktivni AI Receptionist workflow.

Eksport:

`Workflows/project-atlas-v0.5-ai-receptionist-segment-5.json`

---

## Segment 6/8 — Dinamička procena kompletnosti

Status: završeno

Lokalno završeno:

- dodat čvor `Evaluate Lead Completeness`;
- obavezna polja zavise od vrste usluge i namere korisnika;
- workflow računa `completion_percent` i `missing_required_fields`;
- statusi su `informational`, `collecting` i `ready_for_operator`;
- automatska validacija: 67/67.

- živi n8n test potvrdio je prelaz `collecting` → `ready_for_operator` i 100%;
- potvrđena verzija je objavljena u n8n.

Eksport:

`Workflows/project-atlas-v0.5-ai-receptionist-segment-6.json`

---

## Segment 7/8 — Rezime i predaja operateru

Status: završeno

Urađeno:

- dodat čvor `Prepare Operator Handoff`;
- kompletan zahtev dobija strukturiran `operator_summary`;
- rezime se čuva u `notes` koloni Google Sheets zapisa;
- kanal predaje je označen kao `google_sheets`;
- završni status je `handed_off`;
- korisnik dobija kratku potvrdu bez internog rezimea;
- automatska validacija: 23/23.

Eksport:

`Workflows/project-atlas-v0.5-ai-receptionist-segment-7.json`

---

## Segment 8/8 — Zaključavanje Project Atlas v1.0

Status: završeno

Urađeno:

- finalni workflow ima 17 jedinstvenih čvorova;
- objedinjeni su memorija, izbor pitanja, kompletnost, rezime i predaja;
- finalna regresiona validacija: 21/21;
- finalni eksport je uvezen i end-to-end testiran u n8n;
- potvrđeni v1.0 workflow je jedini aktivni objavljeni AI Receptionist;
- verzija proizvoda zaključana kao Project Atlas v1.0.

Finalni eksport:

`Workflows/project-atlas-v1.0-ai-receptionist.json`

---

## Korektivno izdanje v1.0.1

Status: završeno i objavljeno u lokalnom n8n-u

Datum završne provere: 19.07.2026.

Urađeno:

- ispravljeno je prepoznavanje izraza `za firmu` kao pravnog lica;
- dodate su padežne varijante za poslovni prostor i kancelariju;
- poslovni zahtev sada pravilno popunjava `customer_type` i `property_type`;
- automatska validacija v1.0.1: 26/26;
- živi poslovni scenario, korekcija telefona i korekcija kvadrature su prošli;
- v1.0.1 je jedini aktivni Project Atlas workflow, a v1.0 je isključen;
- potvrđeni testni redovi 6–9 uklonjeni su iz Google Sheets tabele.

Korektivni eksport:

`Workflows/project-atlas-v1.0.1-ai-receptionist.json`

---

## Project Atlas v1.1 — pouzdanost, greške i bezbednost

Status: završeno i objavljeno u lokalnom n8n-u

Datum završne provere: 20.07.2026.

Urađeno:

- spoljni Knowledge Base, Google Sheets i AI koraci imaju ograničen retry;
- uvedeni su kontrolisani fallback odgovori koji ne daju lažnu potvrdu korisniku;
- Sheets rezultat i greška prolaze kroz tri posebne IF kontrole, bez paralelne lažne uspešne grane;
- napravljen je centralni `Project Atlas v1.1 - Error Handler`;
- greške se rediguju i upisuju u Google Sheets tab `Errors` kao operativni redovi `OPEN` ili testni redovi `TEST`;
- napravljen je i provereno otvoren hladni backup baze, konfiguracije, Atlas fajlova i v1.1 eksporta;
- n8n je restartovan i `/healthz` je vratio HTTP 200;
- startni log je aktivirao tačno v1.1, dok je v1.0.1 isključen;
- automatska validacija v1.1: 88/88;
- živi testovi Knowledge Base, Sheets, AI i centralnog error workflow-a su prošli;
- testni lead `unknown-session` obrisan je preciznom zaštitom i naknadna pretraga je vratila prazan rezultat;
- tajne, baza i n8n `config` nisu uneti u Git.

Eksporti:

- `Workflows/project-atlas-v1.1-ai-receptionist.json`
- `Workflows/project-atlas-v1.1-error-handler.json`

Dokaz i operativna procedura:

- `Testing/segment-2-reliability.md`
- `Docs/operations-runbook.md`

---

# Trenutna verzija proizvoda

Project Atlas v1.1

AI recepcionar sada može da:

- odgovara iz kompletne baze znanja;
- pamti cijeli razgovor po sesiji;
- izvlači i dopunjava lead podatke;
- postavlja tačno jedno relevantno naredno pitanje;
- dinamički procjenjuje kompletnost prema vrsti usluge;
- prestaje sa pitanjima kada je zahtev kompletan;
- generiše operaterski rezime;
- predaje kompletan zapis operateru kroz Google Sheets;
- čuva završni status `handed_off`;
- ponavlja privremeno neuspele spoljne korake u kontrolisanim granicama;
- vraća bezbedan odgovor bez lažne potvrde kada Knowledge Base, Google Sheets ili AI nisu dostupni;
- beleži redigovane incidente u centralnom `Errors` tabu;
- može da se oporavi iz dokumentovanog i proverenog backup-a.

---

# Nastavak razvoja posle v1.1

AI Receptionist v1.1 je stabilan lokalni modul, ali komercijalni MVP cele platforme još nije završen.

Dalji rad se vodi prema dokumentu `Docs/master-roadmap.md`. Sledeći korak je Segment 3/8 — stvarna predaja operateru.
