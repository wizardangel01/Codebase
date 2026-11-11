// A deliberately small Markdown dialect. Everything is HTML-escaped; raw HTML is not
// supported, so lesson files cannot inject markup by accident.
//
// Supported: # headings, paragraphs, **bold**, *italic*, ~~strike~~, `code`, [links](url),
// ![images](src), bullet and numbered lists (nested by indentation), > quotes, GFM tables,
// --- rules, and ``` fenced code. Underscore emphasis is NOT supported on purpose (it
// clashes with snake_case names in Python prose).

import { esc, slugify } from './util.js';
import { highlight } from './highlight.js';

const ESCAPABLE = /\\([\\`*_{}\[\]()#+\-.!|~>$])/g;

export function safeUrl(url) {
  const u = String(url).trim();
  if (/^(https?:|mailto:|#|\/|\.\/|\.\.\/)/i.test(u) || !/^[a-z][a-z0-9+.-]*:/i.test(u)) return u;
  return '#';
}

export function renderInline(src) {
  const codes = [];
  const escapes = [];
  let s = String(src);
  // 1. protect escaped characters and code spans
  s = s.replace(ESCAPABLE, (_, c) => {
    escapes.push(c);
    return `\u0001${escapes.length - 1}\u0001`;
  });
  s = s.replace(/(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g, (_, _t, code) => {
    codes.push(code.replace(/^ (.*) $/s, '$1'));
    return `\u0000${codes.length - 1}\u0000`;
  });
  // 2. escape HTML
  s = esc(s);
  // 3. images, links
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => `<img src="${esc(safeUrl(url.replace(/&amp;/g, '&')))}" alt="${alt}" loading="lazy">`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, url) => {
    const u = safeUrl(url.replace(/&amp;/g, '&'));
    const external = /^https?:/i.test(u);
    return `<a href="${esc(u)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
  });
  // 4. emphasis
  s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\s](?:[^*\n]*?[^*\s])?)\*(?![*\w])/g, '$1<em>$2</em>');
  s = s.replace(/~~([^~\n]+?)~~/g, '<del>$1</del>');
  // 5. hard line breaks
  s = s.replace(/ {2,}\n/g, '<br>\n').replace(/\\\n/g, '<br>\n');
  // 6. restore
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
  s = s.replace(/\u0001(\d+)\u0001/g, (_, i) => esc(escapes[+i]));
  return s;
}

const FENCE_OPEN = /^(\s*)(`{3,}|~{3,})\s*(.*)$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const HR = /^\s*([-*_])(?:\s*\1){2,}\s*$/;
const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const TABLE_SEP = /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/;

function splitRow(line) {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|') && !t.endsWith('\\|')) t = t.slice(0, -1);
  const cells = [];
  let cur = '';
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '\\' && t[i + 1] === '|') {
      cur += '|';
      i++;
    } else if (t[i] === '|') {
      cells.push(cur.trim());
      cur = '';
    } else cur += t[i];
  }
  cells.push(cur.trim());
  return cells;
}

/**
 * Split markdown into prose segments and fenced code blocks.
 * Returns [{type:'prose', text} | {type:'fence', info, code, fence}]
 */
export function splitBlocks(text) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let prose = [];
  const flush = () => {
    if (prose.some((l) => l.trim())) out.push({ type: 'prose', text: prose.join('\n') });
    prose = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const m = FENCE_OPEN.exec(lines[i]);
    if (m && !/`/.test(m[3])) {
      const [, indent, fence, info] = m;
      const body = [];
      let j = i + 1;
      for (; j < lines.length; j++) {
        const close = new RegExp(`^\\s*${fence[0]}{${fence.length},}\\s*$`);
        if (close.test(lines[j])) break;
        body.push(indent && lines[j].startsWith(indent) ? lines[j].slice(indent.length) : lines[j]);
      }
      flush();
      out.push({ type: 'fence', info: info.trim(), code: body.join('\n'), fence });
      i = j;
    } else prose.push(lines[i]);
  }
  flush();
  return out;
}

export function renderCodeStatic(code, lang = 'python') {
  const body = lang === 'python' || lang === 'py' ? highlight(code) : esc(code);
  return `<pre class="code-static" data-lang="${esc(lang)}"><code>${body}</code></pre>`;
}

