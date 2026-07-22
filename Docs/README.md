# Project Atlas dokumentacija

Ovaj folder sadrži glavnu tehničku i razvojnu dokumentaciju projekta.

## Glavni dokumenti

- `PROJECT.md` — istorija završenih verzija i segmenata.
- `ARCHITECTURE.md` — ciljna arhitektura platforme.
- `master-roadmap.md` — redosled od završenog AI Receptionist modula do komercijalnog MVP-a.
- `operations-runbook.md` — lokalni start, backup, restore, logovi i incidenti.

## Trenutni status

- AI Receptionist v1.2: trenutno stabilno izdanje, objavljeno u lokalnom n8n-u i validirano 99/99.
- Segment 1/8: završen, uključujući živu prihvatnu proveru i uklanjanje testnih zapisa.
- Segment 2/8: završen, uključujući kontrolisane kvarove, error workflow, retry zaštitu, backup i restart.
- Segment 3/8: završen, uključujući stvarni lead email, zaštitu od duplikata, Operator Queue i email upozorenje za `OPEN` incidente.
- Komercijalni MVP: u razvoju.
- Aktivni naredni korak: Segment 4/8 — produkciono okruženje i javni web chat.

Trenutni workflow nalazi se u `Workflows/project-atlas-v1.2-ai-receptionist.json`, a centralna obrada grešaka u `Workflows/project-atlas-v1.2-error-handler.json`.
