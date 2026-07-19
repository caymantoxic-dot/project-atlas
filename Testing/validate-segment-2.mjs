import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const main = JSON.parse(fs.readFileSync(path.join(root, 'Workflows', 'project-atlas-v1.1-ai-receptionist.json'), 'utf8'));
const errors = JSON.parse(fs.readFileSync(path.join(root, 'Workflows', 'project-atlas-v1.1-error-handler.json'), 'utf8'));

const checks = [];
const check = (condition, message) => {
  if (!condition) throw new Error(message);
  checks.push(message);
};
const node = (workflow, name) => workflow.nodes.find((item) => item.name === name);
const errorTarget = (workflow, name) => workflow.connections[name]?.main?.[1]?.[0]?.node;
const outputTarget = (workflow, name, outputIndex = 0) => workflow.connections[name]?.main?.[outputIndex]?.[0]?.node;

check(main.name === 'Project Atlas v1.1 - AI Receptionist', 'Glavni workflow nosi v1.1 naziv.');
check(main.id === 'ATLASV11S2X2026Z', 'Glavni workflow ima stabilan Segment 2 ID.');
check(main.nodes.length === 24, 'Glavni workflow ima 24 čvora.');
check(new Set(main.nodes.map((item) => item.name)).size === 24, 'Nazivi glavnih čvorova su jedinstveni.');
check(main.settings.errorWorkflow === 'ATLASERRS2X2026Z', 'Glavni workflow je povezan sa error workflow-om.');
check(main.settings.saveExecutionProgress === true, 'Čuva se napredak izvršenja.');
check(main.settings.saveDataErrorExecution === 'all', 'Čuvaju se neuspešna izvršenja.');
check(main.settings.saveDataSuccessExecution === 'all', 'Čuvaju se uspešna izvršenja tokom stabilizacije.');

const retryNodes = [
  'Read/Write Files from Disk',
  'Find Existing Lead',
  'Append or update row in sheet',
  'Load Prompt Files',
  'Basic LLM Chain',
  'Save Conversation Context',
];
for (const name of retryNodes) {
  const item = node(main, name);
  check(item.retryOnFail === true, `${name}: retry je uključen.`);
  check(item.maxTries === 3, `${name}: najviše tri pokušaja.`);
  check(item.waitBetweenTries === 1500, `${name}: čekanje između pokušaja je kontrolisano.`);
}

for (const name of ['Read/Write Files from Disk', 'Code in JavaScript', 'Load Prompt Files', 'Combine Prompt Files']) {
  check(node(main, name).onError === 'continueErrorOutput', `${name}: greška ide na kontrolisani izlaz.`);
  check(errorTarget(main, name) === 'Return Knowledge Failure', `${name}: koristi Knowledge fallback.`);
}
const sheetsRoutes = [
  ['Find Existing Lead', 'Check Sheets Read Result', 'Merge Lead Data'],
  ['Append or update row in sheet', 'Check Lead Write Result', 'Load Prompt Files'],
  ['Save Conversation Context', 'Check Context Save Result', 'Return Chat Response'],
];
for (const [sourceName, routerName, successTarget] of sheetsRoutes) {
  check(node(main, sourceName).onError === 'continueRegularOutput', `${sourceName}: rezultat i greška idu kroz jedan kontrolisani izlaz.`);
  check(outputTarget(main, sourceName) === routerName, `${sourceName}: prvo prolazi kroz proveru rezultata.`);
  check(node(main, routerName)?.type === 'n8n-nodes-base.if', `${routerName}: IF kontrola je prisutna.`);
  check(outputTarget(main, routerName, 0) === 'Return Sheets Failure', `${routerName}: greška koristi Sheets fallback.`);
  check(outputTarget(main, routerName, 1) === successTarget, `${routerName}: samo uspeh nastavlja normalan tok.`);
}
check(errorTarget(main, 'Basic LLM Chain') === 'Return AI Failure', 'AI greška koristi AI fallback.');

