import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const sourcePath = path.join(root, 'Workflows', 'project-atlas-v1.0.1-ai-receptionist.json');
const mainOutputPath = path.join(root, 'Workflows', 'project-atlas-v1.1-ai-receptionist.json');
const errorOutputPath = path.join(root, 'Workflows', 'project-atlas-v1.1-error-handler.json');

const MAIN_WORKFLOW_ID = 'ATLASV11S2X2026Z';
const ERROR_WORKFLOW_ID = 'ATLASERRS2X2026Z';
const ERRORS_SHEET_ID = 1311784010;

const workflow = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const node = (name) => workflow.nodes.find((item) => item.name === name);

workflow.id = MAIN_WORKFLOW_ID;
workflow.name = 'Project Atlas v1.1 - AI Receptionist';
workflow.active = false;
workflow.versionId = 'd474fe68-2c82-4dbc-87ee-37a3469fb08c';
workflow.settings = {
  ...workflow.settings,
  errorWorkflow: ERROR_WORKFLOW_ID,
  saveDataErrorExecution: 'all',
  saveDataSuccessExecution: 'all',
  saveExecutionProgress: true,
  saveManualExecutions: true,
};

const trigger = node('When chat message received');
if (!trigger) throw new Error('Chat Trigger nije pronađen.');
trigger.webhookId = '8c4a88a6-90dc-4dce-aee7-e4b6937d77d0';

const retryNodes = [
  'Read/Write Files from Disk',
  'Find Existing Lead',
  'Append or update row in sheet',
  'Load Prompt Files',
  'Basic LLM Chain',
  'Save Conversation Context',
];

for (const name of retryNodes) {
  const item = node(name);
  if (!item) throw new Error(`Nedostaje čvor za retry: ${name}`);
  item.retryOnFail = true;
  item.maxTries = 3;
  item.waitBetweenTries = 1500;
}

const fallbackDefinitions = [
  {
    name: 'Return Knowledge Failure',
    id: '34b8d5fd-f5d4-43bb-a25a-c6d1c202d3bd',
    position: [-800, -2200],
    code: `return [{ json: {
  text: 'Trenutno ne mogu pouzdano da proverim informacije firme. Vaš zahtev nije potvrđen. Pokušajte ponovo malo kasnije ili kontaktirajte operatera.',
  failure_code: 'KNOWLEDGE_UNAVAILABLE',
  saved: false
} }];`,
  },
  {
    name: 'Return Sheets Failure',
    id: 'fa6f758b-2c95-477c-a749-f105b8aa0b8a',
    position: [-400, -2200],
    code: `return [{ json: {
  text: 'Trenutno ne mogu da sačuvam vaš zahtev, zato ga neću označiti kao primljenog. Pokušajte ponovo malo kasnije ili kontaktirajte operatera.',
  failure_code: 'DATA_STORE_UNAVAILABLE',
  saved: false
} }];`,
  },
  {
    name: 'Return AI Failure',
    id: 'd270ecfb-b5d0-46a7-9afa-b6f7e89635be',
    position: [0, -2200],
    code: `return [{ json: {
  text: 'Trenutno ne mogu da obradim poruku. Vaš zahtev nije potvrđen. Pokušajte ponovo malo kasnije ili kontaktirajte operatera.',
  failure_code: 'AI_UNAVAILABLE',
  saved: false
} }];`,
  },
  {
    name: 'Return Processing Failure',
    id: '8eff66a5-888e-43b3-b81a-2d15ff89d280',
    position: [400, -2200],
    code: `return [{ json: {
  text: 'Došlo je do privremenog problema i zahtev nije potvrđen. Pokušajte ponovo malo kasnije ili kontaktirajte operatera.',
  failure_code: 'PROCESSING_FAILURE',
  saved: false
} }];`,
  },
];

for (const fallback of fallbackDefinitions) {
  workflow.nodes.push({
    parameters: { jsCode: fallback.code },
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: fallback.position,
    id: fallback.id,
    name: fallback.name,
  });
}

