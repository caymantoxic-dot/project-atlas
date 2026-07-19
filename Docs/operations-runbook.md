# Project Atlas — operativno uputstvo

Datum provere: 20.07.2026.

Ovo uputstvo važi za trenutno lokalno Windows + n8n okruženje. Produkciona procedura biće dopunjena u Segmentu 4.

Trenutno objavljeno izdanje je `Project Atlas v1.1 - AI Receptionist`. v1.0.1 je zadržan kao neaktivna tačka povratka.

## Pokretanje i provera

1. Pokrenuti n8n komandom `n8n start`.
2. Otvoriti `http://127.0.0.1:5678`.
3. Proveriti `http://127.0.0.1:5678/healthz`.
4. Ispravan odgovor je HTTP 200 i `{"status":"ok"}`.
5. Proveriti da je samo trenutno produkciono izdanje AI Receptionist workflow-a aktivno.

Ako je n8n pokrenut u terminalu, zaustavlja se sa `Ctrl+C`. Ne kopirati ili vraćati aktivnu SQLite bazu dok n8n radi.

## Dnevna provera

- proveriti da n8n `/healthz` vraća `ok`;
- pregledati neuspešna n8n izvršenja;
- otvoriti Google Sheets tab `Errors` i obraditi redove sa statusom `OPEN`;
- proveriti da nema neočekivanog rasta duplih leadova;
- redovi sa statusom `TEST` služe samo kao dokaz kontrolisane probe.

Kada je problem rešen, operater ručno menja `OPEN` u `CLOSED` i po potrebi dodaje objašnjenje u internu evidenciju. Segment 3 uvodi stvarnu email predaju i obaveštenje operateru.

## Kontrolisani odgovori korisniku

- `KNOWLEDGE_UNAVAILABLE`: informacije firme nisu pouzdano dostupne; zahtev nije potvrđen.
- `DATA_STORE_UNAVAILABLE`: zahtev nije sačuvan niti označen kao primljen.
- `AI_UNAVAILABLE`: poruka nije obrađena; zahtev nije potvrđen.
- `PROCESSING_FAILURE`: nastao je interni problem; zahtev nije potvrđen.

Ni jedan fallback ne sme da koristi formulacije koje tvrde da je zahtev uspešno sačuvan, prosleđen ili zakazan.

## Backup

Backup se radi kada je n8n zaustavljen.

1. Napraviti novi folder `C:\Users\dalib\.n8n\backups\project-atlas-YYYYMMDD-HHMMSS`.
2. Kopirati `C:\Users\dalib\.n8n\database.sqlite`.
3. Kopirati `C:\Users\dalib\.n8n\config` u isti backup. Ovaj fajl sadrži ključ potreban za dešifrovanje kredencijala i mora ostati privatan.
4. Kopirati `C:\Users\dalib\.n8n-files\project-atlas`.
5. Kopirati aktuelni glavni workflow i error workflow iz foldera `Workflows`.
6. Proveriti da kopirana SQLite baza prolazi `PRAGMA integrity_check` sa rezultatom `ok`.

Backup sa `config` fajlom ne sme ići u Git, javni cloud folder, email ili chat.

## Vraćanje sistema

1. Zaustaviti n8n.
2. Napraviti novu sigurnosnu kopiju trenutnog stanja pre vraćanja.
3. Izabrati jedan kompletan backup folder; ne mešati bazu i `config` iz različitih datuma.
4. Vratiti `database.sqlite` i odgovarajući `config` u `C:\Users\dalib\.n8n`.
5. Vratiti folder `project-atlas` u `C:\Users\dalib\.n8n-files`.
6. Pokrenuti n8n i proveriti `/healthz`.
7. Proveriti aktivni workflow, Google Sheets i OpenAI kredencijale.
8. Pokrenuti jedan informativni chat test koji ne zakazuje niti potvrđuje stvarnu uslugu.
9. Ako provera ne prođe, zaustaviti n8n i vratiti sigurnosnu kopiju napravljenu u koraku 2.

Segment 2 restore proba nije prepisivala aktivnu bazu: backup kopija je otvorena odvojeno, prošla je proveru integriteta i sadržala sva tri očekivana workflow-a.

## Čuvanje podataka i logova

- uspešna n8n izvršenja: ciljano čuvanje 14 dana tokom stabilizacije;
- neuspešna izvršenja: 90 dana;
- `Errors` redovi sa statusom `OPEN`: do zatvaranja incidenta;
- zatvoreni error zapisi: 90 dana, zatim arhiva ili brisanje po odluci vlasnika;
- lead podaci: čuvanje samo koliko je poslovno i pravno potrebno;
- stack trace, puni promptovi sa ličnim podacima i tokeni ne upisuju se u `Errors` tab.

Automatsko brisanje i produkciona politika privatnosti biće zaključani pre javnog puštanja u Segmentima 4 i 7.

## Tajne i pristup

- n8n kredencijali ostaju u lokalnoj šifrovanoj bazi;
- `C:\Users\dalib\.n8n\config`, `database.sqlite`, tokeni i API ključevi nikada se ne commit-uju;
- workflow eksport sme da sadrži samo ID i naziv kredencijala, nikada samu tajnu;
- pre svakog Git commita pokreće se pretraga za tokenima i poverljivim poljima.

## Eskalacija incidenta

1. Ne potvrđivati korisniku prijem ako `saved` nije `true`.
2. Zabeležiti vreme, workflow, execution ID i poslednji čvor.
3. Pregledati `Errors` tab i n8n execution bez kopiranja ličnih podataka u GitHub issue.
4. Ponoviti bezbedan korak samo ako ne može napraviti dupli lead ili duplo obaveštenje.
5. Ako postoji rizik od gubitka ili dupliranja podataka, zaustaviti aktivni workflow do provere.
