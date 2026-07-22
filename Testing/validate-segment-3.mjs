import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const workflow = JSON.parse(fs.readFileSync(
  path.join(root, 'Workflows', 'project-atlas-v1.2-ai-receptionist.json'),
  'utf8',
));
const errorWorkflow = JSON.parse(fs.readFileSync(
  path.join(root, 'Workflows', 'project-atlas-v1.2-error-handler.json'),
  'utf8',
));

const checks = [];
const check = (condition, message) => {
  if (!condition) throw new Error(message);
  checks.push(message);
};
const node = (name) => workflow.nodes.find((item) => item.name === name);
const target = (name, output = 0) => workflow.connections[name]?.main?.[output]?.[0]?.node;
const errorNode = (name) => errorWorkflow.nodes.find((item) => item.name === name);
const errorTarget = (name, output = 0) => errorWorkflow.connections[name]?.main?.[output]?.[0]?.node;

check(workflow.name === 'Project Atlas v1.2 - AI Receptionist', 'Workflow nosi v1.2 naziv.');
check(workflow.id === 'ATLASV12S3X2026Z', 'Workflow ima stabilan Segment 3 ID.');
check(workflow.active === false, 'Eksport je bezbedno neaktivan.');
check(workflow.nodes.length === 33, 'Workflow ima očekivana 33 čvora.');
check(new Set(workflow.nodes.map((item) => item.name)).size === 33, 'Svi nazivi čvorova su jedinstveni.');

check(errorWorkflow.name === 'Project Atlas v1.2 - Error Handler', 'Error workflow nosi v1.2 naziv.');
check(errorWorkflow.id === 'ATLASERRS2X2026Z', 'Error workflow zadržava stabilan ID.');
check(errorWorkflow.active === false, 'Error workflow eksport ostaje bezbedno neaktivan.');
check(errorWorkflow.nodes.length === 5, 'Error workflow ima očekivanih 5 čvorova.');
check(new Set(errorWorkflow.nodes.map((item) => item.name)).size === 5, 'Error workflow nazivi čvorova su jedinstveni.');

const shouldSendErrorEmail = errorNode('Should Send Error Email');
const sendErrorEmail = errorNode('Send Error Email');
check(shouldSendErrorEmail?.type === 'n8n-nodes-base.if', 'Error workflow proverava da li je incident OPEN.');
check(
  shouldSendErrorEmail?.parameters.conditions.conditions[0].leftValue.includes('Sanitize Error Record') &&
    shouldSendErrorEmail.parameters.conditions.conditions[0].rightValue === 'OPEN',
  'Samo redigovani OPEN incident može da pošalje email.',
);
check(sendErrorEmail?.type === 'n8n-nodes-base.emailSend', 'Error workflow ima SMTP email čvor.');
check(sendErrorEmail?.parameters.toEmail === 'office@housekeepingbeograd.com', 'Error email ide poslovnom operateru.');
check(sendErrorEmail?.parameters.fromEmail.includes('office@housekeepingbeograd.com'), 'Error email koristi poslovnog pošiljaoca.');
check(Boolean(sendErrorEmail?.credentials?.smtp?.id), 'Error email ima SMTP credential referencu.');
check(sendErrorEmail?.retryOnFail === true && sendErrorEmail?.maxTries === 3, 'Error email ima kontrolisani retry.');
check(sendErrorEmail?.onError === 'continueRegularOutput', 'Neuspeh error emaila ne pravi petlju grešaka.');
check(errorTarget('Write Error Log') === 'Should Send Error Email', 'Posle Errors upisa proverava se email upozorenje.');
check(errorTarget('Should Send Error Email', 0) === 'Send Error Email', 'OPEN grana šalje error email.');
check(errorTarget('Should Send Error Email', 1) === undefined, 'TEST grana ne šalje error email.');
check(
  sendErrorEmail?.parameters.subject.includes('Sanitize Error Record') &&
    sendErrorEmail.parameters.text.includes('error_message'),
  'Error email koristi samo redigovani zapis incidenta.',
);

