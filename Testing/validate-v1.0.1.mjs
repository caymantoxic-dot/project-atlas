import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const workflow = JSON.parse(
  fs.readFileSync(path.join(root, 'Workflows', 'project-atlas-v1.0.1-ai-receptionist.json'), 'utf8'),
);

const checks = [];
const check = (condition, message) => {
  if (!condition) throw new Error(message);
  checks.push(message);
};
const node = (name) => workflow.nodes.find((item) => item.name === name);

check(workflow.name === 'Project Atlas v1.0.1 - AI Receptionist', 'Workflow nosi v1.0.1 naziv.');
check(workflow.nodes.length === 17, 'Workflow zadržava 17 čvorova.');
check(new Set(workflow.nodes.map((item) => item.name)).size === 17, 'Nazivi čvorova ostaju jedinstveni.');
check(Boolean(node('Prepare Lead Data')), 'Postoji Prepare Lead Data.');
check(
  node('When chat message received').webhookId === '2d12c860-1d8f-4f50-9a84-92f97caa614d',
  'Korektivno izdanje ima zaseban webhook ID.',
);

const prepare = new Function('$json', '$', node('Prepare Lead Data').parameters.jsCode);
const n8nLookup = () => ({ first: () => ({ json: { sessionId: 'atlas-v101-test' } }) });
const extract = (chatInput) => prepare({ chatInput }, n8nLookup)[0].json;

const business = extract(
  'Potrebno mi je održavanje poslovnog prostora od 200 kvadrata u Beogradu za firmu.',
);
check(business.service_type === 'Održavanje poslovnih prostora', 'Prepoznata je poslovna usluga.');
check(business.property_type === 'Poslovni prostor', 'Prepoznat je tip poslovnog objekta.');
check(business.square_meters === '200', 'Prepoznata je kvadratura poslovnog prostora.');
check(business.location === 'Beograd', 'Prepoznata je lokacija poslovnog prostora.');
check(business.customer_type === 'Pravno lice', 'Izraz za firmu prepoznaje pravno lice.');

for (const phrase of ['za firme', 'u firmi', 'pozivam za firmu', 'posao sa firmom']) {
  check(extract(`Potrebna je ponuda ${phrase}.`).customer_type === 'Pravno lice', `${phrase}: pravno lice je prepoznato.`);
}

for (const phrase of ['poslovnog prostora', 'poslovnom prostoru', 'poslovnim prostorom', 'kancelarije']) {
  check(
    extract(`Čišćenje ${phrase} u Beogradu.`).property_type === 'Poslovni prostor',
    `${phrase}: poslovni prostor je prepoznat.`,
  );
}

const correctedPhone = extract('Moj broj nije 0601111111 nego 0602222222.');
check(correctedPhone.phone === '0602222222', 'Poslednji jasno navedeni telefon zamenjuje stari.');

const correctedArea = extract('Ispravka: stan nije 70 nego 85 kvadrata.');
check(correctedArea.square_meters === '85', 'Ispravljena kvadratura zamenjuje staru vrednost.');

const originalNodes = [
  'Select Next Question',
  'Evaluate Lead Completeness',
  'Prepare Operator Handoff',
  'Store Conversation Context',
  'Save Conversation Context',
  'Return Chat Response',
];
for (const name of originalNodes) check(Boolean(node(name)), `Sačuvan je čvor ${name}.`);

console.log(`Project Atlas v1.0.1 validacija: ${checks.length}/${checks.length} provjera je prošlo.`);
