import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const sourcePath = path.join(root, 'Workflows', 'project-atlas-v1.1-ai-receptionist.json');
const outputPath = path.join(root, 'Workflows', 'project-atlas-v1.2-ai-receptionist.json');
const errorSourcePath = path.join(root, 'Workflows', 'project-atlas-v1.1-error-handler.json');
const errorOutputPath = path.join(root, 'Workflows', 'project-atlas-v1.2-error-handler.json');

const WORKFLOW_ID = 'ATLASV12S3X2026Z';
const SMTP_CREDENTIAL_ID = process.env.ATLAS_SMTP_CREDENTIAL_ID || 'ATLAS_SMTP_CREDENTIAL_REQUIRED';
const SMTP_CREDENTIAL_NAME = process.env.ATLAS_SMTP_CREDENTIAL_NAME || 'Housekeeping Google Workspace SMTP';
const OPERATOR_EMAIL = 'office@housekeepingbeograd.com';

const workflow = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const node = (name) => workflow.nodes.find((item) => item.name === name);

workflow.id = WORKFLOW_ID;
workflow.name = 'Project Atlas v1.2 - AI Receptionist';
workflow.active = false;
workflow.versionId = '325c05dc-2194-4852-b17d-a27519a7bf80';

const prepareLead = node('Prepare Lead Data');
if (!prepareLead) throw new Error('Prepare Lead Data nije pronađen.');
prepareLead.parameters.jsCode = prepareLead.parameters.jsCode.replace(
  "      conversation_text: ''\n",
  `      conversation_text: '',
      notification_key: '',
      notification_status: '',
      notification_attempts: 0,
      notification_last_attempt_at: '',
      notification_sent_at: '',
      notification_message_id: '',
      notification_error: ''
`,
);

const mergeLead = node('Merge Lead Data');
if (!mergeLead) throw new Error('Merge Lead Data nije pronađen.');
mergeLead.parameters.jsCode = mergeLead.parameters.jsCode.replace(
  "  conversation_text: appendTurn(existingLead.conversation_text, 'KORISNIK', newLead.request_summary)\n",
  `  conversation_text: appendTurn(existingLead.conversation_text, 'KORISNIK', newLead.request_summary),
  notification_key: keepOldOrUseNew(existingLead.notification_key, newLead.notification_key),
  notification_status: keepOldOrUseNew(existingLead.notification_status, newLead.notification_status),
  notification_attempts: Number(existingLead.notification_attempts || newLead.notification_attempts || 0),
  notification_last_attempt_at: keepOldOrUseNew(existingLead.notification_last_attempt_at, newLead.notification_last_attempt_at),
  notification_sent_at: keepOldOrUseNew(existingLead.notification_sent_at, newLead.notification_sent_at),
  notification_message_id: keepOldOrUseNew(existingLead.notification_message_id, newLead.notification_message_id),
  notification_error: keepOldOrUseNew(existingLead.notification_error, newLead.notification_error)
`,
);