const emailNode = node('Send Operator Email');
check(emailNode?.type === 'n8n-nodes-base.emailSend', 'SMTP email čvor je prisutan.');
check(emailNode?.typeVersion === 2.1, 'Email čvor koristi lokalno podržanu verziju 2.1.');
check(emailNode?.parameters.toEmail === 'office@housekeepingbeograd.com', 'Operaterski email je tačno podešen.');
check(emailNode?.parameters.fromEmail.includes('office@housekeepingbeograd.com'), 'Pošiljalac koristi poslovnu adresu.');
check(emailNode?.retryOnFail === true && emailNode?.maxTries === 3, 'Email slanje ima kontrolisani retry.');
check(emailNode?.onError === 'continueRegularOutput', 'Email greška prelazi u kontrolisanu obradu.');
check(Boolean(emailNode?.credentials?.smtp?.id), 'SMTP credential referenca postoji.');
check(
  node('Should Send Operator Email')?.parameters.conditions.conditions[0].leftValue.includes('Prepare Operator Handoff'),
  'Odluka o slanju koristi sačuvani handoff kontekst i posle Sheets upisa.',
);
check(
  emailNode?.parameters.subject.includes('Prepare Operator Handoff'),
  'Email naslov koristi sačuvani handoff kontekst.',
);
check(
  emailNode?.parameters.text.includes('Prepare Operator Handoff') && emailNode.parameters.text.includes('operator_summary'),
  'Email telo koristi kompletan operator summary iz handoff konteksta.',
);

check(target('Check Lead Write Result', 1) === 'Should Send Operator Email', 'Posle čuvanja leada proverava se potreba za slanjem.');
check(target('Should Send Operator Email', 0) === 'Send Operator Email', 'Samo true grana šalje email.');
check(target('Should Send Operator Email', 1) === 'Resolve Operator Handoff', 'Deduplikovana grana preskače email.');
check(target('Send Operator Email') === 'Check Email Send Result', 'Rezultat email slanja se proverava.');
check(target('Check Email Send Result', 0) === 'Prepare Notification Failure', 'Greška emaila se beleži kao failed.');
check(target('Check Email Send Result', 1) === 'Prepare Notification Success', 'Uspeh emaila se beleži kao sent.');
check(target('Prepare Notification Success') === 'Save Notification Status', 'Uspešan status se čuva u Sheets.');
check(target('Prepare Notification Failure') === 'Save Notification Status', 'Neuspešan status se čuva u Sheets.');
check(target('Save Notification Status') === 'Check Notification Status Save', 'Čuvanje notification statusa se proverava.');
check(target('Check Notification Status Save', 0) === 'Return Notification State Failure', 'Neuspeh čuvanja statusa ne daje lažnu potvrdu.');
check(target('Check Notification Status Save', 1) === 'Resolve Operator Handoff', 'Sačuvan status nastavlja ka tačnom odgovoru.');
check(target('Resolve Operator Handoff') === 'Load Prompt Files', 'Tek razrešen handoff nastavlja ka AI odgovoru.');

const notificationColumns = [
  'notification_key', 'notification_status', 'notification_attempts',
  'notification_last_attempt_at', 'notification_sent_at',
  'notification_message_id', 'notification_error',
];
for (const sheetName of ['Append or update row in sheet', 'Save Notification Status', 'Save Conversation Context']) {
  const sheet = node(sheetName);
  for (const column of notificationColumns) {
    check(Object.hasOwn(sheet.parameters.columns.value, column), `${sheetName}: mapira ${column}.`);
  }
}

const runCode = (name, { json = {}, lookup = {} } = {}) => {
  const fn = new Function('$json', '$', node(name).parameters.jsCode);
  const select = (selectedName) => ({
    first: () => ({ json: lookup[selectedName] || {} }),
  });
  return fn(json, select)[0].json;
};

const completeLead = {
  session_id: 'segment-3-test',
  name: 'Test Klijent',
  phone: '0601111111',
  email: 'test@example.com',
  service_type: 'Generalno čišćenje',
  location: 'Beograd',
  property_type: 'Stan',
  square_meters: '60',
  desired_date: '25.07.2026',
  customer_type: 'Fizičko lice',
  request_summary: 'Test zahtev',
  completion_percent: 100,
  is_complete: true,
  status: 'ready_for_operator',
  notification_attempts: 0,
};

const firstAttempt = runCode('Prepare Operator Handoff', { json: completeLead });
check(firstAttempt.handoff_required === true, 'Kompletan lead aktivira handoff.');
check(firstAttempt.notification_send_required === true, 'Prvi kompletan lead traži email slanje.');
check(firstAttempt.notification_status === 'sending', 'Pre slanja se upisuje status sending.');
check(firstAttempt.notification_attempts === 1, 'Prvi pokušaj ima brojač 1.');
check(firstAttempt.notification_key === 'atlas:segment-3-test:operator-handoff:v1', 'Deduplikacioni ključ je stabilan.');
check(!/uspešno prosleđen|zahtev je prosleđen/i.test(firstAttempt.user_completion_message), 'Pre SMTP potvrde nema lažne potvrde.');

