# Project Atlas — MASTER ROADMAP

Datum poslednje provere: 20.07.2026.

Ovaj dokument je glavni redosled rada od završenog AI Receptionist modula do proizvoda koji može da se instalira i naplaćuje klijentu.

## Šta znači „završeno”

- **AI Receptionist v1.1:** stabilno lokalno izdanje. Glavni workflow i error workflow su eksportovani, testirani, dokumentovani i objavljeni u lokalnom n8n-u.
- **Komercijalni MVP:** nije još završen. Mora da radi javno, obavesti operatera, podrži zakazivanje, kontroliše greške i ima postupak instalacije za klijenta.
- **Poslovni cilj 2.000 EUR mesečno:** ostvaren je tek kada aktivni klijenti zajedno donose najmanje 2.000 EUR mesečnog prihoda. To nije samo tehnički korak.

## Potvrđeno stanje v1.1

- Segment 4 validacija: 49/49.
- Segment 5 validacija: 55/55.
- Segment 6 validacija: 67/67.
- Segment 7 validacija: 23/23.
- Završna v1.0 validacija: 21/21.
- Korektivna v1.0.1 validacija: 26/26.
- Segment 2 / v1.1 validacija: 88/88.
- Trenutni glavni workflow: `Workflows/project-atlas-v1.1-ai-receptionist.json`.
- Centralni error workflow: `Workflows/project-atlas-v1.1-error-handler.json`.
- v1.1 je jedini aktivni Project Atlas AI Receptionist; v1.0.1 i v1.0 su isključeni.
- Živi testovi su potvrdili paralelne sesije, ispravke telefona i kvadrature, FAQ, dubinsko pranje i poslovni scenario.
- Živi failure testovi su potvrdili kontrolisane kvarove Knowledge Base, Google Sheets i AI-ja bez lažne potvrde korisniku.
- Error workflow je upisao redigovan `TEST` zapis u Google Sheets tab `Errors`.
- Proveren je hladni backup `C:\Users\dalib\.n8n\backups\project-atlas-segment-2-cold-20260720-002656` i restart n8n-a.
- Testni Google Sheets redovi 6–9 uklonjeni su 19.07.2026; pretraga za `ATLAS` vratila je 0 rezultata.
- Dodatni probni lead `unknown-session` precizno je uklonjen; naknadna pretraga vratila je prazan rezultat.
- Google Sheets trenutno služi kao evidencija leadova i istorije razgovora.

## Poznata ograničenja trenutne verzije

- `handed_off` znači da je rezime upisan u Google Sheets; operater još ne dobija stvarnu email ili drugu notifikaciju.
- Chat radi u lokalnom n8n okruženju; još nema javnu produkcionu adresu.
- Knowledge Base i promptovi učitavaju se sa lokalne putanje i moraju se prilagoditi produkcionom serveru.
- Nema Google Calendar zakazivanja, potvrda ni podsetnika.
- `Errors` tab je trenutno operativni red grešaka koji se pregleda ručno; automatska email notifikacija operateru uvodi se u Segmentu 3.
- Ponovno učitavanje ručnog n8n chata stvara novi `session_id`; trajni nastavak sesije mora da se reši u javnom web chatu u Segmentu 4.
- Javni Chat Trigger nije uključen; javna webhook adresa namerno nije dostupna do Segmenta 4.
- Nema pripremljenog instalacionog paketa, sajta, demo snimka, cenovnika, ugovora i pilot-klijenta.

---

# Put do komercijalnog MVP-a

## Segment 1/8 — Stabilizacija izdanja i puna prihvatna provera

Status: završeno

Urađeno:

- sređeni su README i nazivi dokumentacije;
- napravljena je završna matrica živih testova;
- testirane su odvojene sesije, ispravke podataka i nastavak razgovora;
- potvrđeno je da se poznati podaci ne traže ponovo;
- pronađene greške su evidentirane, a poslovna morfologija je ispravljena u v1.0.1;
- potvrđeni testni zapisi su uklonjeni;
- automatske validacije i živi rezultati zabeleženi su u `Testing/v1.0-live-acceptance.md`.

Završeno kada:

- svi automatski i živi v1.0 testovi imaju zabeležen rezultat;
- dokumentacija odgovara stvarnom workflow-u;
- Git radno stablo je čisto i postoji jasan release zapis.

## Segment 2/8 — Pouzdanost, greške i bezbednost

Status: završeno

Urađeno:

- dodati su kontrolisani odgovori kada AI, Google Sheets ili Knowledge Base nisu dostupni;
- napravljen je n8n error workflow i `Errors` operativni red;
- uvedeno je bezbedno ponavljanje spoljnih koraka;
- Sheets greške i uspesi razdvojeni su bez paralelne lažne uspešne grane;
- definisani su čuvanje logova, backup, vraćanje sistema i obrada incidenta;
- provereno je da tajne i lični podaci nisu u Git repozitorijumu;
- napravljen je dokaz testova u `Testing/segment-2-reliability.md`;
- napravljeno je operativno uputstvo `Docs/operations-runbook.md`.

