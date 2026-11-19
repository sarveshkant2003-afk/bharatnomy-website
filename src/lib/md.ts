// A deliberately small Markdown reader for dataset READMEs (build time only).
// Handles what those files use: headings, paragraphs, bullet lists, tables,
// **bold**, `code`, [links](url). Em dashes are removed (anti-slop rule).
import { noEmDash } from './format';

export interface Section { title: string; body: string }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function inline(s: string): string {
  let t = esc(noEmDash(s));
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, url) => {
    const ext = /^https?:/.test(url);
    return `<a href="${url}"${ext ? ' class="ext"' : ''}>${txt}</a>`;
  });
  return t;
}

export function block(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (/^\|/.test(l)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        if (!/^\|[\s:|-]+\|$/.test(lines[i].trim())) rows.push(lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
        i++;
      }
      const [head, ...body] = rows;
      out.push(`<div class="md-table"><table><thead><tr>${head.map((h) => `<th scope="col">${inline(h)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^[-*] /.test(l)) {
      const items: string[] = [];
      while (i < lines.length && (/^[-*] /.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        if (/^[-*] /.test(lines[i])) items.push(lines[i].replace(/^[-*] /, ''));
        else items[items.length - 1] += ' ' + lines[i].trim();
        i++;
      }
      out.push(`<ul>${items.map((it) => `<li>${inline(it)}</li>`).join('')}</ul>`);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^[|#]|^[-*] /.test(lines[i])) para.push(lines[i++].trim());
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    else i++;
  }
  return out.join('\n');
}

/** Split a README into its title, first paragraph and ## sections (raw md). */
export function parseReadme(md: string) {
  const title = noEmDash((md.match(/^# (.+)$/m)?.[1] ?? '').replace(/\s*—\s*Maharashtra$/, ''));
  const parts = md.split(/^## /m);
  const intro = parts[0].replace(/^# .+$/m, '').trim();
  const sections: Record<string, string> = {};
  for (const p of parts.slice(1)) {
    const nl = p.indexOf('\n');
    sections[p.slice(0, nl).trim()] = p.slice(nl + 1).trim();
  }
  return { title, intro, sections };
}

/** Rows of the first markdown table in a section. */
export function tableRows(md: string): string[][] {
  return md.split('\n').filter((l) => /^\|/.test(l) && !/^\|[\s:|-]+\|$/.test(l.trim()))
    .map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())).slice(1);
}

/** Bullet items of a section as raw strings. */
export function bullets(md: string): string[] {
  return md.split('\n').filter((l) => /^[-*] /.test(l)).map((l) => l.replace(/^[-*] /, ''));
}
