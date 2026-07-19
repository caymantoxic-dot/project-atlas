# Project Atlas dokumentacija

Ovaj folder sadrži glavnu tehničku i razvojnu dokumentaciju projekta.

## Glavni dokumenti

- `PROJECT.md` — istorija završenih verzija i segmenata.
- `ARCHITECTURE.md` — ciljna arhitektura platforme.
- `master-roadmap.md` — redosled od završenog AI Receptionist modula do komercijalnog MVP-a.
- `operations-runbook.md` — lokalni start, backup, restore, logovi i incidenti.

## Trenutni status

- AI Receptionist v1.1: trenutno stabilno izdanje, objavljeno u lokalnom n8n-u i validirano 88/88.
- Segment 1/8: završen, uključujući živu prihvatnu proveru i uklanjanje testnih zapisa.
- Segment 2/8: završen, uključujući kontrolisane kvarove, error workflow, retry zaštitu, backup i restart.
- Komercijalni MVP: u razvoju.
- Aktivni naredni korak: Segment 3/8 — stvarna predaja operateru.

Trenutni workflow nalazi se u `Workflows/project-atlas-v1.1-ai-receptionist.json`, a centralna obrada grešaka u `Workflows/project-atlas-v1.1-error-handler.json`.
