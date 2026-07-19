# Project Atlas — Arhitektura platforme

## Svrha dokumenta

Ovaj dokument definiše referentnu arhitekturu platforme Project Atlas.

Opisuje:

- osnovne principe platforme,
- glavne sistemske module,
- odgovornosti svakog modula,
- tok podataka,
- upravljanje razgovorima,
- upravljanje leadovima,
- strukturu projekta,
- pravila razvoja,
- sigurnost,
- skalabilnost i budući razvoj.

Ovaj dokument ne predstavlja istoriju razvoja niti opis jedne konkretne verzije.

Istorija projekta, završene verzije i trenutno implementirane funkcionalnosti vode se u dokumentu:

`C:\Users\dalib\OneDrive\Dokumenti\GitHub\project-atlas\Docs\PROJECT.md`

---

# 1. Vizija platforme

Project Atlas je modularna AI platforma za automatizaciju komunikacije i poslovnih procesa.

Platforma nije vezana za:

- jednu firmu,
- jednu industriju,
- jedan AI model,
- jedan komunikacioni kanal,
- jedan workflow sistem,
- jednu bazu podataka.

Project Atlas treba da omogući razvoj različitih AI poslovnih uloga, kao što su:

- AI recepcionar,
- AI prodajni asistent,
- AI dispečer,
- AI korisnička podrška,
- AI asistent za zakazivanje,
- AI HR asistent,
- AI administrativni asistent.

Prvi modul platforme je:

`AI Receptionist`

Prva demonstraciona niša je:

`firme za čišćenje`

Prvi demonstracioni klijent je:

`Housekeeping Beograd`

Podaci konkretne firme moraju biti odvojeni od zajedničke logike platforme.

---

# 2. Glavni ciljevi platforme

## 2.1. Modularnost

Svaka veća odgovornost sistema mora biti odvojena u poseban modul.

Primeri:

- komunikacija,
- upravljanje workflow-om,
- AI odlučivanje,
- baza znanja,
- memorija razgovora,
- lead podaci,
- integracije,
- skladištenje podataka.

Promena jednog modula ne sme nepotrebno zahtevati promene ostalih modula.

## 2.2. Ponovna upotreba

Zajednička logika platforme treba da se koristi za više klijenata.

Za novog klijenta menjaju se prvenstveno:

- podaci firme,
- usluge,
- cene,
- poslovna pravila,
- lead polja,
- komunikacioni kanali,
- integracije.

Osnovni moduli platforme ostaju zajednički.

## 2.3. Pouzdani odgovori

AI mora da koristi odobrene izvore podataka.

Ne sme da izmišlja:

- usluge,
- cene,
- raspoložive termine,
- lokacije,
- pravila firme,
- rokove,
- garancije,
- pogodnosti.

Kada podatak nije dostupan, sistem mora jasno da navede da je potrebna provera operatera.

## 2.4. Prirodno vođenje razgovora

AI ne obrađuje samo poslednju korisničku poruku.

Mora da koristi:

- istoriju razgovora,
- trenutni Lead State,
- poslednju korisničku poruku,
- bazu znanja,
- poslovna pravila,
- trenutno stanje razgovora.

AI treba da pita samo ono što još nedostaje.

## 2.5. Strukturirano prikupljanje podataka

Podaci iz razgovora moraju se čuvati u strukturiranom obliku.

Primeri:

- session_id,
- ime i prezime,
- telefon,
- email,
- lokacija,
- vrsta usluge,
- tip objekta,
- kvadratura,
- željeni datum,
- tip klijenta,
- rezime zahteva,
- status lead-a,
- kompletan tok razgovora.

## 2.6. Skalabilnost

Platforma mora omogućiti:

- više firmi,
- više industrija,
- više AI uloga,
- više komunikacionih kanala,
- više baza znanja,
- više integracija,
- veliki broj razgovora,
- zamenu pojedinačnih tehnologija bez promene cele arhitekture.

