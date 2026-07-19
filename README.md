# Project Atlas

Project Atlas je modularna AI platforma za prijem upita, prikupljanje lead podataka, zakazivanje i predaju zahteva operateru.

## Trenutni status

- AI Receptionist v1.1 je trenutno stabilno izdanje, eksportovano, testirano i objavljeno u lokalnom n8n-u.
- Segmenti 1/8 i 2/8 komercijalnog MASTER ROADMAP-a su završeni.
- Komercijalni MVP je u razvoju.
- Sledeći korak je Segment 3/8 — stvarna predaja operateru.

## Početne tačke

- `Docs/PROJECT.md` — istorija razvoja i završenih segmenata.
- `Docs/ARCHITECTURE.md` — arhitektura platforme.
- `Docs/master-roadmap.md` — kompletan redosled do komercijalnog MVP-a.
- `Docs/operations-runbook.md` — pokretanje, backup, oporavak, logovi i incidenti.
- `Testing/v1.0-live-acceptance.md` — završna prihvatna provera v1.0 i v1.0.1.
- `Testing/segment-2-reliability.md` — dokaz pouzdanosti i živih failure testova v1.1.
- `Workflows/project-atlas-v1.1-ai-receptionist.json` — trenutno aktivni AI Receptionist workflow.
- `Workflows/project-atlas-v1.1-error-handler.json` — centralni error workflow.

## Važno

Trenutni v1.1 workflow radi u lokalnom n8n okruženju, koristi Google Sheets za leadove i `Errors` tab za operativne incidente. Stvarno email obaveštenje operateru, produkciono postavljanje, kalendar, javni chat i WhatsApp obrađuju se redom prema MASTER ROADMAP-u.
