// Parser for the course content format (lessons, quizzes and game levels).
//
// A content file is Markdown plus "%%" directive lines. A directive line starts with
// "%%" in column 0. Python never starts a line with "%%", so code is never confused
// with a directive.
//
//   ---                                  optional front matter (key: value)
//   title: Variables
//   ---
//   Markdown…
//
//   %% exercise ex-hello | Say hello      opens a block ("container")
//   Prompt text (Markdown)
//   %% starter                            a section inside the block
//   print("…")
//   %% solution
//   print("hello")
//   %% tests
//   expect_output("hello")
//   %% end                                closes the block
//
// This module is pure (no DOM) so the same parser runs in the browser and in the
// Node validator.

export const CONTAINERS = new Set(['exercise', 'question', 'level', 'tip', 'warn', 'note', 'key', 'file', 'game']);
// Inside an open block these names are sections, not new blocks.
const NESTED_AS_SECTION = new Set(['file', 'note']);
// Sections whose body is Markdown (everything else is raw text such as code).
const MD_SECTIONS = new Set(['hint', 'explain', 'intro', 'success', 'briefing']);

const DIRECTIVE = /^%%\s*([A-Za-z][\w-]*)(?:[ \t]+(.*?))?[ \t]*$/;
const FENCE = /^\s*(`{3,}|~{3,})/;

function coerce(v) {
  const s = String(v).trim();
  if (s === '') return '';
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (s === 'true') return true;
  if (s === 'false') return false;
  if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
    try {
      return JSON.parse(s);
    } catch {
      return s;
    }
  }
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1);
  return s;
}

/** Parse "key: value" lines (used by front matter and %% config sections). */
export function parseKV(text) {
  const out = {};
  let lastKey = null;
  for (const raw of String(text || '').split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const m = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(raw);
    if (m && !/^\s/.test(raw)) {
      out[m[1]] = coerce(m[2]);
      lastKey = m[1];
    } else if (lastKey && /^\s/.test(raw) && typeof out[lastKey] === 'string') {
      out[lastKey] += ' ' + raw.trim();
    }
  }
  return out;
}

function trimBlock(lines) {
  let a = 0;
  let b = lines.length;
  while (a < b && !lines[a].trim()) a++;
  while (b > a && !lines[b - 1].trim()) b--;
  return lines.slice(a, b).join('\n').replace(/[ \t]+$/gm, (m) => m); // keep inner spacing as authored
}

export function parseDoc(text, { file = '' } = {}) {
  const errors = [];
  const all = String(text).replace(/\r\n?/g, '\n').split('\n');
  let start = 0;
  let meta = {};
  if (all[0] && all[0].trim() === '---') {
    let end = -1;
    for (let i = 1; i < all.length; i++) {
      if (all[i].trim() === '---') {
        end = i;
        break;
      }
    }
    if (end === -1) errors.push({ line: 1, message: 'front matter opened with --- but never closed' });
    else {
      meta = parseKV(all.slice(1, end).join('\n'));
      start = end + 1;
    }
  }

  const nodes = [];
  let md = [];
  let mdLine = start + 1;
  let cur = null;
  let sec = null;
  let fence = null;

  const flushMd = () => {
    const t = trimBlock(md);
    let lead = 0;
    while (lead < md.length && !md[lead].trim()) lead++;
    if (t) nodes.push({ type: 'md', text: t, line: mdLine + lead });
    md = [];
  };
  const closeSection = () => {
    if (sec) {
      cur.sections.push({ name: sec.name, arg: sec.arg, text: trimBlock(sec.lines), line: sec.line });
      sec = null;
    }
    fence = null;
  };
  const closeContainer = (endLine) => {
    closeSection();
    cur.main = trimBlock(cur.mainLines);
    delete cur.mainLines;
    cur.endLine = endLine;
    nodes.push(cur);
    cur = null;
    mdLine = endLine + 1;
  };

  for (let li = start; li < all.length; li++) {
    const line = all[li];
    const inRawSection = sec && !MD_SECTIONS.has(sec.name);
    if (!inRawSection) {
      const fm = FENCE.exec(line);
      if (fm) {
        if (!fence) fence = fm[1];
        else if (fm[1][0] === fence[0] && fm[1].length >= fence.length && /^\s*[`~]+\s*$/.test(line)) fence = null;
      }
    }
    const dm = !fence && !inRawSection ? DIRECTIVE.exec(line) : !fence ? DIRECTIVE.exec(line) : null;
    if (!dm) {
      (sec ? sec.lines : cur ? cur.mainLines : md).push(line);
      continue;
    }
    const name = dm[1].toLowerCase();
    const rest = (dm[2] || '').trim();
    if (name === 'end') {
      if (!cur) errors.push({ line: li + 1, message: '"%% end" without an open block' });
      else closeContainer(li + 1);
      continue;
    }
    if (CONTAINERS.has(name) && !(cur && NESTED_AS_SECTION.has(name))) {
      if (cur) {
        errors.push({ line: li + 1, message: `"%% ${name}" starts inside "%% ${cur.name}" (line ${cur.line}); did you forget "%% end"?` });
        closeContainer(li);
      } else flushMd();
      cur = {
        type: 'container',
        name,
        head: rest,
        args: rest ? rest.split('|').map((s) => s.trim()) : [],
        mainLines: [],
        sections: [],
        line: li + 1,
      };
      continue;
    }
    if (!cur) {
      errors.push({ line: li + 1, message: `"%% ${name}" appears outside a block` });
      continue;
    }
    closeSection();
    sec = { name, arg: rest, lines: [], line: li + 1 };
  }
  if (cur) {
    errors.push({ line: cur.line, message: `"%% ${cur.name}" block is never closed with "%% end"` });
    closeContainer(all.length);
  } else flushMd();

  return { meta, nodes, errors, file };
}

export const getSection = (node, name) => node.sections.find((s) => s.name === name)?.text;
export const getSections = (node, name) => node.sections.filter((s) => s.name === name);
export const hasSection = (node, name) => node.sections.some((s) => s.name === name);

/**
 * Parse a fenced-code info string: `python run stdin="Ada\n21" nocheck`
 * → { lang:'python', flags:Set{'run','nocheck'}, attrs:{stdin:'Ada\n21'} }
 */
export function parseInfo(info) {
  const tokens = [];
  const re = /([A-Za-z_][\w-]*)=("(?:\\.|[^"\\])*"|\S*)|(\S+)/g;
  let m;
  while ((m = re.exec(info || ''))) tokens.push(m);
  const out = { lang: '', flags: new Set(), attrs: {} };
  tokens.forEach((t, idx) => {
    if (t[1]) {
      let v = t[2];
      if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) v = v.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      else v = v.replace(/\\n/g, '\n');
      out.attrs[t[1]] = v;
    } else if (idx === 0) out.lang = t[3].toLowerCase();
    else out.flags.add(t[3].toLowerCase());
  });
  return out;
}

/** Convert an exercise/question/stdin text block into the list of lines fed to input(). */
export function stdinLines(text) {
  if (text === undefined || text === null || text === '') return [];
  const s = String(text).replace(/\r\n?/g, '\n');
  const parts = s.split('\n');
  if (parts.length && parts[parts.length - 1] === '') parts.pop();
  return parts;
}