const processingNodes = [
  'Prepare Lead Data', 'Merge Lead Data', 'Select Next Question', 'Evaluate Lead Completeness',
  'Prepare Operator Handoff', 'Store Conversation Context', 'Return Chat Response',
];
for (const name of processingNodes) {
  check(errorTarget(main, name) === 'Return Processing Failure', `${name}: koristi opšti bezbedni fallback.`);
}

const runFallback = (name) => {
  const fn = new Function('$input', node(main, name).parameters.jsCode);
  return fn({ first: () => ({ json: { error: { message: 'test' } } }) })[0].json;
};
const knowledgeFallback = runFallback('Return Knowledge Failure');
const sheetsFallback = runFallback('Return Sheets Failure');
const aiFallback = runFallback('Return AI Failure');
const processingFallback = runFallback('Return Processing Failure');
for (const fallback of [knowledgeFallback, sheetsFallback, aiFallback, processingFallback]) {
  check(fallback.saved === false, `${fallback.failure_code}: ne tvrdi da je zahtev sačuvan.`);
  check(/nije potvrđen|neću označiti kao primljenog/.test(fallback.text), `${fallback.failure_code}: korisnik dobija jasnu poruku.`);
}
check(/ne mogu da sačuvam/.test(sheetsFallback.text), 'Sheets fallback izričito prijavljuje neuspešno čuvanje.');
check(!/uspešno|sačuvan je|prosleđen je/i.test(sheetsFallback.text), 'Sheets fallback nema lažnu potvrdu.');

check(errors.name === 'Project Atlas v1.1 - Error Handler', 'Error workflow ima jasan naziv.');
check(errors.id === 'ATLASERRS2X2026Z', 'Error workflow ima stabilan ID.');
check(errors.nodes.length === 3, 'Error workflow ima tri čvora.');
check(node(errors, 'Error Trigger')?.type === 'n8n-nodes-base.errorTrigger', 'Error Trigger je prisutan.');
check(Boolean(node(errors, 'Sanitize Error Record')), 'Sanitize Error Record je prisutan.');
check(Boolean(node(errors, 'Write Error Log')), 'Write Error Log je prisutan.');

const sanitize = new Function('$input', node(errors, 'Sanitize Error Record').parameters.jsCode);
const sanitized = sanitize({
  first: () => ({
    json: {
      execution: {
        id: '123',
        url: 'http://localhost:5678/execution/123',
        error: { message: 'Kontakt 0601111111 i test@example.com', stack: 'secret stack' },
        lastNodeExecuted: 'Test Node',
        mode: 'webhook',
      },
      workflow: { id: 'wf-1', name: 'Test Workflow' },
    },
  }),
})[0].json;
check(sanitized.error_message.includes('[PHONE]'), 'Telefon se uklanja iz error poruke.');
check(sanitized.error_message.includes('[EMAIL]'), 'Email se uklanja iz error poruke.');
check(!JSON.stringify(sanitized).includes('secret stack'), 'Stack se ne upisuje u Errors tabelu.');
check(sanitized.status === 'OPEN', 'Nova greška dobija status OPEN.');
const cliProbe = sanitize({ first: () => ({ json: {} }) })[0].json;
check(cliProbe.status === 'TEST', 'Prazan CLI probe zapis dobija status TEST.');

const errorLog = node(errors, 'Write Error Log');
check(errorLog.parameters.operation === 'append', 'Error zapis se dodaje kao novi red.');
check(errorLog.parameters.sheetName.cachedResultName === 'Errors', 'Error zapis ide u Errors tab.');
check(errorLog.parameters.sheetName.value === '1311784010', 'Error workflow koristi potvrđeni Errors sheet ID.');
check(errorLog.retryOnFail === true && errorLog.maxTries === 3, 'Upis greške ima retry zaštitu.');
check(errorLog.onError === 'continueRegularOutput', 'Kvar error loga ne pokreće beskonačnu petlju.');

const serialized = `${JSON.stringify(main)}\n${JSON.stringify(errors)}`;
for (const forbidden of ['access_token', 'refresh_token', 'client_secret', 'encryptionKey', 'sk-']) {
  check(!serialized.includes(forbidden), `Eksport ne sadrži tajnu: ${forbidden}`);
}

console.log(`Segment 2 validacija: ${checks.length}/${checks.length} provjera je prošlo.`);