const prepareHandoff = node('Prepare Operator Handoff');
if (!prepareHandoff) throw new Error('Prepare Operator Handoff nije pronađen.');
prepareHandoff.parameters.jsCode = `const lead = { ...$json };

function clean(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function valueOrDash(value) {
  return clean(value) || 'Nije prikupljeno';
}

function belgradeTimestamp() {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'Europe/Belgrade',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
}

const completeLead = lead.is_complete === true && lead.status === 'ready_for_operator';
const previousNotificationStatus = clean(lead.notification_status).toLowerCase();
let operatorSummary = '';
let handoffRequired = false;
let handoffChannel = '';
let notificationSendRequired = false;
let notificationKey = clean(lead.notification_key);
let notificationStatus = previousNotificationStatus;
let notificationAttempts = Number(lead.notification_attempts || 0);
let notificationLastAttemptAt = clean(lead.notification_last_attempt_at);
let notificationSentAt = clean(lead.notification_sent_at);
let notificationMessageId = clean(lead.notification_message_id);
let notificationError = clean(lead.notification_error);
let status = lead.status;
let userCompletionMessage = '';
let notes = lead.notes;

if (completeLead) {
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

  operatorSummary = lines.join('\\n');
  handoffRequired = true;
  notificationKey = notificationKey || 'atlas:' + clean(lead.session_id) + ':operator-handoff:v1';
  notes = operatorSummary;

  if (previousNotificationStatus === 'sent') {
    handoffChannel = 'email';
    status = 'handed_off';
    userCompletionMessage = 'Hvala, svi podaci su zabeleženi. Zahtev je već prosleđen operateru emailom i neće biti poslat ponovo.';
  } else if (previousNotificationStatus === 'sending') {
    status = 'handoff_pending';
    userCompletionMessage = 'Hvala, zahtev je sačuvan. Obaveštenje operateru je još u obradi i neću tvrditi da je poslato dok ne dobijemo potvrdu.';
  } else {
    notificationSendRequired = true;
    notificationStatus = 'sending';
    notificationAttempts += 1;
    notificationLastAttemptAt = belgradeTimestamp();
    notificationError = '';
    status = 'handoff_pending';
    userCompletionMessage = 'Hvala, zahtev je sačuvan. Upravo pokušavam da obavestim operatera.';
  }
}

return [{ json: {
  ...lead,
  operator_summary: operatorSummary,
  handoff_required: handoffRequired,
  handoff_channel: handoffChannel,
  notification_send_required: notificationSendRequired,
  notification_key: notificationKey,
  notification_status: notificationStatus,
  notification_attempts: notificationAttempts,
  notification_last_attempt_at: notificationLastAttemptAt,
  notification_sent_at: notificationSentAt,
  notification_message_id: notificationMessageId,
  notification_error: notificationError,
  user_completion_message: userCompletionMessage,
  status,
  notes
} }];`;

const notificationColumns = [
  'notification_key',
  'notification_status',
  'notification_attempts',
  'notification_last_attempt_at',
  'notification_sent_at',
  'notification_message_id',
  'notification_error',
];

function extendSheetMapping(sheetNode) {
  if (!sheetNode?.parameters?.columns) throw new Error(`Google Sheets čvor nije ispravan: ${sheetNode?.name || 'unknown'}`);
  for (const column of notificationColumns) {
    sheetNode.parameters.columns.value[column] = `={{ $json.${column} }}`;
    if (!sheetNode.parameters.columns.schema.some((field) => field.id === column)) {
      sheetNode.parameters.columns.schema.push({
        id: column,
        displayName: column,
        required: false,
        defaultMatch: false,
        display: true,
        type: column === 'notification_attempts' ? 'number' : 'string',
        canBeUsedToMatch: true,
      });
    }
  }
}

const initialLeadWrite = node('Append or update row in sheet');
const contextWrite = node('Save Conversation Context');
extendSheetMapping(initialLeadWrite);
extendSheetMapping(contextWrite);

const shouldSend = {
  parameters: {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      conditions: [{
        id: '4152d812-1cd7-48fb-b6cf-e00e5353f846-condition',
        leftValue: '={{ $("Prepare Operator Handoff").first().json.notification_send_required ? "send" : "" }}',
        rightValue: '',
        operator: { type: 'string', operation: 'notEmpty', singleValue: true },
      }],
      combinator: 'and',
    },
    options: {},
  },
  type: 'n8n-nodes-base.if',
  typeVersion: 2.3,
  position: [-240, -1440],
  id: '4152d812-1cd7-48fb-b6cf-e00e5353f846',
  name: 'Should Send Operator Email',
};

const sendEmail = {
  parameters: {
    fromEmail: `Project Atlas <${OPERATOR_EMAIL}>`,
    toEmail: OPERATOR_EMAIL,
    subject: '=Novi Atlas zahtev | {{ $("Prepare Operator Handoff").first().json.name || "Nepoznat klijent" }} | {{ $("Prepare Operator Handoff").first().json.service_type || "Usluga" }}',
    emailFormat: 'text',
    text: '={{ $("Prepare Operator Handoff").first().json.operator_summary + "\\n\\nStatus ID: " + $("Prepare Operator Handoff").first().json.notification_key }}',
    options: { appendAttribution: false },
  },
  type: 'n8n-nodes-base.emailSend',
  typeVersion: 2.1,
  position: [0, -1560],
  id: 'e6f7a5d1-6159-496d-bf79-22e529afcabc',
  name: 'Send Operator Email',
  credentials: {
    smtp: { id: SMTP_CREDENTIAL_ID, name: SMTP_CREDENTIAL_NAME },
  },
  retryOnFail: true,
  maxTries: 3,
  waitBetweenTries: 3000,
  onError: 'continueRegularOutput',
};

