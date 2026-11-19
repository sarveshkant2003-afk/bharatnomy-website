// Sortable tables: any <table data-sortable> whose header cells contain a
// <button data-sort="text|num">. Keyboard-usable buttons; aria-sort updated.
for (const table of document.querySelectorAll<HTMLTableElement>('table[data-sortable]')) {
  const tbody = table.tBodies[0];
  table.querySelectorAll<HTMLButtonElement>('th button[data-sort]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const th = btn.closest('th')!;
      const col = Array.from(th.parentElement!.children).indexOf(th);
      const asc = th.getAttribute('aria-sort') !== 'ascending';
      table.querySelectorAll('th').forEach((h) => h.removeAttribute('aria-sort'));
      th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
      const num = btn.dataset.sort === 'num';
      const key = (r: HTMLTableRowElement) => {
        const c = r.cells[col];
        const v = c.dataset.value ?? c.textContent ?? '';
        return num ? parseFloat(v.replace(/,/g, '')) : v.toLowerCase();
      };
      const rows = Array.from(tbody.rows).sort((a, b) => {
        const x = key(a), y = key(b);
        return (x < y ? -1 : x > y ? 1 : 0) * (asc ? 1 : -1);
      });
      tbody.append(...rows);
    });
  });
}
