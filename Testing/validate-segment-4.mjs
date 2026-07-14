import { readFile } from 'node:fs/promises';

const workflowPath = new URL(
  '../Workflows/project-atlas-v0.5-ai-receptionist-segment-4.json',
  import.meta.url
);

const workflow = JSON.parse(await readFile(workflowPath, 'utf8'));
const checks = [];

function check(condition, message) {
  if (!condition) throw new Error(message);
  checks.push(message);
}

function node(name) {
  const found = workflow.nodes.find((candidate) => candidate.name === name);
  if (!found) throw new Error(`Nedostaje node: ${name}`);
  return found;
}

const nodeNames = workflow.nodes.map((item) => item.name);
const nodeIds = workflow.nodes.map((item) => item.id);
const nodeNameSet = new Set(nodeNames);

check(workflow.name.includes('Segment 4'), 'Workflow je označen kao Segment 4.');
check(nodeNameSet.size === nodeNames.length, 'Nazivi node-ova su jedinstveni.');
check(new Set(nodeIds).size === nodeIds.length, 'ID-jevi node-ova su jedinstveni.');

for (const requiredName of [
  'Store Conversation Context',
  'Save Conversation Context',
  'Return Chat Response'
]) {
  check(nodeNameSet.has(requiredName), `Postoji ${requiredName}.`);
}

for (const [sourceName, connectionGroups] of Object.entries(workflow.connections)) {
  check(nodeNameSet.has(sourceName), `Izvor veze postoji: ${sourceName}.`);

  for (const groups of Object.values(connectionGroups)) {
    for (const group of groups) {
      for (const connection of group) {
        check(nodeNameSet.has(connection.node), `Cilj veze postoji: ${connection.node}.`);
      }
    }
  }
}

const reachable = new Set(['When chat message received']);
const queue = ['When chat message received'];

while (queue.length) {
  const current = queue.shift();
  const groups = workflow.connections[current]?.main || [];

  for (const group of groups) {
    for (const connection of group) {
      if (!reachable.has(connection.node)) {
        reachable.add(connection.node);
        queue.push(connection.node);
      }
    }
  }
}

check(reachable.has('Return Chat Response'), 'Glavni tok završava sa Return Chat Response.');

const prompt = node('Basic LLM Chain').parameters.text;
check(prompt.includes('Istorija razgovora'), 'LLM prompt sadrži istoriju razgovora.');
check(prompt.includes('$json.conversation_text'), 'LLM prompt koristi sačuvani conversation_text.');

const prepareCode = node('Prepare Lead Data').parameters.jsCode;
check(!prepareCode.includes('$getWorkflowStaticData'), 'Privremena globalna memorija više ne duplira lead istoriju.');
check(prepareCode.includes('matchAll'), 'Ispravke telefona i emaila biraju poslednju navedenu vrednost.');

const mergeCode = node('Merge Lead Data').parameters.jsCode;
check(mergeCode.includes("appendTurn(existingLead.conversation_text, 'KORISNIK'"), 'Korisnička poruka se čuva sa ulogom.');

const storeCode = node('Store Conversation Context').parameters.jsCode;
check(storeCode.includes("appendTurn(leadState.conversation_text, 'AI'"), 'AI odgovor se dodaje u istoriju.');
check(storeCode.includes('text: aiResponse'), 'AI odgovor ostaje dostupan za chat odgovor.');

const saveNode = node('Save Conversation Context');
check(saveNode.parameters.operation === 'appendOrUpdate', 'Istorija se upisuje bez kreiranja duplikata reda.');
check(
  saveNode.parameters.columns.matchingColumns.includes('session_id'),
  'Upis istorije koristi session_id kao ključ.'
);
check(
  saveNode.parameters.columns.value.conversation_text === '={{ $json.conversation_text }}',
  'Google Sheets dobija punu istoriju razgovora.'
);

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
for (const codeNode of workflow.nodes.filter((item) => item.type === 'n8n-nodes-base.code')) {
  new AsyncFunction(codeNode.parameters.jsCode);
  checks.push(`JavaScript je sintaksno ispravan: ${codeNode.name}.`);
}

console.log(`Segment 4 validacija: ${checks.length}/${checks.length} provjera je prošlo.`);