const checkEmailResult = {
  parameters: {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      conditions: [{
        id: 'c2a420af-7bbf-4ca1-8564-a524f83e9cbd-condition',
        leftValue: '={{ $json.error || "" }}',
        rightValue: '',
        operator: { type: 'string', operation: 'notEmpty', singleValue: true },
      }],
      combinator: 'and',
    },
    options: {},
  },
  type: 'n8n-nodes-base.if',
  typeVersion: 2.3,
  position: [240, -1560],
  id: 'c2a420af-7bbf-4ca1-8564-a524f83e9cbd',
  name: 'Check Email Send Result',
};

const prepareSuccess = {
  parameters: {
    jsCode: `const base = $('Prepare Operator Handoff').first().json;
const result = { ...$json };
const sentAt = new Date().toLocaleString('sv-SE', {
  timeZone: 'Europe/Belgrade',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
});

return [{ json: {
  ...base,
  notification_send_required: false,
  notification_status: 'sent',
  notification_sent_at: sentAt,
  notification_message_id: String(result.messageId || result.message_id || ''),
  notification_error: '',
  handoff_channel: 'email',
  status: 'handed_off'
} }];`,
  },
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [480, -1640],
  id: '87c4f5c6-c46c-480f-bd46-e2c04b7247aa',
  name: 'Prepare Notification Success',
  onError: 'continueErrorOutput',
};

const prepareFailure = {
  parameters: {
    jsCode: `const base = $('Prepare Operator Handoff').first().json;
const result = { ...$json };
const rawError = String(result.error?.message || result.error || 'Email server nije potvrdio slanje.');
const safeError = rawError
  .replace(/(?:\\+381|0)6\\d[\\s\\/.-]?\\d{3}[\\s\\/.-]?\\d{3,4}/g, '[PHONE]')
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/gi, '[EMAIL]')
  .slice(0, 500);

return [{ json: {
  ...base,
  notification_send_required: false,
  notification_status: 'failed',
  notification_sent_at: '',
  notification_message_id: '',
  notification_error: safeError,
  handoff_channel: '',
  status: 'notification_failed'
} }];`,
  },
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [480, -1480],
  id: '195ef66a-58c2-4a57-af1d-28fcace9cc04',
  name: 'Prepare Notification Failure',
  onError: 'continueErrorOutput',
};

const saveNotificationStatus = structuredClone(initialLeadWrite);
saveNotificationStatus.id = '2e180c50-81f0-4d51-b18d-74235a15b0de';
saveNotificationStatus.name = 'Save Notification Status';
saveNotificationStatus.position = [720, -1560];
saveNotificationStatus.onError = 'continueRegularOutput';
saveNotificationStatus.retryOnFail = true;
saveNotificationStatus.maxTries = 3;
saveNotificationStatus.waitBetweenTries = 1500;

const checkNotificationSave = {
  parameters: {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      conditions: [{
        id: 'd0ef08e5-9113-40e1-b148-fb5f96ff1e99-condition',
        leftValue: '={{ $json.error || "" }}',
        rightValue: '',
        operator: { type: 'string', operation: 'notEmpty', singleValue: true },
      }],
      combinator: 'and',
    },
    options: {},
  },
  type: 'n8n-nodes-base.if',
  typeVersion: 2.3,
  position: [960, -1560],
  id: 'd0ef08e5-9113-40e1-b148-fb5f96ff1e99',
  name: 'Check Notification Status Save',
};

