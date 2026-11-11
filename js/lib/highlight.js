// A small Python tokenizer + HTML renderer used for static code, the editor overlay
// and the step-through visualizer. Pure functions, no DOM.
//
// Token types (CSS classes are `t-<type>`):
//   c comment   s string   i f-string interpolation   n number   k keyword
//   b builtin   f def/class name   d decorator   o operator   p punctuation
//   x exception-like names (ValueError, ...)   v plain identifier   w whitespace

import { esc } from './util.js';

const KEYWORDS = new Set(
  'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(
    ' '
  )
);

const BUILTINS = new Set(
  `abs all any ascii bin bool breakpoint bytearray bytes callable chr classmethod compile complex delattr dict dir divmod enumerate eval exec filter float format frozenset getattr globals hasattr hash help hex id input int isinstance issubclass iter len list locals map max memoryview min next object oct open ord pow print property range repr reversed round set setattr slice sorted staticmethod str sum super tuple type vars zip self cls __name__ __init__ __main__`.split(
    /\s+/
  )
);

const STRING_RE =
  /(?:[rRbBuUfF]{1,2})?(?:'''[\s\S]*?(?:'''|$)|"""[\s\S]*?(?:"""|$)|'(?:\\[\s\S]|[^'\\\n])*(?:'|$)|"(?:\\[\s\S]|[^"\\\n])*(?:"|$))/y;
const NUMBER_RE = /(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?[jJ]?)/y;
const IDENT_RE = /[A-Za-z_¡-￿][\w¡-￿]*/y;
const OP_RE = /\*\*=?|\/\/=?|>>=?|<<=?|[-+*\/%@&|^~<>=!]=?|:=|->|\.\.\./y;

function splitFString(text, out) {
  // text is a full string token with an f/F prefix. Split into literal and {…} parts.
  let i = 0;
  let lit = '';
  const flush = () => {
    if (lit) out.push(['s', lit]);
    lit = '';
  };
  // Find where the opening quote ends so the prefix+quote stay in the literal.
  while (i < text.length) {
    const ch = text[i];
    if (ch === '{' && text[i + 1] === '{') {
      lit += '{{';
      i += 2;
    } else if (ch === '}' && text[i + 1] === '}') {
      lit += '}}';
      i += 2;
    } else if (ch === '{') {
      flush();
      let depth = 0;
      let j = i;
      for (; j < text.length; j++) {
        if (text[j] === '{') depth++;
        else if (text[j] === '}') {
          depth--;
          if (depth === 0) {
            j++;
            break;
          }
        }
      }
      out.push(['i', text.slice(i, j)]);
      i = j;
    } else {
      lit += ch;
      i++;
    }
  }
  flush();
}

export function tokenize(src) {
  const out = [];
  const n = src.length;
  let i = 0;
  let prevSig = ''; // previous significant token text (for def/class/decorator detection)
  let lineStart = true;
  while (i < n) {
    const ch = src[i];
    if (ch === '\n') {
      out.push(['w', '\n']);
      i++;
      lineStart = true;
      continue;
    }
    if (ch === ' ' || ch === '\t' || ch === '\r') {
      let j = i;
      while (j < n && (src[j] === ' ' || src[j] === '\t' || src[j] === '\r')) j++;
      out.push(['w', src.slice(i, j)]);
      i = j;
      continue;
    }
    if (ch === '#') {
      let j = src.indexOf('\n', i);
      if (j === -1) j = n;
      out.push(['c', src.slice(i, j)]);
      i = j;
      continue;
    }
    // strings (with optional prefix)
    if (ch === '"' || ch === "'" || /[rRbBuUfF]/.test(ch)) {
      STRING_RE.lastIndex = i;
      const m = STRING_RE.exec(src);
      if (m && m.index === i && m[0].length > 0) {
        const tok = m[0];
        const prefix = /^[rRbBuUfF]{0,2}/.exec(tok)[0];
        if (/[fF]/.test(prefix)) splitFString(tok, out);
        else out.push(['s', tok]);
        i += tok.length;
        prevSig = 's';
        lineStart = false;
        continue;
      }
    }
    if (ch === '@' && lineStart) {
      IDENT_RE.lastIndex = i + 1;
      const m = IDENT_RE.exec(src);
      if (m && m.index === i + 1) {
        let j = i + 1 + m[0].length;
        // dotted decorator names: @functools.wraps
        while (src[j] === '.') {
          IDENT_RE.lastIndex = j + 1;
          const m2 = IDENT_RE.exec(src);
          if (!m2 || m2.index !== j + 1) break;
          j += 1 + m2[0].length;
        }
        out.push(['d', src.slice(i, j)]);
        i = j;
        prevSig = 'd';
        lineStart = false;
        continue;
      }
    }
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      NUMBER_RE.lastIndex = i;
      const m = NUMBER_RE.exec(src);
      if (m && m.index === i && m[0]) {
        out.push(['n', m[0]]);
        i += m[0].length;
        prevSig = 'n';
        lineStart = false;
        continue;
      }
    }
    if (/[A-Za-z_¡-￿]/.test(ch)) {
      IDENT_RE.lastIndex = i;
      const m = IDENT_RE.exec(src);
      const word = m[0];
      let type = 'v';
      if (KEYWORDS.has(word)) type = 'k';
      else if (prevSig === 'def' || prevSig === 'class') type = 'f';
      else if (BUILTINS.has(word)) type = 'b';
      else if (/^[A-Z][A-Za-z]*(Error|Exception|Warning|Exit|Interrupt|Iteration)$/.test(word)) type = 'x';
      out.push([type, word]);
      i += word.length;
      prevSig = word === 'def' || word === 'class' ? word : type;
      lineStart = false;
      continue;
    }
    OP_RE.lastIndex = i;
    const om = OP_RE.exec(src);
    if (om && om.index === i) {
      out.push(['o', om[0]]);
      i += om[0].length;
      prevSig = 'o';
      lineStart = false;
      continue;
    }
    out.push(['p', ch]);
    i++;
    prevSig = 'p';
    lineStart = false;
  }
  return out;
}

const span = (type, text) =>
  type === 'w' || type === 'v' ? esc(text) : `<span class="t-${type}">${esc(text)}</span>`;

/** Highlight to a single HTML string (newlines preserved). */
export function highlight(src) {
  return tokenize(src)
    .map(([t, s]) => span(t, s))
    .join('');
}

/**
 * Highlight into an array of per-line HTML strings (a token spanning lines, such as a
 * triple-quoted string, is split so each line is self-contained).
 */
export function highlightLines(src) {
  const lines = [''];
  for (const [t, s] of tokenize(src)) {
    const parts = s.split('\n');
    parts.forEach((p, idx) => {
      if (idx > 0) lines.push('');
      if (p) lines[lines.length - 1] += span(t, p);
    });
  }
  return lines;
}
