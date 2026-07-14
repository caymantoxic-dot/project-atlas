import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const source = path.join(root, 'Workflows', 'project-atlas-v0.5-ai-receptionist-segment-7.json');
const target = path.join(root, 'Workflows', 'project-atlas-v1.0-ai-receptionist.json');
const workflow = JSON.parse(fs.readFileSync(source, 'utf8'));
workflow.name = 'Project Atlas v1.0 - AI Receptionist';
fs.writeFileSync(target, JSON.stringify(workflow, null, 2) + '\n', 'utf8');
console.log(`Kreiran ${path.relative(root, target)} sa ${workflow.nodes.length} čvorova.`);