const resolveHandoff = {
  parameters: {
    jsCode: `const base = $('Prepare Operator Handoff').first().json;
const latest = { ...$json };
const lead = { ...base, ...latest };
const notificationStatus = String(lead.notification_status || '').trim().toLowerCase();
const completeLead = base.is_complete === true;
let userCompletionMessage = base.user_completion_message || '';

if (completeLead && notificationStatus === 'sent') {
  userCompletionMessage = 'Hvala, zabeležio sam sve potrebne podatke. Zahtev je uspešno prosleđen operateru emailom, koji će Vas kontaktirati radi potvrde termina i konačnih detalja.';
} else if (completeLead && notificationStatus === 'failed') {
  userCompletionMessage = 'Hvala, Vaš zahtev je sačuvan, ali email obaveštenje operateru trenutno nije poslato. Sistem neće tvrditi da je predaja uspela; neuspešno slanje je evidentirano i može se ponoviti.';
} else if (completeLead && notificationStatus === 'sending') {
  userCompletionMessage = 'Hvala, Vaš zahtev je sačuvan. Status email obaveštenja još nije potvrđen.';
}

return [{ json: {
  ...lead,
  handoff_required: completeLead,
  handoff_channel: notificationStatus === 'sent' ? 'email' : '',
  notification_send_required: false,
  user_completion_message: userCompletionMessage,
  status: notificationStatus === 'sent'
    ? 'handed_off'
    : (completeLead ? (notificationStatus === 'failed' ? 'notification_failed' : 'handoff_pending') : lead.status)
} }];`,
  },
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [1200, -1360],
  id: 'b4d92c4e-9977-48d0-81c8-6e90b3642fa4',
  name: 'Resolve Operator Handoff',
  onError: 'continueErrorOutput',
};

const notificationStateFailure = {
  parameters: {
    jsCode: `return [{ json: {
  text: 'Vaš zahtev je sačuvan, ali trenutno ne mogu pouzdano da potvrdim status email obaveštenja. Neću tvrditi da je predaja uspela. Status je ostao označen za proveru operatera.',
  failure_code: 'NOTIFICATION_STATE_UNAVAILABLE',
  saved: true,
  notification_confirmed: false
} }];`,
  },
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [1200, -2040],
  id: '29efe3ac-fba1-40cd-baa7-c0929ade342a',
  name: 'Return Notification State Failure',
};

workflow.nodes.push(
  shouldSend,
  sendEmail,
  checkEmailResult,
  prepareSuccess,
  prepareFailure,
  saveNotificationStatus,
  checkNotificationSave,
  resolveHandoff,
  notificationStateFailure,
);

workflow.connections['Check Lead Write Result'].main[1] = [
  { node: 'Should Send Operator Email', type: 'main', index: 0 },
];
workflow.connections['Should Send Operator Email'] = {
  main: [
    [{ node: 'Send Operator Email', type: 'main', index: 0 }],
    [{ node: 'Resolve Operator Handoff', type: 'main', index: 0 }],
  ],
};
workflow.connections['Send Operator Email'] = {
  main: [[{ node: 'Check Email Send Result', type: 'main', index: 0 }]],
};
workflow.connections['Check Email Send Result'] = {
  main: [
    [{ node: 'Prepare Notification Failure', type: 'main', index: 0 }],
    [{ node: 'Prepare Notification Success', type: 'main', index: 0 }],
  ],
};
workflow.connections['Prepare Notification Success'] = {
  main: [
    [{ node: 'Save Notification Status', type: 'main', index: 0 }],
    [{ node: 'Return Processing Failure', type: 'main', index: 0 }],
  ],
};
workflow.connections['Prepare Notification Failure'] = {
  main: [
    [{ node: 'Save Notification Status', type: 'main', index: 0 }],
    [{ node: 'Return Processing Failure', type: 'main', index: 0 }],
  ],
};
workflow.connections['Save Notification Status'] = {
  main: [[{ node: 'Check Notification Status Save', type: 'main', index: 0 }]],
};
workflow.connections['Check Notification Status Save'] = {
  main: [
    [{ node: 'Return Notification State Failure', type: 'main', index: 0 }],
    [{ node: 'Resolve Operator Handoff', type: 'main', index: 0 }],
  ],
};
workflow.connections['Resolve Operator Handoff'] = {
  main: [
    [{ node: 'Load Prompt Files', type: 'main', index: 0 }],
    [{ node: 'Return Processing Failure', type: 'main', index: 0 }],
  ],
};

const combinePrompts = node('Combine Prompt Files');
combinePrompts.parameters.jsCode = combinePrompts.parameters.jsCode.replace(
  "const leadState = $('Prepare Operator Handoff').first().json;",
  "const leadState = $('Resolve Operator Handoff').first().json;",
);

