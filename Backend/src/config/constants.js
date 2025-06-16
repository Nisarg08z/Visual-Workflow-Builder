import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PYTHON_EXECUTOR_SCRIPT = path.resolve(__dirname, '..', '..', 'Compiler', 'main.py');