---

# 3. Osnovni arhitektonski principi

## 3.1. Odvajanje podataka firme od sistemske logike

Podaci konkretne firme nalaze se u njenoj Knowledge Base strukturi.

Sistemska logika i ponašanje AI nalaze se u zajedničkim promptovima i workflow modulima.

## 3.2. Jedan razgovor — jedan session_id

Svaki razgovor dobija jedinstveni `session_id`.

Pravila:

- isti `session_id` predstavlja isti razgovor,
- isti razgovor dopunjava isti Lead State,
- nova sesija kreira novi razgovor,
- podaci različitih sesija ne smeju da se mešaju.

## 3.3. Jedan razgovor — jedan aktivni lead

Jedna aktivna sesija predstavlja jedan aktivni lead.

Kasnije platforma može podržati više zahteva istog klijenta, ali svaki zahtev mora imati zaseban identifikator.

## 3.4. Podaci se dopunjavaju, ne brišu

Nova poruka dopunjava postojeće podatke.

Prazne vrednosti ne smeju da obrišu već poznate podatke.

Stari podatak može biti zamenjen samo kada korisnik jasno navede ispravku.

Primer:

`Telefon nije 0601111111, već 0602222222.`

## 3.5. Tehnološka nezavisnost

Arhitektura ne sme biti vezana za:

- n8n,
- OpenAI,
- Google Sheets,
- Windows,
- jedan CRM,
- jednu bazu podataka.

Tehnologije predstavljaju implementaciju modula, a ne samu arhitekturu.

## 3.6. Proverljivost

Svaki važan deo sistema mora biti moguće:

- testirati,
- dokumentovati,
- verzionisati,
- izvesti,
- vratiti na prethodnu stabilnu verziju.

---

# 4. Referentna arhitektura platforme

Project Atlas se sastoji od sledećih slojeva:

```text
Communication Layer
        ↓
Workflow Engine
        ↓
Conversation Engine
        ↓
Knowledge Engine
        ↓
AI Engine
        ↓
Lead Engine
        ↓
Memory Engine
        ↓
Data Engine
        ↓
Integration Engine
```

Slojevi međusobno razmenjuju strukturirane podatke.

Nijedan sloj ne treba da preuzima odgovornosti koje pripadaju drugom sloju.

---

# 5. Glavni moduli

## 5.1. Communication Engine

Communication Engine prima i šalje poruke.

Mogući komunikacioni kanali:

- web chat,
- WhatsApp,
- Viber,
- Telegram,
- email,
- SMS,
- telefonski poziv,
- društvene mreže.

Odgovornosti:

- prijem korisničke poruke,
- prepoznavanje izvora poruke,
- preuzimanje identifikatora korisnika ili sesije,
- prosleđivanje poruke Workflow Engine-u,
- vraćanje odgovora korisniku.

Communication Engine ne odlučuje šta AI treba da odgovori.

## 5.2. Workflow Engine

Workflow Engine upravlja tokom obrade.

Odgovornosti:

- prijem podataka iz Communication Engine-a,
- pokretanje potrebnih modula,
- kontrola redosleda izvršavanja,
- prosleđivanje podataka između modula,
- obrada grešaka,
- čuvanje rezultata,
- pokretanje spoljnih integracija.

Workflow Engine može biti implementiran pomoću workflow platforme ili sopstvenog backend sistema.

## 5.3. AI Engine

AI Engine predstavlja centralni modul za razumevanje i odlučivanje.

Odgovornosti:

- razumevanje korisničke namere,
- korišćenje baze znanja,
- korišćenje istorije razgovora,
- korišćenje Lead State-a,
- određivanje nedostajućih podataka,
- izbor sledećeg pitanja,
- generisanje odgovora,
- priprema rezimea za operatera.

AI Engine nije vezan za jednog proizvođača modela.

## 5.4. Knowledge Engine

Knowledge Engine upravlja odobrenim informacijama firme.