const llm = node('Basic LLM Chain');
llm.parameters.text = llm.parameters.text.replace(
  '  user_completion_message: $json.user_completion_message',
  `  user_completion_message: $json.user_completion_message,
  notification_status: $json.notification_status,
  notification_attempts: $json.notification_attempts,
  notification_sent_at: $json.notification_sent_at`,
);

fs.writeFileSync(outputPath, `${JSON.stringify(workflow, null, 2)}\n`, 'utf8');

const errorWorkflow = JSON.parse(fs.readFileSync(errorSourcePath, 'utf8'));
const errorNode = (name) => errorWorkflow.nodes.find((item) => item.name === name);

errorWorkflow.name = 'Project Atlas v1.2 - Error Handler';
errorWorkflow.active = false;
errorWorkflow.versionId = '9637c99f-b59e-40d1-957c-5c7a966d78e8';

const shouldSendErrorEmail = {
  parameters: {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      conditions: [{
        id: 'e7014bb4-52c7-4f3b-9bb7-5977bc73780a-condition',
        leftValue: '={{ $("Sanitize Error Record").first().json.status }}',
        rightValue: 'OPEN',
        operator: { type: 'string', operation: 'equals' },
      }],
      combinator: 'and',
    },
    options: {},
  },
  type: 'n8n-nodes-base.if',
  typeVersion: 2.3,
  position: [560, 0],
  id: 'e7014bb4-52c7-4f3b-9bb7-5977bc73780a',
  name: 'Should Send Error Email',
};

const sendErrorEmail = {
  parameters: {
    fromEmail: `Project Atlas <${OPERATOR_EMAIL}>`,
    toEmail: OPERATOR_EMAIL,
    subject: '=Project Atlas greška | {{ $("Sanitize Error Record").first().json.workflow_name || "Nepoznat workflow" }}',
    emailFormat: 'text',
    text: '={{ "Project Atlas je zabeležio novu grešku.\\n\\nVreme: " + $("Sanitize Error Record").first().json.created_at + "\\nWorkflow: " + ($("Sanitize Error Record").first().json.workflow_name || "Nepoznat") + "\\nPoslednji korak: " + ($("Sanitize Error Record").first().json.last_node || "Nepoznat") + "\\nGreška: " + ($("Sanitize Error Record").first().json.error_message || "Nepoznata") + "\\nExecution ID: " + ($("Sanitize Error Record").first().json.execution_id || "Nije dostupan") + "\\nLink: " + ($("Sanitize Error Record").first().json.execution_url || "Nije dostupan") + "\\n\\nDetalji su sačuvani u Google Sheets kartici Errors." }}',
    options: { appendAttribution: false },
  },
  type: 'n8n-nodes-base.emailSend',
  typeVersion: 2.1,
  position: [800, -80],
  id: '20496db7-e33f-4622-85c5-e08da77f694e',
  name: 'Send Error Email',
  credentials: {
    smtp: { id: SMTP_CREDENTIAL_ID, name: SMTP_CREDENTIAL_NAME },
  },
  retryOnFail: true,
  maxTries: 3,
  waitBetweenTries: 3000,
  onError: 'continueRegularOutput',
};

for (const newNode of [shouldSendErrorEmail, sendErrorEmail]) {
  const existing = errorNode(newNode.name);
  if (existing) Object.assign(existing, newNode);
  else errorWorkflow.nodes.push(newNode);
}

errorWorkflow.connections['Write Error Log'] = {
  main: [[{ node: 'Should Send Error Email', type: 'main', index: 0 }]],
};
errorWorkflow.connections['Should Send Error Email'] = {
  main: [
    [{ node: 'Send Error Email', type: 'main', index: 0 }],
    [],
  ],
};
errorWorkflow.connections['Send Error Email'] = { main: [[]] };

fs.writeFileSync(errorOutputPath, `${JSON.stringify(errorWorkflow, null, 2)}\n`, 'utf8');

console.log(`Napravljen je ${path.basename(outputPath)}.`);
console.log(`Napravljen je ${path.basename(errorOutputPath)}.`);
if (SMTP_CREDENTIAL_ID === 'ATLAS_SMTP_CREDENTIAL_REQUIRED') {
  console.log('Napomena: eksport čeka stvarni SMTP credential ID pre uvoza i objavljivanja.');
}
