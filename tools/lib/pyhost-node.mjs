// Loads Pyodide in Node and wires up the same host.py the browser uses.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '..', '..');

export async function startHost({ log = () => {} } = {}) {
  const pyodideDir = path.join(ROOT, 'tools', 'node_modules', 'pyodide');
  const { loadPyodide } = await import(pathToFileURL(path.join(pyodideDir, 'pyodide.mjs')).href);
  const { createHost } = await import(pathToFileURL(path.join(ROOT, 'js', 'py', 'host.js')).href);
  const t0 = Date.now();
  const pyodide = await loadPyodide({ indexURL: pyodideDir + path.sep });
  const hostSource = fs.readFileSync(path.join(ROOT, 'js', 'py', 'host.py'), 'utf8');
  const host = await createHost(pyodide, hostSource, { emit: () => {}, requestInput: async () => null });
  log(`Pyodide ${host.info.python} ready in ${Date.now() - t0} ms`);
  return { pyodide, host, execute: (req) => host.execute({ forward: false, ...req }) };
}