Sadržaj može uključivati:

- podatke firme,
- usluge,
- cene,
- lokacije,
- česta pitanja,
- poslovna pravila,
- pravila zakazivanja,
- pravila za lead podatke,
- pravila uključivanja operatera.

Odgovornosti:

- učitavanje Knowledge Base fajlova,
- objedinjavanje sadržaja,
- pronalaženje relevantnih informacija,
- prosleđivanje podataka AI Engine-u.

## 5.5. Conversation Engine

Conversation Engine upravlja tokom razgovora.

Odgovornosti:

- čuvanje istorije razgovora,
- pamćenje poslednjeg pitanja AI,
- pamćenje poslednjeg odgovora korisnika,
- praćenje trenutne faze razgovora,
- prepoznavanje podataka koji još nedostaju,
- sprečavanje ponavljanja pitanja.

Primer faza razgovora:

- `new`,
- `answering_question`,
- `collecting_lead`,
- `waiting_for_information`,
- `ready_for_operator`,
- `completed`,
- `cancelled`.

## 5.6. Lead Engine

Lead Engine upravlja strukturiranim podacima klijenta i zahteva.

Primer Lead State objekta:

```json
{
  "session_id": "",
  "created_at": "",
  "updated_at": "",
  "source": "",
  "name": "",
  "phone": "",
  "email": "",
  "location": "",
  "service_type": "",
  "property_type": "",
  "square_meters": "",
  "desired_date": "",
  "customer_type": "",
  "request_summary": "",
  "status": "collecting",
  "notes": "",
  "conversation_text": ""
}
```

Odgovornosti:

- izdvajanje novih podataka,
- učitavanje postojećeg Lead State-a,
- spajanje starih i novih vrednosti,
- sprečavanje brisanja podataka praznim vrednostima,
- određivanje kompletnosti lead-a,
- menjanje statusa lead-a.

## 5.7. Memory Engine

Memory Engine čuva podatke potrebne za nastavak razgovora.

Vrste memorije:

### Kratkoročna memorija

Koristi se tokom jedne aktivne sesije.

Čuva:

- poslednje poruke,
- trenutni Lead State,
- poslednje pitanje,
- trenutno stanje razgovora.

### Dugoročna memorija

Koristi se za kasnije prepoznavanje korisnika i istorije saradnje.

Može čuvati:

- ranije zahteve,
- prethodne razgovore,
- prethodne usluge,
- istoriju kontakta,
- korisničke preference.

Dugoročna memorija se uvodi tek kada postoje jasna pravila privatnosti i pristupa.

## 5.8. Data Engine

Data Engine upravlja trajnim čuvanjem podataka.

Mogući sistemi:

- tabela,
- relaciona baza,
- dokument baza,
- CRM,
- skladište razgovora.

Odgovornosti:

- čuvanje leadova,
- čuvanje razgovora,
- čuvanje statusa,
- pretraga po identifikatorima,
- ažuriranje postojećih zapisa,
- sprečavanje duplikata.

## 5.9. Integration Engine

Integration Engine povezuje platformu sa spoljnim servisima.

Moguće integracije:

- CRM,
- kalendar,
- email,
- sistemi za poruke,
- telefonija,
- računovodstvo,
- sistemi za ponude,
- sistemi za naplatu,
- analitika.

Odgovornosti:

- slanje podataka spoljnim servisima,
- prijem podataka iz spoljnih servisa,
- autentifikacija,
- obrada grešaka,
- ponavljanje neuspelih poziva,
- beleženje rezultata integracije.

## 5.10. Prompt Engine

Prompt Engine upravlja ponašanjem AI modula.

Promptovi moraju biti odvojeni od podataka konkretne firme.

Vrste promptova:

- sistemsko ponašanje AI recepcionara,
- upravljanje razgovorom,
- izdvajanje lead podataka,
- priprema rezimea za operatera,
- klasifikacija korisničke namere,
- validacija rezultata.