const sheetsErrorRouters = [
  {
    source: 'Find Existing Lead',
    name: 'Check Sheets Read Result',
    successTarget: 'Merge Lead Data',
    id: '111617db-96b5-4f18-b8a8-8b1f01bd18f1',
    position: [-640, -1760],
  },
  {
    source: 'Append or update row in sheet',
    name: 'Check Lead Write Result',
    successTarget: 'Load Prompt Files',
    id: '222728ec-a7c6-4029-c9b9-9c2f12ce29f2',
    position: [-480, -1440],
  },
  {
    source: 'Save Conversation Context',
    name: 'Check Context Save Result',
    successTarget: 'Return Chat Response',
    id: '333839fd-b8d7-413a-daca-ad3023df30f3',
    position: [480, -1440],
  },
];

for (const router of sheetsErrorRouters) {
  workflow.nodes.push({
    parameters: {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: '',
          typeValidation: 'strict',
          version: 3,
        },
        conditions: [
          {
            id: `${router.id}-condition`,
            leftValue: '={{ $json.error || "" }}',
            rightValue: '',
            operator: {
              type: 'string',
              operation: 'notEmpty',
              singleValue: true,
            },
          },
        ],
        combinator: 'and',
      },
      options: {},
    },
    type: 'n8n-nodes-base.if',
    typeVersion: 2.3,
    position: router.position,
    id: router.id,
    name: router.name,
  });
}

function connectError(sourceName, targetName) {
  const source = node(sourceName);
  if (!source) throw new Error(`Nedostaje izvorni čvor: ${sourceName}`);
  source.onError = 'continueErrorOutput';
  workflow.connections[sourceName] ??= { main: [] };
  workflow.connections[sourceName].main ??= [];
  while (workflow.connections[sourceName].main.length < 2) {
    workflow.connections[sourceName].main.push([]);
  }
  workflow.connections[sourceName].main[1] = [{ node: targetName, type: 'main', index: 0 }];
}

for (const name of ['Read/Write Files from Disk', 'Code in JavaScript', 'Load Prompt Files', 'Combine Prompt Files']) {
  connectError(name, 'Return Knowledge Failure');
}

for (const router of sheetsErrorRouters) {
  const source = node(router.source);
  source.onError = 'continueRegularOutput';
  workflow.connections[router.source] = {
    main: [[{ node: router.name, type: 'main', index: 0 }]],
  };
  workflow.connections[router.name] = {
    main: [
      [{ node: 'Return Sheets Failure', type: 'main', index: 0 }],
      [{ node: router.successTarget, type: 'main', index: 0 }],
    ],
  };
}

connectError('Basic LLM Chain', 'Return AI Failure');

for (const name of [
  'Prepare Lead Data',
  'Merge Lead Data',
  'Select Next Question',
  'Evaluate Lead Completeness',
  'Prepare Operator Handoff',
  'Store Conversation Context',
  'Return Chat Response',
]) {
  connectError(name, 'Return Processing Failure');
}

const sourceSheetNode = node('Append or update row in sheet');
if (!sourceSheetNode) throw new Error('Google Sheets šablon nije pronađen.');

const errorTrigger = {
  parameters: {},
  type: 'n8n-nodes-base.errorTrigger',
  typeVersion: 1,
  position: [-480, -160],
  id: '2facf9ce-4770-4130-ab3e-fb7ca1f328dd',
  name: 'Error Trigger',
};

const sanitizeError = {
  parameters: {
    jsCode: `const input = $input.first().json || {};
const execution = input.execution || {};
const workflow = input.workflow || {};
const rawMessage = String(execution.error?.message || input.error?.message || 'Nepoznata greška');
const safeMessage = rawMessage
  .replace(/(?:\\+381|0)6\\d[\\s\\/.-]?\\d{3}[\\s\\/.-]?\\d{3,4}/g, '[PHONE]')
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/gi, '[EMAIL]')
  .slice(0, 500);
const createdAt = new Date().toLocaleString('sv-SE', {
  timeZone: 'Europe/Belgrade',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
});

return [{ json: {
  created_at: createdAt,
  status: (!execution.id && !workflow.id) ||
    (execution.mode === 'manual' && workflow.name === 'Example Workflow') ? 'TEST' : 'OPEN',
  workflow_id: String(workflow.id || ''),
  workflow_name: String(workflow.name || ''),
  execution_id: String(execution.id || ''),
  execution_url: String(execution.url || ''),
  last_node: String(execution.lastNodeExecuted || ''),
  error_message: safeMessage,
  retry_of: String(execution.retryOf || ''),
  mode: String(execution.mode || '')
} }];`,
  },
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [-240, -160],
  id: '0c991f18-a2d3-4267-b446-7d7f09a2948c',
  name: 'Sanitize Error Record',
};

