import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const sourcePath = path.join(root, 'Workflows', 'project-atlas-v1.0-ai-receptionist.json');
const outputPath = path.join(root, 'Workflows', 'project-atlas-v1.0.1-ai-receptionist.json');

const workflow = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
workflow.name = 'Project Atlas v1.0.1 - AI Receptionist';

const trigger = workflow.nodes.find((item) => item.name === 'When chat message received');
if (!trigger) throw new Error('Chat Trigger nije pronađen.');
trigger.webhookId = '2d12c860-1d8f-4f50-9a84-92f97caa614d';

const prepareLead = workflow.nodes.find((item) => item.name === 'Prepare Lead Data');
if (!prepareLead) throw new Error('Prepare Lead Data nije pronađen.');

let code = prepareLead.parameters.jsCode;

const oldPropertyRule = "if (lowerText.includes('poslovni prostor') || lowerText.includes('kancelarija')) return 'Poslovni prostor';";
const newPropertyRule = `if (
    lowerText.includes('poslovni prostor') ||
    lowerText.includes('poslovnog prostora') ||
    lowerText.includes('poslovnom prostoru') ||
    lowerText.includes('poslovnim prostorom') ||
    lowerText.includes('kancelarija') ||
    lowerText.includes('kancelarije') ||
    lowerText.includes('kancelariji')
  ) return 'Poslovni prostor';`;

const oldCustomerRule = `lowerText.includes('firma') ||
    lowerText.includes('pravno lice')`;
const newCustomerRule = `lowerText.includes('firma') ||
    lowerText.includes('firme') ||
    lowerText.includes('firmi') ||
    lowerText.includes('firmu') ||
    lowerText.includes('firmom') ||
    lowerText.includes('pravno lice')`;

if (!code.includes(oldPropertyRule)) throw new Error('Staro pravilo tipa objekta nije pronađeno.');
if (!code.includes(oldCustomerRule)) throw new Error('Staro pravilo tipa klijenta nije pronađeno.');

code = code.replace(oldPropertyRule, newPropertyRule);
code = code.replace(oldCustomerRule, newCustomerRule);
prepareLead.parameters.jsCode = code;

fs.writeFileSync(outputPath, `${JSON.stringify(workflow, null, 2)}\n`, 'utf8');
console.log(`Napravljen je ${path.basename(outputPath)}.`);