## 5.11. Analytics Engine

Analytics Engine prati rad platforme.

Moguće metrike:

- broj razgovora,
- broj novih leadova,
- procenat kompletnih leadova,
- prosečan broj poruka po razgovoru,
- najčešće usluge,
- najčešća pitanja,
- broj prosleđivanja operateru,
- broj neuspelih razgovora,
- prosečno vreme odgovora.

Analytics Engine nije obavezan za osnovnu verziju, ali arhitektura mora omogućiti njegovo kasnije dodavanje.

---

# 6. Tok obrade poruke

Svaka nova poruka prolazi kroz sledeće korake:

## Korak 1 — Prijem poruke

Communication Engine prima:

- tekst poruke,
- identifikator sesije,
- izvor poruke,
- vreme prijema,
- dostupne podatke o korisniku.

## Korak 2 — Identifikacija razgovora

Sistem proverava da li `session_id` već postoji.

Ako ne postoji:

- kreira se nova sesija,
- kreira se novi Lead State,
- status razgovora postaje `new`.

Ako postoji:

- učitava se postojeća memorija,
- učitava se postojeći Lead State.

## Korak 3 — Učitavanje znanja

Knowledge Engine učitava informacije potrebne za trenutni zahtev.

## Korak 4 — Analiza poruke

AI Engine i Lead Engine prepoznaju:

- nameru korisnika,
- nova lead polja,
- ispravke postojećih podataka,
- pitanje korisnika,
- potrebu za operaterom.

## Korak 5 — Ažuriranje Lead State-a

Nove vrednosti se spajaju sa postojećim podacima.

Pravila:

- nove neprazne vrednosti dopunjavaju postojeće,
- prazne vrednosti ne brišu stare,
- jasna ispravka korisnika može promeniti staru vrednost.

## Korak 6 — Procena stanja

Conversation Engine proverava:

- koja polja postoje,
- koja polja nedostaju,
- da li korisniku treba odgovor,
- da li treba postaviti pitanje,
- da li je lead spreman za operatera.

## Korak 7 — Generisanje odgovora

AI Engine formira odgovor koristeći:

1. sistemska pravila,
2. Knowledge Base,
3. Conversation Context,
4. Lead State,
5. poslednju korisničku poruku.

## Korak 8 — Čuvanje

Data Engine čuva:

- ažurirani Lead State,
- ažurirani Conversation Context,
- kompletan tok razgovora,
- vreme poslednje izmene.

## Korak 9 — Slanje odgovora

Communication Engine vraća odgovor korisniku.

## Korak 10 — Pokretanje integracija

Kada su ispunjeni uslovi, Integration Engine može:

- obavestiti operatera,
- poslati email,
- kreirati CRM zapis,
- kreirati zadatak,
- pokrenuti proveru termina.

---

# 7. Životni ciklus razgovora

Razgovor može imati sledeće statuse:

## `new`

Nova sesija bez dovoljno informacija.

## `answering_question`

Korisnik traži informaciju, ali još ne želi konkretnu uslugu ili kontakt.

## `collecting_lead`

AI aktivno prikuplja podatke za obradu zahteva.

## `waiting_for_information`

Sistem čeka odgovor korisnika na konkretno pitanje.

## `ready_for_operator`

Prikupljeno je dovoljno podataka za operatera.

## `completed`

Zahtev je obrađen ili razgovor uspešno završen.

## `cancelled`

Korisnik je odustao ili je zahtev zatvoren.

Dozvoljeni osnovni prelazi:

```text
new
→ answering_question
→ collecting_lead
→ waiting_for_information
→ ready_for_operator
→ completed
```

Mogući alternativni prelazi:

```text
new → cancelled
collecting_lead → cancelled
waiting_for_information → collecting_lead
ready_for_operator → collecting_lead
```

---

# 8. Životni ciklus lead-a

Lead može imati sledeće statuse:

## `new`

