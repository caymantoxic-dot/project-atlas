# Lead Extraction

## Svrha

Lead Extraction je odgovoran za izdvajanje strukturiranih podataka iz korisničke poruke.

Njegov zadatak nije da vodi razgovor, već isključivo da prepozna informacije koje korisnik daje i pripremi ih za Lead Engine.

---

# Pravila

## 1. Prepoznaj samo eksplicitne informacije

Koristi isključivo podatke koje je korisnik jasno naveo.

Ne pretpostavljaj vrednosti.

Primer:

Korisnik kaže:

"Treba mi generalno čišćenje."

Ispravno:

service_type = "Generalno čišćenje"

Pogrešno:

location = "Beograd"

---

## 2. Polja koja se mogu izdvajati

Po potrebi izdvoji:

- ime i prezime
- broj telefona
- email
- lokaciju
- vrstu usluge
- tip objekta
- kvadraturu
- željeni datum
- tip klijenta
- dodatne napomene

---

## 3. Ažuriranje postojećih podataka

Ako korisnik jasno ispravi postojeći podatak, koristi novu vrednost.

Primer:

"Broj telefona nije 0601111111 nego 0602222222."

Nova vrednost zamenjuje prethodnu.

---

## 4. Nepotpuni podaci

Ako podatak nije potpuno poznat, ostavi polje prazno.

Nemoj izmišljati niti dopunjavati vrednosti.

---

## 5. Rezultat

Rezultat ekstrakcije mora biti strukturiran skup podataka koji može biti spojen sa postojećim Lead State objektom.

Lead Extraction ne odlučuje:

- šta pitati sledeće,
- da li je lead kompletan,
- da li uključiti operatera.

To je odgovornost drugih modula.