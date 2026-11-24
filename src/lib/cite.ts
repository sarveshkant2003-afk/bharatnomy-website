// Chicago Manual of Style (17th ed.) citations for our datasets.
// Two forms, as Chicago gives them:
//   author-date:        reference-list entry + in-text citation "(Bharatnomy 2026)"
//   notes-bibliography: footnote + bibliography entry
// The release date is the data commit date, and the version is the commit, so a
// citation always points at the exact files a reader downloaded.

const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'vs', 'via', 'with']);
const KEEP = new Set(['CO2', 'ODF', 'CEA', 'IMD', 'SBM', 'GWh', 'MW']);

/** Chicago headline-style capitalisation (8.159): capitalise all major words, first and last always. */
export function headline(title: string): string {
  const words = title.split(' ');
  return words.map((w, i) => {
    if (KEEP.has(w.replace(/[^A-Za-z0-9]/g, ''))) return w;
    const bare = w.toLowerCase();
    const edge = i === 0 || i === words.length - 1 || /[:]$/.test(words[i - 1] ?? '');
    if (!edge && SMALL.has(bare)) return bare;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** "November 24, 2026" from an ISO date. */
export function chicagoDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export interface CiteInput {
  title: string;        // dataset title, e.g. "Temperature and heat by district"
  place: string;        // "Maharashtra"
  span: string;         // "1951–2024" or "2025-26"
  code: string;         // BN-DATA-CLM-001
  version: string;      // short data commit, e.g. 5ced7f6
  released: string;     // ISO date of the data commit
  url: string;          // canonical dataset page
  agency: string;       // original publisher of the underlying data
}

export interface Citation {
  reference: string;    // author-date reference-list entry
  inText: string;       // author-date in-text citation
  note: string;         // notes-bibliography footnote
  bibliography: string; // notes-bibliography entry
}

export function chicago(c: CiteInput): Citation {
  const year = c.released.slice(0, 4);
  const title = `${headline(c.title)}, ${c.place}, ${c.span}`;
  const date = chicagoDate(c.released);
  const orig = `Original data: ${c.agency}.`;
  return {
    reference: `Bharatnomy. ${year}. “${title}.” Dataset ${c.code}, version ${c.version}. Released ${date}. CC BY 4.0. ${orig} ${c.url}.`,
    inText: `(Bharatnomy ${year})`,
    note: `Bharatnomy, “${title},” dataset ${c.code}, version ${c.version} (Bharatnomy, ${date}), ${c.url}.`,
    bibliography: `Bharatnomy. “${title}.” Dataset ${c.code}, version ${c.version}. Bharatnomy, ${date}. CC BY 4.0. ${orig} ${c.url}.`,
  };
}