Lead je kreiran.

## `collecting`

Podaci se još prikupljaju.

## `ready_for_operator`

Dovoljno podataka je prikupljeno.

## `operator_contacted`

Operater je preuzeo lead.

## `qualified`

Lead je potvrđen kao relevantan.

## `not_qualified`

Lead nije relevantan ili nije moguće realizovati zahtev.

## `converted`

Lead je postao klijent ili je usluga ugovorena.

## `closed`

Lead je završen.

Promena statusa mora biti zabeležena sa vremenom izmene.

---

# 9. Pravila kompletnosti lead-a

Lead nije kompletan samo zato što ima ime i telefon.

Kompletnost zavisi od:

- vrste usluge,
- poslovnih pravila firme,
- kanala komunikacije,
- namere korisnika.

Minimalni zajednički podaci za prosleđivanje operateru mogu uključivati:

- ime,
- telefon ili drugi kontakt,
- lokaciju,
- vrstu usluge,
- kratak opis zahteva.

Dodatna polja zavise od usluge.

Primer za čišćenje:

- tip objekta,
- kvadratura,
- željeni termin,
- dodatni zahtevi.

Pravila kompletnosti za konkretnu firmu nalaze se u njenoj Knowledge Base strukturi.

---

# 10. Prompt arhitektura

Promptovi se nalaze u:

`C:\Users\dalib\OneDrive\Dokumenti\GitHub\project-atlas\Prompts`

Planirana struktura:

```text
Prompts\
├── ai-receptionist.md
├── conversation-manager.md
└── operator-summary.md
```

## `ai-receptionist.md`

Definiše:

- ulogu AI recepcionara,
- stil komunikacije,
- osnovna ograničenja,
- pravila odgovaranja,
- pravila prikupljanja podataka.

## `conversation-manager.md`

Definiše:

- kako AI koristi Conversation Context,
- kako određuje šta nedostaje,
- kako bira sledeće pitanje,
- kako sprečava ponavljanje pitanja,
- kada završava razgovor.

## `operator-summary.md`

Definiše:

- format rezimea,
- obavezna polja,
- način označavanja nedostajućih podataka,
- način pripreme zahteva za operatera.

Promptovi ne smeju sadržati specifične cene ili podatke konkretne firme.

---

# 11. Knowledge Base arhitektura

Knowledge Base konkretnog klijenta nalazi se u zasebnom folderu.

Primer:

`C:\Users\dalib\OneDrive\Dokumenti\GitHub\project-atlas\Knowledge Base\Housekeeping`

Trenutna struktura:

```text
Knowledge Base\
└── Housekeeping\
    ├── Company.md
    ├── services.md
    ├── pricing.md
    ├── faq.md
    ├── rules.md
    └── lead.md
```

## `Company.md`

Sadrži:

- naziv firme,
- kontakt,
- adresu,
- radno vreme,
- osnovne informacije.

## `services.md`

Sadrži:

- vrste usluga,
- opis usluga,
- ograničenja usluga,
- podatke potrebne za određenu uslugu.

## `pricing.md`

Sadrži:

- okvirne cene,
- cenovne raspone,
- uslove za procenu,
- ograničenja davanja konačne cene.

## `faq.md`

Sadrži odgovore na česta pitanja.

## `rules.md`

Sadrži poslovna pravila firme.

## `lead.md`

Sadrži:

- obavezna lead polja,
- opciona polja,
- podatke potrebne za pojedine usluge,
- uslove za prosleđivanje operateru.

Za svakog novog klijenta kreira se zaseban Knowledge Base folder.

---

# 12. Folder struktura projekta

Glavna lokalna putanja:

`C:\Users\dalib\OneDrive\Dokumenti\GitHub\project-atlas`

Referentna struktura:

