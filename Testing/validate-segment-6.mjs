import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const workflowPath = path.join(root, 'Workflows', 'project-atlas-v0.5-ai-receptionist-segment-6.json');

const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
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

check(workflow.name.includes('Segment 6'), 'Workflow je označen kao Segment 6.');
check(workflow.nodes.length === 16, 'Workflow ima očekivanih 16 čvorova.');
check(new Set(workflow.nodes.map((item) => item.name)).size === workflow.nodes.length, 'Nazivi čvorova su jedinstveni.');
check(Boolean(node('Evaluate Lead Completeness')), 'Postoji čvor Evaluate Lead Completeness.');
check(target('Select Next Question') === 'Evaluate Lead Completeness', 'Selektor vodi u procenu kompletnosti.');
check(target('Evaluate Lead Completeness') === 'Append or update row in sheet', 'Procena kompletnosti vodi u Google Sheets upis.');
check(node('Combine Prompt Files').parameters.jsCode.includes("$('Evaluate Lead Completeness')"), 'Prompt koristi procenjeno stanje lead-a.');
check(!node('Combine Prompt Files').parameters.jsCode.includes("$('Select Next Question').first().json"), 'Prompt više ne preskače procenu kompletnosti.');

const selectorCode = node('Select Next Question').parameters.jsCode;
const evaluatorCode = node('Evaluate Lead Completeness').parameters.jsCode;
check(selectorCode.includes('required_fields: uniquePriority'), 'Selektor izlaže dinamičku listu obaveznih polja.');

const runSelector = new Function('$json', selectorCode);
const runEvaluator = new Function('$json', evaluatorCode);

function evaluate(overrides = {}) {
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
  const selected = runSelector({ ...base, ...overrides })[0].json;
  return runEvaluator(selected)[0].json;
}

function expectState(input, expected, label) {
  const result = evaluate(input);
  check(result.status === expected.status, `${label}: status je ${expected.status}.`);
  check(result.is_complete === expected.isComplete, `${label}: is_complete je ispravan.`);
  check(result.completion_percent === expected.percent, `${label}: completion_percent je ${expected.percent}.`);
  check(result.total_required_count === expected.total, `${label}: broj obaveznih polja je ${expected.total}.`);
  check(result.completed_required_count === expected.completed, `${label}: broj poznatih obaveznih polja je ${expected.completed}.`);
  check(result.missing_required_fields.length === expected.total - expected.completed, `${label}: broj nedostajućih polja je ispravan.`);
  check(result.next_question === (expected.nextField ? result.next_question : ''), `${label}: pitanje je usklađeno sa kompletnosti.`);
  if (expected.nextField) check(result.next_field === expected.nextField, `${label}: sledeće polje je ${expected.nextField}.`);
}

const generalComplete = {
  request_summary: 'Želim generalno čišćenje.',
  service_type: 'Generalno čišćenje',
  location: 'Zemun',
  property_type: 'Stan',
  square_meters: '70',
  desired_date: 'Sledeća nedelja',
  phone: '0601111111',
  name: 'Test Klijent'
};

expectState(
  { request_summary: 'Da li vi donosite sredstva?' },
  { status: 'informational', isComplete: false, percent: 0, total: 0, completed: 0, nextField: '' },
  'Informativni FAQ'
);
expectState(
  { request_summary: 'Želim generalno čišćenje.', service_type: 'Generalno čišćenje' },
  { status: 'collecting', isComplete: false, percent: 14, total: 7, completed: 1, nextField: 'location' },
  'Početak generalnog čišćenja'
);
expectState(
  { ...generalComplete, name: '' },
  { status: 'collecting', isComplete: false, percent: 86, total: 7, completed: 6, nextField: 'name' },
  'Generalno čišćenje bez imena'
);
expectState(
  generalComplete,
  { status: 'ready_for_operator', isComplete: true, percent: 100, total: 7, completed: 7, nextField: '' },
  'Kompletno generalno čišćenje'
);
expectState(
  {
    service_type: 'Održavanje poslovnih prostora',
    location: 'Novi Beograd',
    customer_type: 'Pravno lice',
    property_type: 'Poslovni prostor',
    square_meters: '300',
    desired_date: 'Sledeća nedelja',
    phone: '0602222222',
    name: 'Test Firma',
    email: 'test@example.com'
  },
  { status: 'ready_for_operator', isComplete: true, percent: 100, total: 9, completed: 9, nextField: '' },
  'Kompletan poslovni zahtev'
);
expectState(
  {
    service_type: 'Dubinsko pranje',
    location: 'Beograd',
    conversation_text: 'KORISNIK: Potrebno je oprati dve fotelje.',
    desired_date: 'Sutra',
    phone: '0603333333',
    name: 'Dubinski Test'
  },
  { status: 'ready_for_operator', isComplete: true, percent: 100, total: 6, completed: 6, nextField: '' },
  'Kompletno dubinsko pranje'
);
expectState(
  {
    request_summary: 'Molim da me operater pozove.',
    service_type: 'Redovno čišćenje',
    location: 'Zemun',
    desired_date: 'Sutra',
    phone: '0604444444',
    name: 'Kontakt Test'
  },
  { status: 'ready_for_operator', isComplete: true, percent: 100, total: 5, completed: 5, nextField: '' },
  'Kompletan zahtev za kontakt'
);

const llmPrompt = node('Basic LLM Chain').parameters.text;
check(llmPrompt.includes('Dinamička procena kompletnosti'), 'LLM prompt dobija blok procene kompletnosti.');
check(llmPrompt.includes('completion_percent'), 'LLM prompt dobija procenat kompletnosti.');
check(llmPrompt.includes('is_complete'), 'LLM prompt dobija oznaku is_complete.');
check(llmPrompt.includes('completeness_applicable = false'), 'LLM prompt razlikuje informativne upite.');
check(evaluatorCode.includes("ready_for_operator"), 'Evaluator postavlja status ready_for_operator.');
check(evaluatorCode.includes("status = 'informational'"), 'Evaluator postavlja status informational za FAQ.');
check(evaluatorCode.includes('missing_required_fields'), 'Evaluator izlaže nedostajuća obavezna polja.');

console.log(`Segment 6 validacija: ${checks.length}/${checks.length} provjera je prošlo.`);
