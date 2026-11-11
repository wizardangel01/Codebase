// JavaScript side of the Python host. Shared by the browser worker (worker.js) and the
// Node validator (tools/validate.mjs). It receives an initialised Pyodide instance and
// the text of host.py (fetched in the browser, read from disk in Node).

/**
 * @param pyodide  a loaded Pyodide instance
 * @param hostSource  text of host.py
 * @param callbacks { emit(kind, text), requestInput(prompt) -> Promise<string|null> }
 */
export async function createHost(pyodide, hostSource, callbacks = {}) {
  const emit = callbacks.emit || (() => {});
  const requestInput = callbacks.requestInput || (async () => null);
  pyodide.runPython(hostSource);
  const configure = pyodide.globals.get('__cq_configure');
  configure(emit, requestInput);
  configure.destroy();
  const run = pyodide.globals.get('__cq_run');
  const info = JSON.parse(pyodide.runPython('__cq_info()'));
  let jspi = false;
  try {
    jspi = !!(await pyodide.runPythonAsync('from pyodide.ffi import can_run_sync\ncan_run_sync()'));
  } catch {
    jspi = false;
  }
  info.can_run_sync = jspi;
  return {
    info,
    /** Execute one request (see host.py for the shape). Resolves to the parsed result object. */
    async execute(request) {
      const text = await run(JSON.stringify(request));
      return JSON.parse(text);
    },
  };
}