const writeErrorLog = structuredClone(sourceSheetNode);
writeErrorLog.id = 'c134eb8e-d8df-45b9-b8e7-67ff5accbf86';
writeErrorLog.name = 'Write Error Log';
writeErrorLog.position = [0, -160];
writeErrorLog.parameters.operation = 'append';
writeErrorLog.parameters.documentId = {
  __rl: true,
  value: '1hNomH7Al5Cg72E9dv24L7Klc3uJrVbrP9VAaLDjgHgg',
  mode: 'list',
  cachedResultName: 'Project Atlas - Housekeeping Leads',
  cachedResultUrl: 'https://docs.google.com/spreadsheets/d/1hNomH7Al5Cg72E9dv24L7Klc3uJrVbrP9VAaLDjgHgg/edit',
};
writeErrorLog.parameters.sheetName = {
  __rl: true,
  value: String(ERRORS_SHEET_ID),
  mode: 'list',
  cachedResultName: 'Errors',
  cachedResultUrl: `https://docs.google.com/spreadsheets/d/1hNomH7Al5Cg72E9dv24L7Klc3uJrVbrP9VAaLDjgHgg/edit#gid=${ERRORS_SHEET_ID}`,
};
const errorColumns = [
  'created_at', 'status', 'workflow_id', 'workflow_name', 'execution_id',
  'execution_url', 'last_node', 'error_message', 'retry_of', 'mode',
];
writeErrorLog.parameters.columns = {
  mappingMode: 'defineBelow',
  value: Object.fromEntries(errorColumns.map((column) => [column, `={{ $json.${column} }}`])),
  matchingColumns: [],
  schema: errorColumns.map((column) => ({
    id: column,
    displayName: column,
    required: false,
    defaultMatch: false,
    display: true,
    type: 'string',
    canBeUsedToMatch: true,
  })),
  attemptToConvertTypes: false,
  convertFieldsToString: false,
};
writeErrorLog.parameters.options = {};
writeErrorLog.alwaysOutputData = true;
writeErrorLog.retryOnFail = true;
writeErrorLog.maxTries = 3;
writeErrorLog.waitBetweenTries = 2000;
writeErrorLog.onError = 'continueRegularOutput';

const errorWorkflow = {
  name: 'Project Atlas v1.1 - Error Handler',
  nodes: [errorTrigger, sanitizeError, writeErrorLog],
  pinData: {},
  connections: {
    'Error Trigger': { main: [[{ node: 'Sanitize Error Record', type: 'main', index: 0 }]] },
    'Sanitize Error Record': { main: [[{ node: 'Write Error Log', type: 'main', index: 0 }]] },
  },
  active: false,
  settings: {
    executionOrder: 'v1',
    saveDataErrorExecution: 'all',
    saveDataSuccessExecution: 'all',
    saveExecutionProgress: true,
    saveManualExecutions: true,
    availableInMCP: false,
  },
  versionId: '4b968d16-138a-4b3b-93dc-31b62b4d0f0e',
  meta: structuredClone(workflow.meta ?? {}),
  nodeGroups: [],
  id: ERROR_WORKFLOW_ID,
  tags: [],
};

fs.writeFileSync(mainOutputPath, `${JSON.stringify(workflow, null, 2)}\n`, 'utf8');
fs.writeFileSync(errorOutputPath, `${JSON.stringify(errorWorkflow, null, 2)}\n`, 'utf8');

console.log(`Napravljen je ${path.basename(mainOutputPath)}.`);
console.log(`Napravljen je ${path.basename(errorOutputPath)}.`);
