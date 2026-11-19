// Number and text formatters shared by build-time components and the Atlas.

export function fmt(v: number | null | undefined, decimals = 0): string {
  if (v == null || Number.isNaN(v)) return 'no data';
  return v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Signed value: +1.2, -0.4, 0. Uses a true minus sign. */
export function signed(v: number | null | undefined, decimals = 0): string {
  if (v == null || Number.isNaN(v)) return 'no data';
  const s = fmt(Math.abs(v), decimals);
  if (Number(s.replace(/,/g, '')) === 0) return s;
  return (v > 0 ? '+' : '−') + s;
}

export function withUnit(v: number | null | undefined, unit: string, decimals = 0): string {
  if (v == null) return 'no data';
  const n = fmt(v, decimals);
  if (!unit) return n;
  if (unit === '%') return `${n}%`;
  if (unit === 'SPI') return n;
  return `${n} ${unit}`;
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** "19.44° N  76.00° E" */
export function coords(lon: number, lat: number): string {
  return `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}  ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;
}

/** "19 NOV 2026" from an ISO date. */
export function stampDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
}

/** Remove em dashes from text we did not write (README titles etc.). */
export function noEmDash(s: string): string {
  return s.replace(/\s*—\s*/g, ': ').replace(/:\s*:/g, ':');
}
