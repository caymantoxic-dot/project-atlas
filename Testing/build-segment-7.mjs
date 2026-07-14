import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const sourcePath = path.join(root, 'Workflows', 'project-atlas-v0.5-ai-receptionist-segment-6.json');
const targetPath = path.join(root, 'Workflows', 'project-atlas-v0.5-ai-receptionist-segment-7.json');

const workflow = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
workflow.name = 'Project Atlas v0.5 - AI Receptionist - Segment 7';

const handoffCode = String.raw`const lead = { ...$json };

function valueOrDash(value) {
  const clean = value === null || value === undefined ? '' : String(value).trim();
  return clean || 'Nije prikupljeno';
}

let operatorSummary = '';
let handoffRequired = false;
let handoffChannel = '';
let handoffStatus = lead.status;
let userCompletionMessage = '';
let notes = lead.notes;

if (lead.is_complete === true && lead.status === 'ready_for_operator') {
  const lines = [
    'NOVI KOMPLETAN ZAHTEV',
    'Sesija: ' + valueOrDash(lead.session_id),
    'Klijent: ' + valueOrDash(lead.name),
    'Telefon: ' + valueOrDash(lead.phone),
    'Email: ' + valueOrDash(lead.email),
    'Usluga: ' + valueOrDash(lead.service_type),
    'Lokacija: ' + valueOrDash(lead.location),
    'Objekat: ' + valueOrDash(lead.property_type),
    'Kvadratura: ' + valueOrDash(lead.square_meters),
    'Termin: ' + valueOrDash(lead.desired_date),
    'Tip klijenta: ' + valueOrDash(lead.customer_type),
    'Poslednji zahtev: ' + valueOrDash(lead.request_summary),
    'Kompletnost: ' + valueOrDash(lead.completion_percent) + '%'
  ];

  operatorSummary = lines.join('\n');
  handoffRequired = true;
  handoffChannel = 'google_sheets';
  handoffStatus = 'handed_off';
  userCompletionMessage = 'Hvala, zabeležio sam sve potrebne podatke. Zahtev je prosleđen operateru, koji će Vas kontaktirati radi potvrde termina i konačnih detalja.';
  notes = operatorSummary;
}

return [
  {
    json: {
      ...lead,
      operator_summary: operatorSummary,
      handoff_required: handoffRequired,
      handoff_channel: handoffChannel,
      user_completion_message: userCompletionMessage,
      status: handoffStatus,
      notes
    }
  }
];`;

const handoffNode = {
  parameters: { jsCode: handoffCode },
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [-128, -1280],
  id: '8c4e6b02-167a-453c-a182-11a73bcaaf4f',
  name: 'Prepare Operator Handoff'
};

const existingIndex = workflow.nodes.findIndex((node) => node.name === handoffNode.name);
if (existingIndex >= 0) workflow.nodes[existingIndex] = handoffNode;
else workflow.nodes.push(handoffNode);

workflow.connections['Evaluate Lead Completeness'] = {
  main: [[{ node: 'Prepare Operator Handoff', type: 'main', index: 0 }]]
};
workflow.connections['Prepare Operator Handoff'] = {
  main: [[{ node: 'Append or update row in sheet', type: 'main', index: 0 }]]
};

const combineNode = workflow.nodes.find((node) => node.name === 'Combine Prompt Files');
combineNode.parameters.jsCode = combineNode.parameters.jsCode.replace(
  "const leadState = $('Evaluate Lead Completeness').first().json;",
  "const leadState = $('Prepare Operator Handoff').first().json;"
);

const llmNode = workflow.nodes.find((node) => node.name === 'Basic LLM Chain');
llmNode.parameters.text += String.raw`

Predaja operateru:
{{ JSON.stringify({
  handoff_required: $json.handoff_required,
  handoff_channel: $json.handoff_channel,
  status: $json.status,
  user_completion_message: $json.user_completion_message
}, null, 2) }}

ZAVRŠNO PRAVILO:
Ako je handoff_required = true, ne postavljaj pitanje. Korisniku prenesi smisao user_completion_message kratko i prirodno. Ne prikazuj interni operator_summary.`;

fs.writeFileSync(targetPath, JSON.stringify(workflow, null, 2) + '\n', 'utf8');
console.log(`Kreiran ${path.relative(root, targetPath)} sa ${workflow.nodes.length} čvorova.`);