```text
project-atlas\
├── Assets\
├── Clients\
├── Docs\
│   ├── README.md
│   ├── PROJECT.md
│   └── ARCHITECTURE.md
├── Knowledge Base\
│   └── Housekeeping\
│       ├── Company.md
│       ├── services.md
│       ├── pricing.md
│       ├── faq.md
│       ├── rules.md
│       └── lead.md
├── Prompts\
│   ├── ai-receptionist.md
│   ├── conversation-manager.md
│   └── operator-summary.md
├── Testing\
│   └── housekeeping-test-questions.md
└── Workflows\
    ├── project-atlas-v0.3-knowledge-base.json
    └── project-atlas-v0.4-lead-capture.json
```

Novi fajlovi i folderi uvode se tek kada imaju jasno definisanu odgovornost.

---

# 13. Workflow arhitektura

Workflow mora biti organizovan u jasne faze:

```text
1. Trigger
2. Load Knowledge
3. Normalize Input
4. Load Existing State
5. Extract New Data
6. Merge State
7. Decide Next Action
8. Save State
9. Generate Response
10. Send Response
11. Trigger Integrations
```

Svaki node ili korak treba da ima jednu glavnu odgovornost.

Nazivi node-ova moraju jasno opisivati njihovu funkciju.

Primeri:

- `Load Knowledge Base`
- `Prepare Lead Data`
- `Find Existing Lead`
- `Merge Lead Data`
- `Generate AI Response`
- `Save Lead`
- `Notify Operator`

Workflow ne sme sadržati testne node-ove u stabilnoj eksportovanoj verziji.

---

# 14. Pravila razvoja projekta

## 14.1. Jedna sekcija u jednom trenutku

Ne započinje se sledeća sekcija dok prethodna nije:

- završena,
- testirana,
- dokumentovana,
- eksportovana,
- commitovana.

## 14.2. Jedan segment — jedan konkretan rezultat

Svaki segment mora imati jasno definisan rezultat.

## 14.3. Pune putanje

Instrukcije za lokalne fajlove moraju koristiti pune putanje.

## 14.4. Standard naziva fajlova

Koristi se `lowercase-kebab-case`.

Primer:

```text
project-atlas-v0.4-lead-capture.json
```

## 14.5. Verzije workflow-a

Svaka stabilna verzija workflow-a mora biti eksportovana u:

`C:\Users\dalib\OneDrive\Dokumenti\GitHub\project-atlas\Workflows`

## 14.6. Git istorija

Svaka završena celina mora imati jasan commit.

Primer:

```text
Complete Project Atlas v0.5 architecture
```

## 14.7. Testiranje pre commita

Pre commita mora se potvrditi da:

- workflow prolazi bez greške,
- podaci se čuvaju pravilno,
- više sesija se ne meša,
- AI ne ponavlja nepotrebna pitanja,
- stabilni fajlovi nemaju duplikate.

---

# 15. Sigurnost i privatnost

Platforma mora primenjivati sledeća pravila:

- API ključevi se ne čuvaju u GitHub repozitorijumu.
- OAuth tajne se ne unose u Markdown fajlove.
- Credential podaci ostaju u bezbednom credential sistemu.
- Lični podaci korisnika čuvaju se samo kada su potrebni.
- Pristup podacima mora biti ograničen.
- Logovi ne smeju nepotrebno sadržati poverljive podatke.
- Testni podaci ne treba da koriste stvarne osetljive podatke.
- Brisanje podataka mora biti moguće.
- Dugoročna memorija uvodi se tek nakon definisanja pravila privatnosti.

---

# 16. Obrada grešaka

Svaki važan korak mora imati definisano ponašanje u slučaju greške.

Primeri:

## Knowledge Base nije dostupna

AI ne daje nepouzdane odgovore.

Korisniku se saopštava da je potrebna provera operatera.

## Baza podataka nije dostupna

Sistem ne sme tvrditi da je lead sačuvan ako upis nije uspeo.

## AI model nije dostupan

Sistem vraća kontrolisanu poruku ili prosleđuje zahtev operateru.

