import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const sourcePath = path.join(root, 'Workflows', 'project-atlas-v0.5-ai-receptionist-segment-4.json');
const targetPath = path.join(root, 'Workflows', 'project-atlas-v0.5-ai-receptionist-segment-5.json');

const workflow = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
workflow.name = 'Project Atlas v0.5 - AI Receptionist - Segment 5';

const selectorCode = String.raw`const lead = { ...$json };

function clean(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

const latestMessage = clean(lead.request_summary).toLowerCase();
const history = clean(lead.conversation_text).toLowerCase();
const context = history + '\n' + latestMessage;

const knownLeadFields = [
  lead.service_type,
  lead.location,
  lead.property_type,
  lead.square_meters,
  lead.desired_date,
  lead.name,
  lead.phone,
  lead.email,
  lead.customer_type
].some((value) => clean(value) !== '');

const collectionIntent = /(?:želim|zelim|treba mi|potrebno mi|zaka(?:z|ž)|termin|ponud|tačn(?:a|u) cen|tacn(?:a|u) cen|koliko košta|koliko kosta|kontakt|pozove|operater|zainteresovan)/i.test(context) || knownLeadFields;
const contactRequested = /(?:kontakt|pozove|operater|javi mi se|javite mi se)/i.test(context);
const priceRequested = /(?:cen|koliko košta|koliko kosta|ponud)/i.test(context);
const service = clean(lead.service_type).toLowerCase();
const isBusiness = service.includes('poslov') || clean(lead.customer_type).toLowerCase().includes('pravno');
const requiresProperty = service.includes('general') || service.includes('redovno') || service.includes('poslov');
const requiresSquareMeters = requiresProperty;
const deepCleaningItemsKnown = /(?:sofa|trosed|fotelj|dušek|dusek|stolic|tepih|nameštaj|namestaj|komad)/i.test(context);

const fieldKnown = {
  service_type: clean(lead.service_type) !== '',
  location: clean(lead.location) !== '',
  property_type: clean(lead.property_type) !== '',
  square_meters: clean(lead.square_meters) !== '',
  desired_date: clean(lead.desired_date) !== '',
  phone: clean(lead.phone) !== '',
  name: clean(lead.name) !== '',
  email: clean(lead.email) !== '',
  customer_type: clean(lead.customer_type) !== '',
  item_details: deepCleaningItemsKnown
};

let priority = [];

if (collectionIntent) {
  if (contactRequested) {
    priority = ['phone', 'name', 'service_type', 'location', 'desired_date'];
  } else {
    priority.push('service_type', 'location');

    if (isBusiness) {
      priority.push('customer_type');
    }

    if (requiresProperty) {
      priority.push('property_type');
    }

    if (requiresSquareMeters) {
      priority.push('square_meters');
    }

    if (service.includes('dubinsko')) {
      priority.push('item_details');
    }

    if (priceRequested) {
      priority.push('phone', 'name', 'desired_date');
    } else {
      priority.push('desired_date', 'phone', 'name');
    }

    if (isBusiness) {
      priority.push('email');
    }
  }
}

const uniquePriority = [...new Set(priority)];
const missingFields = uniquePriority.filter((field) => !fieldKnown[field]);
const nextField = missingFields[0] || '';

const questions = {
  service_type: 'Koja usluga Vam je potrebna?',
  location: 'U kom delu grada se nalazi objekat?',
  property_type: 'O kom tipu objekta je reč?',
  square_meters: 'Kolika je približna kvadratura prostora?',
  desired_date: 'Koji termin Vam okvirno odgovara?',
  phone: 'Koji broj telefona operater može da koristi za kontakt?',
  name: 'Na koje ime da evidentiramo zahtev?',
  email: 'Na koju email adresu želite da primite ponudu?',
  customer_type: 'Da li se javljate kao fizičko ili pravno lice?',
  item_details: 'Šta je potrebno dubinski oprati i koliko komada?'
};

return [
  {
    json: {
      ...lead,
      collection_required: collectionIntent,
      missing_fields: missingFields,
      next_field: nextField,
      next_question: nextField ? questions[nextField] : '',
      question_count: nextField ? 1 : 0
    }
  }
];`;

const selectorNode = {
  parameters: {
    jsCode: selectorCode
  },
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [-640, -1280],
  id: '0f6d9c31-5e4b-4f89-a9d9-e0ce5f3f358c',
  name: 'Select Next Question'
};

const existingSelectorIndex = workflow.nodes.findIndex((node) => node.name === selectorNode.name);
if (existingSelectorIndex >= 0) {
  workflow.nodes[existingSelectorIndex] = selectorNode;
} else {
  workflow.nodes.push(selectorNode);
}

workflow.connections['Merge Lead Data'] = {
  main: [[{ node: 'Select Next Question', type: 'main', index: 0 }]]
};
workflow.connections['Select Next Question'] = {
  main: [[{ node: 'Append or update row in sheet', type: 'main', index: 0 }]]
};

const combineNode = workflow.nodes.find((node) => node.name === 'Combine Prompt Files');
combineNode.parameters.jsCode = combineNode.parameters.jsCode.replace(
  "const leadState = $('Merge Lead Data').first().json;",
  "const leadState = $('Select Next Question').first().json;"
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
  missing_fields: $json.missing_fields,
  next_field: $json.next_field,
  next_question: $json.next_question,
  question_count: $json.question_count
}, null, 2) }}

Baza znanja firme:
{{ $json.knowledgeBase }}

OBAVEZNA PRAVILA ZA OVAJ ODGOVOR:
1. Prvo odgovori na poslednju poruku korisnika.
2. Ako next_question nije prazno, postavi samo to jedno pitanje, prirodno uklopljeno u odgovor.
3. Ne postavljaj nijedno dodatno pitanje i ne nabrajaj missing_fields.
4. Ako je next_question prazno, ne postavljaj novo pitanje radi prikupljanja podataka.
5. Ne ponavljaj pitanje za podatak koji već postoji u istoriji ili Lead State objektu.`;

fs.writeFileSync(targetPath, JSON.stringify(workflow, null, 2) + '\n', 'utf8');
console.log(`Kreiran ${path.relative(root, targetPath)} sa ${workflow.nodes.length} čvorova.`);
