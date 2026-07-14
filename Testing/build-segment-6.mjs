import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const sourcePath = path.join(root, 'Workflows', 'project-atlas-v0.5-ai-receptionist-segment-5.json');
const targetPath = path.join(root, 'Workflows', 'project-atlas-v0.5-ai-receptionist-segment-6.json');

const workflow = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
workflow.name = 'Project Atlas v0.5 - AI Receptionist - Segment 6';

const selectorNode = workflow.nodes.find((node) => node.name === 'Select Next Question');
if (!selectorNode) throw new Error('Nedostaje Select Next Question iz Segmenta 5.');

if (!selectorNode.parameters.jsCode.includes('required_fields: uniquePriority')) {
  selectorNode.parameters.jsCode = selectorNode.parameters.jsCode.replace(
    'collection_required: collectionIntent,\n      missing_fields: missingFields,',
    'collection_required: collectionIntent,\n      required_fields: uniquePriority,\n      missing_fields: missingFields,'
  );
}

const evaluatorCode = String.raw`const lead = { ...$json };

function asUniqueList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item || '').trim()).filter(Boolean))];
}

const requiredFields = asUniqueList(lead.required_fields);
const selectorMissing = new Set(asUniqueList(lead.missing_fields));
const knownRequiredFields = requiredFields.filter((field) => !selectorMissing.has(field));
const missingRequiredFields = requiredFields.filter((field) => selectorMissing.has(field));
const totalRequiredCount = requiredFields.length;
const completedRequiredCount = knownRequiredFields.length;
const completenessApplicable = Boolean(lead.collection_required) && totalRequiredCount > 0;
const completionPercent = completenessApplicable
  ? Math.round((completedRequiredCount / totalRequiredCount) * 100)
  : 0;
const isComplete = completenessApplicable && missingRequiredFields.length === 0;

let status = 'informational';
let notes = 'Informativni upit bez aktivnog prikupljanja lead podataka.';

if (completenessApplicable) {
  status = isComplete ? 'ready_for_operator' : 'collecting';
  notes = isComplete
    ? 'Lead je kompletan po pravilima izabrane usluge i spreman je za operatera.'
    : 'Kompletnost ' + completionPercent + '%. Nedostaju polja: ' + missingRequiredFields.join(', ') + '.';
}

return [
  {
    json: {
      ...lead,
      required_fields: requiredFields,
      known_required_fields: knownRequiredFields,
      missing_required_fields: missingRequiredFields,
      completed_required_count: completedRequiredCount,
      total_required_count: totalRequiredCount,
      completion_percent: completionPercent,
      completeness_applicable: completenessApplicable,
      is_complete: isComplete,
      status,
      notes
    }
  }
];`;

const evaluatorNode = {
  parameters: {
    jsCode: evaluatorCode
  },
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [-384, -1280],
  id: '5a117df2-19a7-493a-9864-88453d925ef4',
  name: 'Evaluate Lead Completeness'
};

const existingEvaluatorIndex = workflow.nodes.findIndex((node) => node.name === evaluatorNode.name);
if (existingEvaluatorIndex >= 0) {
  workflow.nodes[existingEvaluatorIndex] = evaluatorNode;
} else {
  workflow.nodes.push(evaluatorNode);
}

workflow.connections['Select Next Question'] = {
  main: [[{ node: 'Evaluate Lead Completeness', type: 'main', index: 0 }]]
};
workflow.connections['Evaluate Lead Completeness'] = {
  main: [[{ node: 'Append or update row in sheet', type: 'main', index: 0 }]]
};

const combineNode = workflow.nodes.find((node) => node.name === 'Combine Prompt Files');
combineNode.parameters.jsCode = combineNode.parameters.jsCode.replace(
  "const leadState = $('Select Next Question').first().json;",
  "const leadState = $('Evaluate Lead Completeness').first().json;"
);

const llmNode = workflow.nodes.find((node) => node.name === 'Basic LLM Chain');
llmNode.parameters.text = String.raw`=Poslednja poruka korisnika:
{{ $json.chatInput }}

Istorija razgovora, hronološki označena ulogama KORISNIK i AI:
{{ $json.conversation_text || "Nema prethodnih poruka." }}

Trenutni Lead State:
{{ JSON.stringify({
  session_id: $json.session_id,
  name: $json.name,
  phone: $json.phone,
  email: $json.email,
  location: $json.location,
  service_type: $json.service_type,
  property_type: $json.property_type,
  square_meters: $json.square_meters,
  desired_date: $json.desired_date,
  customer_type: $json.customer_type,
  request_summary: $json.request_summary,
  status: $json.status
}, null, 2) }}

Kontrola narednog pitanja:
{{ JSON.stringify({
  collection_required: $json.collection_required,
  next_field: $json.next_field,
  next_question: $json.next_question,
  question_count: $json.question_count
}, null, 2) }}

Dinamička procena kompletnosti:
{{ JSON.stringify({
  completeness_applicable: $json.completeness_applicable,
  required_fields: $json.required_fields,
  known_required_fields: $json.known_required_fields,
  missing_required_fields: $json.missing_required_fields,
  completed_required_count: $json.completed_required_count,
  total_required_count: $json.total_required_count,
  completion_percent: $json.completion_percent,
  is_complete: $json.is_complete,
  status: $json.status
}, null, 2) }}

Baza znanja firme:
{{ $json.knowledgeBase }}

OBAVEZNA PRAVILA ZA OVAJ ODGOVOR:
1. Prvo odgovori na poslednju poruku korisnika.
2. Ako next_question nije prazno, postavi samo to jedno pitanje, prirodno uklopljeno u odgovor.
3. Ne postavljaj nijedno dodatno pitanje i ne nabrajaj missing_required_fields.
4. Ako je is_complete = true, ne postavljaj novo pitanje za lead podatke.
5. Ako completeness_applicable = false, odgovori informativno i ne započinji lead prikupljanje.
6. Ne ponavljaj pitanje za podatak koji već postoji u istoriji ili Lead State objektu.`;

fs.writeFileSync(targetPath, JSON.stringify(workflow, null, 2) + '\n', 'utf8');
console.log(`Kreiran ${path.relative(root, targetPath)} sa ${workflow.nodes.length} čvorova.`);