## Integracija nije dostupna

Greška se beleži i pokušaj se može ponoviti.

## Neispravan korisnički unos

AI traži pojašnjenje bez brisanja postojećih podataka.

## Referentna implementacija pouzdanosti

Project Atlas v1.1 uvodi referentni obrazac za kontrolisane kvarove:

- ograničen retry za spoljne servise;
- posebne fallback kodove za Knowledge Base, skladište podataka, AI i internu obradu;
- zabranu potvrde prijema kada `saved` nije `true`;
- centralni n8n error workflow;
- redigovan operativni zapis u Google Sheets tabu `Errors`;
- odvojeno rutiranje Sheets rezultata i greške kako paralelne grane ne bi proizvele lažan uspeh.

Lokalni postupci za start, backup, vraćanje, čuvanje logova i obradu incidenta nalaze se u `Docs/operations-runbook.md`.

---

# 17. Skalabilnost

Platforma mora podržati rast u više pravaca.

## Više klijenata

Svaki klijent ima zasebnu konfiguraciju i Knowledge Base.

## Više AI uloga

Platforma može sadržati:

- AI Receptionist,
- AI Sales,
- AI Support,
- AI Dispatcher.

## Više kanala

Isti AI modul može primati poruke sa različitih kanala.

## Više modela

AI Engine može koristiti različite modele za različite zadatke.

Primer:

- jedan model za razgovor,
- drugi model za ekstrakciju podataka,
- treći model za rezime.

## Više sistema za podatke

Data Engine može kasnije preći sa jednostavne tabele na bazu podataka ili CRM.

---

# 18. Budući razvoj

Planirani pravci razvoja:

## Faza 1 — AI Receptionist

- pamćenje konteksta,
- inteligentno postavljanje pitanja,
- kompletiranje lead-a,
- rezime za operatera,
- stabilna verzija v1.0.

## Faza 2 — Komunikacioni kanali

- web chat,
- WhatsApp,
- Viber,
- Telegram,
- email.

## Faza 3 — CRM i operaterski rad

- CRM integracija,
- statusi leadova,
- zadaci za operatere,
- obaveštenja,
- istorija aktivnosti.

## Faza 4 — Zakazivanje

- kalendar,
- slobodni termini,
- potvrda termina,
- podsetnici.

## Faza 5 — Voice AI

- telefonski pozivi,
- prepoznavanje govora,
- sinteza govora,
- prosleđivanje operateru.

## Faza 6 — Analitika

- pregled razgovora,
- konverzije,
- kvalitet leadova,
- učinak AI modula,
- učinak komunikacionih kanala.

---

# 19. Kriterijumi za verziju v1.0

Project Atlas AI Receptionist može se smatrati stabilnom verzijom v1.0 kada:

- koristi kompletnu Knowledge Base,
- pamti kontekst razgovora,
- ne ponavlja već odgovorena pitanja,
- pravilno prikuplja lead podatke,
- jedan razgovor dopunjava jedan lead,
- različite sesije imaju odvojene leadove,
- prepoznaje kada je lead dovoljno kompletan,
- pravi strukturiran rezime zahteva,
- označava lead kao spreman za operatera,
- završava razgovor prirodno,
- prolazi definisane test scenarije,
- workflow je eksportovan,
- dokumentacija je ažurirana,
- verzija je commitovana.

---

# 20. Zaključak

Project Atlas je AI platforma, a ne rešenje za samo jednu firmu ili jednu poslovnu ulogu.

AI Receptionist predstavlja prvi proizvodni modul platforme.

Arhitektura je zasnovana na:

- modularnosti,
- tehnološkoj nezavisnosti,
- strukturiranim podacima,
- jasnom upravljanju razgovorom,
- odvojenim bazama znanja,
- kontrolisanom AI odlučivanju,
- skalabilnim integracijama.

Svaka naredna implementacija mora biti usklađena sa principima definisanim u ovom dokumentu.
