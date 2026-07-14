import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const workflowPath = path.join(root, 'Workflows', 'project-atlas-v0.5-ai-receptionist-segment-5.json');
const managerPath = path.join(root, 'Prompts', 'conversation-manager.md');

const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
const manager = fs.readFileSync(managerPath, 'utf8');
const checks = [];

function check(condition, message) {
  if (!condition) throw new Error(message);
  checks.push(message);
}

function node(name) {
  return workflow.nodes.find((candidate) => candidate.name === name);
}

function target(from) {
  return workflow.connections[from]?.main?.[0]?.[0]?.node || '';
}

check(workflow.name.includes('Segment 5'), 'Workflow je označen kao Segment 5.');
check(workflow.nodes.length === 15, 'Workflow ima očekivanih 15 čvorova.');
check(new Set(workflow.nodes.map((item) => item.name)).size === workflow.nodes.length, 'Nazivi čvorova su jedinstveni.');
check(Boolean(node('Select Next Question')), 'Postoji čvor Select Next Question.');
check(target('Merge Lead Data') === 'Select Next Question', 'Merge Lead Data vodi u selektor pitanja.');
check(target('Select Next Question') === 'Append or update row in sheet', 'Selektor pitanja vodi u Google Sheets upis.');
check(node('Combine Prompt Files').parameters.jsCode.includes("$('Select Next Question')"), 'Prompt koristi rezultat selektora pitanja.');
check(!node('Combine Prompt Files').parameters.jsCode.includes("$('Merge Lead Data').first().json"), 'Prompt više ne preskače selektor pitanja.');

const llmPrompt = node('Basic LLM Chain').parameters.text;
check(llmPrompt.includes('next_question'), 'LLM prompt dobija next_question.');
check(llmPrompt.includes('postavi samo to jedno pitanje'), 'LLM prompt zahteva samo jedno pitanje.');
check(llmPrompt.includes('ne nabrajaj missing_fields'), 'LLM prompt zabranjuje listu nedostajućih polja.');
check(manager.includes('Kontrola narednog pitanja iz workflow-a'), 'Conversation Manager dokumentuje kontrolu pitanja.');
check(manager.includes('ne postavljaj nijedno drugo pitanje'), 'Conversation Manager zabranjuje dodatna pitanja.');

const selectorCode = node('Select Next Question').parameters.jsCode;
const runSelector = new Function('$json', selectorCode);

function decide(overrides = {}) {
  const base = {
    request_summary: '',
    conversation_text: '',
    service_type: '',
    location: '',
    property_type: '',
    square_meters: '',
    desired_date: '',
    phone: '',
    name: '',
    email: '',
    customer_type: ''
  };
  return runSelector({ ...base, ...overrides })[0].json;
}

function expectNext(input, expectedField, label) {
  const result = decide(input);
  check(result.next_field === expectedField, `${label}: izabrano je polje ${expectedField || 'bez pitanja'}.`);
  check(result.question_count === (expectedField ? 1 : 0), `${label}: question_count je ispravan.`);
  if (expectedField) {
    check((result.next_question.match(/\?/g) || []).length === 1, `${label}: generisano je tačno jedno pitanje.`);
  } else {
    check(result.next_question === '', `${label}: pitanje je prazno.`);
  }
}

expectNext({ request_summary: 'Da li vi donosite sredstva?' }, '', 'FAQ bez lead namere');
expectNext({ request_summary: 'Želim generalno čišćenje.', service_type: 'Generalno čišćenje' }, 'location', 'Poznata usluga');
expectNext({ service_type: 'Generalno čišćenje', location: 'Zemun' }, 'property_type', 'Poznata lokacija');
expectNext({ service_type: 'Generalno čišćenje', location: 'Zemun', property_type: 'Stan' }, 'square_meters', 'Poznat objekat');
expectNext({ service_type: 'Generalno čišćenje', location: 'Zemun', property_type: 'Stan', square_meters: '70' }, 'desired_date', 'Poznata kvadratura');
expectNext({ service_type: 'Generalno čišćenje', location: 'Zemun', property_type: 'Stan', square_meters: '70', desired_date: 'Sledeća nedelja' }, 'phone', 'Poznat termin');
expectNext({ service_type: 'Generalno čišćenje', location: 'Zemun', property_type: 'Stan', square_meters: '70', desired_date: 'Sledeća nedelja', phone: '0601111111' }, 'name', 'Poznat telefon');
expectNext({ service_type: 'Generalno čišćenje', location: 'Zemun', property_type: 'Stan', square_meters: '70', desired_date: 'Sledeća nedelja', phone: '0601111111', name: 'Test Klijent' }, '', 'Kompletan osnovni tok');
expectNext({ request_summary: 'Molim da me operater pozove.' }, 'phone', 'Zahtev za kontakt');
expectNext({ request_summary: 'Koliko košta čišćenje?' }, 'service_type', 'Upit za cenu bez usluge');
expectNext({ request_summary: 'Koliko košta generalno čišćenje?', service_type: 'Generalno čišćenje', location: 'Zemun', property_type: 'Stan', square_meters: '70' }, 'phone', 'Upit za cenu sa podacima o prostoru');
expectNext({ service_type: 'Dubinsko pranje', location: 'Novi Beograd' }, 'item_details', 'Dubinsko pranje bez predmeta');
expectNext({ service_type: 'Dubinsko pranje', location: 'Novi Beograd', conversation_text: 'KORISNIK: Potrebno je oprati dve fotelje.' }, 'desired_date', 'Dubinsko pranje sa predmetima');

check(node('Store Conversation Context').parameters.jsCode.includes("$('Combine Prompt Files')"), 'Čuvanje konteksta koristi kompletan Lead State.');
check(target('Basic LLM Chain') === 'Store Conversation Context', 'AI odgovor se i dalje čuva u istoriji.');
check(target('Save Conversation Context') === 'Return Chat Response', 'Sačuvani kontekst vodi do čistog chat odgovora.');

console.log(`Segment 5 validacija: ${checks.length}/${checks.length} provjera je prošlo.`);
