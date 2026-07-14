import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const workflow = JSON.parse(fs.readFileSync(path.join(root, 'Workflows', 'project-atlas-v1.0-ai-receptionist.json'), 'utf8'));
const checks = [];
const check = (condition, message) => { if (!condition) throw new Error(message); checks.push(message); };
const node = (name) => workflow.nodes.find((item) => item.name === name);
const target = (name) => workflow.connections[name]?.main?.[0]?.[0]?.node || '';

check(workflow.name === 'Project Atlas v1.0 - AI Receptionist', 'Finalni workflow nosi v1.0 naziv.');
check(workflow.nodes.length === 17, 'Finalni workflow ima 17 čvorova.');
check(new Set(workflow.nodes.map((item) => item.name)).size === 17, 'Svi nazivi čvorova su jedinstveni.');
for (const name of ['Select Next Question', 'Evaluate Lead Completeness', 'Prepare Operator Handoff', 'Store Conversation Context', 'Save Conversation Context', 'Return Chat Response']) {
  check(Boolean(node(name)), `Postoji finalni čvor ${name}.`);
}
check(target('Merge Lead Data') === 'Select Next Question', 'Tok vodi u izbor pitanja.');
check(target('Select Next Question') === 'Evaluate Lead Completeness', 'Tok vodi u procenu kompletnosti.');
check(target('Evaluate Lead Completeness') === 'Prepare Operator Handoff', 'Tok vodi u predaju operateru.');
check(target('Prepare Operator Handoff') === 'Append or update row in sheet', 'Predaja se čuva u Sheets.');
check(target('Basic LLM Chain') === 'Store Conversation Context', 'AI odgovor se čuva u istoriji.');
check(target('Save Conversation Context') === 'Return Chat Response', 'Korisnik dobija čist odgovor.');

const selector = new Function('$json', node('Select Next Question').parameters.jsCode);
const evaluator = new Function('$json', node('Evaluate Lead Completeness').parameters.jsCode);
const handoff = new Function('$json', node('Prepare Operator Handoff').parameters.jsCode);
const base = { request_summary: '', conversation_text: '', service_type: '', location: '', property_type: '', square_meters: '', desired_date: '', phone: '', name: '', email: '', customer_type: '' };
const run = (data) => handoff(evaluator(selector({ ...base, ...data })[0].json)[0].json)[0].json;

const faq = run({ request_summary: 'Da li donosite sredstva?' });
check(faq.status === 'informational' && faq.next_question === '', 'FAQ ostaje informativan bez pitanja.');
const partial = run({ request_summary: 'Želim generalno čišćenje.', service_type: 'Generalno čišćenje' });
check(partial.status === 'collecting' && partial.next_field === 'location', 'Nepotpun zahtev nastavlja prikupljanje.');
const complete = run({ request_summary: 'Želim generalno čišćenje.', service_type: 'Generalno čišćenje', location: 'Zemun', property_type: 'Stan', square_meters: '70', desired_date: 'Sledeća nedelja', phone: '0601111111', name: 'Atlas Test' });
check(complete.status === 'handed_off', 'Kompletan zahtev se predaje operateru.');
check(complete.completion_percent === 100 && complete.is_complete === true, 'Kompletan zahtev ima 100%.');
check(complete.operator_summary.includes('Atlas Test'), 'Finalni rezime sadrži podatke klijenta.');
check(complete.next_question === '', 'Nakon predaje nema pitanja.');

console.log(`Project Atlas v1.0 validacija: ${checks.length}/${checks.length} provjera je prošlo.`);