function renderList(lines, start, state) {
  // returns [html, nextIndex]
  const first = LIST_ITEM.exec(lines[start]);
  const baseIndent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const items = [];
  let i = start;
  while (i < lines.length) {
    const m = LIST_ITEM.exec(lines[i]);
    if (m && m[1].length === baseIndent && /\d/.test(m[2]) === ordered) {
      const body = [m[3]];
      const contentIndent = baseIndent + m[2].length + 1;
      i++;
      while (i < lines.length) {
        const ln = lines[i];
        if (!ln.trim()) {
          // blank line: continues the item only if the next non-blank line is indented deeper
          let k = i + 1;
          while (k < lines.length && !lines[k].trim()) k++;
          if (k < lines.length && /^\s*/.exec(lines[k])[0].length >= contentIndent) {
            body.push('');
            i++;
            continue;
          }
          break;
        }
        const ind = /^\s*/.exec(ln)[0].length;
        if (ind >= contentIndent) {
          body.push(ln.slice(contentIndent));
          i++;
        } else if (ind > baseIndent && LIST_ITEM.test(ln)) {
          body.push(ln.slice(Math.min(ind, contentIndent)));
          i++;
        } else if (ind > baseIndent) {
          body.push(ln.trim()); // lazy continuation
          i++;
        } else break;
      }
      items.push(body.join('\n'));
    } else if (!lines[i].trim()) {
      // blank between items: look ahead for another item at this level
      let k = i + 1;
      while (k < lines.length && !lines[k].trim()) k++;
      const nm = k < lines.length ? LIST_ITEM.exec(lines[k]) : null;
      if (nm && nm[1].length === baseIndent && /\d/.test(nm[2]) === ordered) {
        i = k;
        continue;
      }
      break;
    } else break;
  }
  const tag = ordered ? 'ol' : 'ul';
  const startNum = ordered ? parseInt(first[2], 10) : 1;
  const html = items
    .map((txt) => {
      const inner = renderMarkdown(txt, { ...state, tight: true });
      return `<li>${inner}</li>`;
    })
    .join('');
  return [`<${tag}${ordered && startNum !== 1 ? ` start="${startNum}"` : ''}>${html}</${tag}>`, i];
}

export function renderMarkdown(text, state = {}) {
  const ids = state.ids || (state.ids = new Map());
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const startsBlock = (ln, nxt) =>
    FENCE_OPEN.test(ln) || HEADING.test(ln) || HR.test(ln) || /^\s*>/.test(ln) || LIST_ITEM.test(ln) || (ln.includes('|') && nxt !== undefined && TABLE_SEP.test(nxt));
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    // fenced code (static rendering)
    const fm = FENCE_OPEN.exec(line);
    if (fm && !/`/.test(fm[3])) {
      const [, indent, fence, info] = fm;
      const close = new RegExp(`^\\s*${fence[0]}{${fence.length},}\\s*$`);
      const body = [];
      let j = i + 1;
      for (; j < lines.length && !close.test(lines[j]); j++) body.push(indent && lines[j].startsWith(indent) ? lines[j].slice(indent.length) : lines[j]);
      const lang = (info.trim().split(/\s+/)[0] || 'text').toLowerCase();
      const isOutput = lang === 'output' || lang === 'text' || lang === 'console';
      out.push(isOutput ? `<pre class="code-static output" data-lang="${esc(lang)}"><code>${esc(body.join('\n'))}</code></pre>` : renderCodeStatic(body.join('\n'), lang));
      i = j + 1;
      continue;
    }
    const hm = HEADING.exec(line);
    if (hm) {
      const level = hm[1].length;
      const base = slugify(hm[2]);
      const n = ids.get(base) || 0;
      ids.set(base, n + 1);
      const id = n ? `${base}-${n + 1}` : base;
      out.push(`<h${level} id="${id}">${renderInline(hm[2])}</h${level}>`);
      i++;
      continue;
    }
    if (HR.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }
    if (/^\s*>/.test(line)) {
      const q = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        q.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${renderMarkdown(q.join('\n'), state)}</blockquote>`);
      continue;
    }
    if (line.includes('|') && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1])) {
      const head = splitRow(line);
      const aligns = splitRow(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'center' : /-:$/.test(c) ? 'right' : /^:-/.test(c) ? 'left' : ''));
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const cell = (tag, c, idx) => `<${tag}${aligns[idx] ? ` style="text-align:${aligns[idx]}"` : ''}>${renderInline(c)}</${tag}>`;
      out.push(
        `<div class="tbl"><table><thead><tr>${head.map((c, k) => cell('th', c, k)).join('')}</tr></thead><tbody>${rows
          .map((r) => `<tr>${head.map((_, k) => cell('td', r[k] ?? '', k)).join('')}</tr>`)
          .join('')}</tbody></table></div>`
      );
      continue;
    }
    if (LIST_ITEM.test(line)) {
      const [html, next] = renderList(lines, i, state);
      out.push(html);
      i = next;
      continue;
    }
    // paragraph
    const para = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i], lines[i + 1])) {
      para.push(lines[i]);
      i++;
    }
    out.push({ para: para.join('\n') });
  }
  // inside list items a lone paragraph is rendered without <p>
  const paraCount = out.filter((o) => typeof o === 'object').length;
  const bare = state.tight && paraCount <= 1;
  return out
    .map((o) => (typeof o === 'string' ? o : bare ? renderInline(o.para) : `<p>${renderInline(o.para)}</p>`))
    .join('\n')
    .replace(/<\/li>\n/g, '</li>');
}

/** Plain-text excerpt (for search and tooltips). */
export function stripMarkdown(text) {
  return String(text)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*#>~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