Dokaz završetka:

- simulirani kvarovi ne proizvode lažnu potvrdu korisniku;
- incident se upisuje u `Errors` tab sa redigovanom porukom;
- postoji proverena procedura oporavka i hladni backup;
- v1.1 je objavljen, v1.0.1 isključen, a restart je aktivirao tačno v1.1.

## Segment 3/8 — Stvarna predaja operateru

Status: sledeći

Uraditi:

- zadržati Google Sheets kao evidenciju;
- poslati stvarnu email notifikaciju operateru sa strukturiranim rezimeom;
- dodati jasan status slanja i zaštitu od duplih obaveštenja;
- napraviti jednostavan operaterski pregled statusa leadova.

Završeno kada:

- kompletan lead jednom i samo jednom obavesti operatera;
- neuspešna notifikacija se beleži i može ponoviti;
- sistem ne tvrdi korisniku da je predaja uspela ako nije.

## Segment 4/8 — Produkciono okruženje i javni web chat

Status: nije započeto

Uraditi:

- postaviti n8n u stabilno produkciono okruženje;
- ukloniti zavisnost od lokalnih Windows putanja;
- uključiti HTTPS, produkcionu adresu i bezbedno čuvanje kredencijala;
- povezati javni web chat sa demonstracionom stranicom;
- proveriti restart, dostupnost i rezervnu kopiju.

Završeno kada:

- korisnik van lokalnog računara može da završi ceo razgovor;
- sistem nastavlja da radi posle restarta;
- tajne nisu u workflow eksportu ili GitHub-u.

## Segment 5/8 — Google Calendar i potvrda termina

Status: nije započeto

Uraditi:

- proveravati slobodne termine;
- kreirati termin tek posle korisnikove potvrde;
- sprečiti duplo zakazivanje;
- poslati potvrdu i podsetnik;
- koristiti vremensku zonu Europe/Belgrade.

Završeno kada:

- testni termin prolazi od razgovora do kalendara i potvrde;
- zauzet termin se ne može rezervisati;
- otkazivanje ili promena ne ostavljaju pogrešan status.

## Segment 6/8 — WhatsApp i komunikacioni kanali

Status: nije započeto

Uraditi:

- povezati zvanični WhatsApp kanal kada Meta nalog i broj budu spremni;
- normalizovati poruke tako da isti AI modul radi u web chatu i WhatsApp-u;
- sačuvati identitet kanala i sesije;
- definisati pravilo prelaska na čoveka.

Završeno kada:

- isti ključni scenariji prolaze kroz web chat i WhatsApp;
- poruke i sesije se ne mešaju;
- operater može da preuzme razgovor.

Viber, Telegram i Voice AI ostaju naredne faze, osim ako prvi pilot-klijent izričito zahteva jedan od tih kanala.

## Segment 7/8 — Paket za instalaciju i prodaju

Status: nije započeto

Uraditi:

- napraviti konfiguraciju za novu firmu bez menjanja osnovne logike;
- pripremiti onboarding i instalacionu kontrolnu listu;
- pripremiti sajt, demo video, cenovnik i jasnu ponudu;
- pripremiti nacrt ugovora, pravila privatnosti i podrške;
- definisati šta ulazi u jednokratnu instalaciju, a šta u mesečnu pretplatu.

Završeno kada:

- nova housekeeping firma može da dobije sopstvenu bazu znanja, tabelu, kalendar i kontakte prema dokumentovanom postupku;
- demo i prodajni materijali prikazuju stvarni sistem;
- cena i obim usluge su jasni pre prodajnog razgovora.

## Segment 8/8 — Pilot, završna validacija i lansiranje

Status: nije započeto

Uraditi:

- instalirati sistem jednom stvarnom pilot-klijentu;
- pratiti razgovore, greške, procenat kompletnih leadova i vreme reakcije operatera;
- ispraviti kritične probleme;
- potpisati prihvat pilot-verzije;
- napraviti finalni eksport, backup, dokumentaciju, Git tag i release;
- započeti planski outreach do cilja od 2.000 EUR mesečno.

Završeno kada:

- pilot radi najmanje 7 uzastopnih dana bez kritične greške;
- klijent potvrdi da leadovi i termini stižu ispravno;
- postoji ponovljiv postupak instalacije za sledećeg klijenta;
- komercijalni MVP ima finalni release.

---

# Obavezno učešće vlasnika projekta

Codex može da pripremi fajlove, workflow-e, testove, dokumentaciju i tehničku konfiguraciju. Vlasnik projekta mora lično da odobri ili obezbedi:

- produkcioni hosting i domen pre kupovine;
- pristup poslovnom email-u i Google Calendar-u;
- Meta Business/WhatsApp nalog i telefonski broj;
- cenu, poslovnu ponudu i pravne dokumente;
- kontakt sa pilot-klijentom i potpis ugovora.

# Pravilo rada

Radi se redom, jedan segment u jednom trenutku. Sledeći segment počinje tek kada prethodni ima dokaz o testu, ažuriranu dokumentaciju, eksport i čist Git status.