const alreadySent = runCode('Prepare Operator Handoff', {
  json: { ...completeLead, notification_status: 'sent', notification_attempts: 1, notification_message_id: 'msg-1' },
});
check(alreadySent.notification_send_required === false, 'Već poslati lead ne šalje duplikat.');
check(alreadySent.notification_attempts === 1, 'Deduplikovana poruka ne povećava brojač.');
check(alreadySent.status === 'handed_off', 'Već poslati lead ostaje handed_off.');

const retry = runCode('Prepare Operator Handoff', {
  json: { ...completeLead, notification_status: 'failed', notification_attempts: 1, notification_error: 'stara greška' },
});
check(retry.notification_send_required === true, 'Failed status je moguće ponoviti.');
check(retry.notification_attempts === 2, 'Ponovljeni pokušaj povećava brojač.');
check(retry.notification_status === 'sending', 'Retry prvo vraća bezbedan status sending.');

const inProgress = runCode('Prepare Operator Handoff', {
  json: { ...completeLead, notification_status: 'sending', notification_attempts: 1 },
});
check(inProgress.notification_send_required === false, 'Sending status sprečava paralelni duplikat.');
check(!/uspešno prosleđen|zahtev je prosleđen/i.test(inProgress.user_completion_message), 'Sending status ne tvrdi da je poslato.');

const success = runCode('Prepare Notification Success', {
  json: { messageId: '<atlas-message-id>' },
  lookup: { 'Prepare Operator Handoff': firstAttempt },
});
check(success.notification_status === 'sent', 'SMTP uspeh postavlja sent.');
check(success.notification_message_id === '<atlas-message-id>', 'SMTP message ID se čuva.');
check(success.status === 'handed_off', 'SMTP uspeh postavlja handed_off.');

const failure = runCode('Prepare Notification Failure', {
  json: { error: { message: 'SMTP problem za 0601111111 i test@example.com' } },
  lookup: { 'Prepare Operator Handoff': firstAttempt },
});
check(failure.notification_status === 'failed', 'SMTP greška postavlja failed.');
check(failure.status === 'notification_failed', 'SMTP greška dobija jasan lead status.');
check(failure.notification_error.includes('[PHONE]'), 'Telefon se uklanja iz email greške.');
check(failure.notification_error.includes('[EMAIL]'), 'Email se uklanja iz email greške.');

const resolvedSuccess = runCode('Resolve Operator Handoff', {
  json: success,
  lookup: { 'Prepare Operator Handoff': firstAttempt },
});
check(/uspešno prosleđen/.test(resolvedSuccess.user_completion_message), 'Tek potvrđeni sent dobija uspešnu poruku korisniku.');

const resolvedFailure = runCode('Resolve Operator Handoff', {
  json: failure,
  lookup: { 'Prepare Operator Handoff': firstAttempt },
});
check(!/uspešno prosleđen|zahtev je prosleđen/i.test(resolvedFailure.user_completion_message), 'Failed odgovor nema lažnu potvrdu.');
check(/nije poslato/.test(resolvedFailure.user_completion_message), 'Failed odgovor iskreno prijavljuje neuspeh.');

const stateFailureFn = new Function(node('Return Notification State Failure').parameters.jsCode);
const stateFailure = stateFailureFn()[0].json;
check(stateFailure.saved === true, 'Fallback zna da je lead prethodno sačuvan.');
check(stateFailure.notification_confirmed === false, 'Fallback ne potvrđuje nepoznat status emaila.');
check(!/uspešno|prosleđen je/i.test(stateFailure.text), 'Fallback nema lažnu potvrdu.');

check(node('Combine Prompt Files').parameters.jsCode.includes("$('Resolve Operator Handoff')"), 'Prompt koristi konačan notification ishod.');
check(node('Basic LLM Chain').parameters.text.includes('notification_status'), 'AI prompt dobija notification status.');

const serialized = JSON.stringify([workflow, errorWorkflow]);
for (const forbidden of ['access_token', 'refresh_token', 'client_secret', 'encryptionKey', 'sk-']) {
  check(!serialized.includes(forbidden), `Eksport ne sadrži tajnu: ${forbidden}`);
}

console.log(`Segment 3 validacija: ${checks.length}/${checks.length} provera je prošlo.`);
