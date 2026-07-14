import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const workflow = JSON.parse(fs.readFileSync(path.join(root, 'Workflows', 'project-atlas-v0.5-ai-receptionist-segment-7.json'), 'utf8'));
const checks = [];
const check = (condition, message) => { if (!condition) throw new Error(message); checks.push(message); };
const node = (name) => workflow.nodes.find((item) => item.name === name);
const target = (name) => workflow.connections[name]?.main?.[0]?.[0]?.node || '';

check(workflow.name.includes('Segment 7'), 'Workflow je označen kao Segment 7.');
check(workflow.nodes.length === 17, 'Workflow ima 17 čvorova.');
check(Boolean(node('Prepare Operator Handoff')), 'Postoji Prepare Operator Handoff.');
check(target('Evaluate Lead Completeness') === 'Prepare Operator Handoff', 'Procena vodi u pripremu predaje.');
check(target('Prepare Operator Handoff') === 'Append or update row in sheet', 'Predaja se upisuje u Google Sheets.');
check(node('Combine Prompt Files').parameters.jsCode.includes("$('Prepare Operator Handoff')"), 'Prompt koristi stanje nakon pripreme predaje.');

const run = new Function('$json', node('Prepare Operator Handoff').parameters.jsCode);
const incomplete = run({ status: 'collecting', is_complete: false, notes: 'x' })[0].json;
check(incomplete.handoff_required === false, 'Nepotpun lead se ne predaje.');
check(incomplete.operator_summary === '', 'Nepotpun lead nema operator summary.');
check(incomplete.status === 'collecting', 'Nepotpun lead zadržava status collecting.');

const complete = run({
  status: 'ready_for_operator', is_complete: true, completion_percent: 100,
  session_id: 'atlas-s7', name: 'Atlas Test', phone: '0601111111', email: '',
  service_type: 'Generalno čišćenje', location: 'Zemun', property_type: 'Stan',
  square_meters: '70', desired_date: 'Sledeća nedelja', customer_type: '',
  request_summary: 'Želim termin.', notes: ''
})[0].json;

check(complete.handoff_required === true, 'Kompletan lead zahteva predaju.');
check(complete.handoff_channel === 'google_sheets', 'Kanal predaje je Google Sheets.');
check(complete.status === 'handed_off', 'Status kompletnog lead-a je handed_off.');
check(complete.operator_summary.includes('NOVI KOMPLETAN ZAHTEV'), 'Rezime ima jasan naslov.');
check(complete.operator_summary.includes('Atlas Test'), 'Rezime sadrži ime.');
check(complete.operator_summary.includes('0601111111'), 'Rezime sadrži telefon.');
check(complete.operator_summary.includes('Generalno čišćenje'), 'Rezime sadrži uslugu.');
check(complete.operator_summary.includes('Zemun'), 'Rezime sadrži lokaciju.');
check(complete.operator_summary.includes('70'), 'Rezime sadrži kvadraturu.');
check(complete.notes === complete.operator_summary, 'Rezime se čuva u notes koloni za operatera.');
check(complete.user_completion_message.includes('prosleđen operateru'), 'Korisnik dobija potvrdu predaje.');

const prompt = node('Basic LLM Chain').parameters.text;
check(prompt.includes('Predaja operateru'), 'LLM prompt dobija podatke predaje.');
check(prompt.includes('Ne prikazuj interni operator_summary'), 'Interni rezime se ne prikazuje korisniku.');
check(prompt.includes('ne postavljaj pitanje'), 'Nakon predaje nema novog pitanja.');

console.log(`Segment 7 validacija: ${checks.length}/${checks.length} provjera je prošlo.`);
