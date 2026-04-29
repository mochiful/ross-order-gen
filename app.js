let rows = [];
let rowId = 0;
const KARAT_PURITY = { '10K': 10/24, '14K': 14/24, '18K': 18/24, '22K': 22/24 };
let selectedKarat = '14K';
let bruteForce = false;

// ── Brute Force ───────────────────────────────────────────

function toggleBruteForce() {
  bruteForce = !bruteForce;
  document.getElementById('brute-force-btn').classList.toggle('btn-primary', bruteForce);
  renderRows();
}

// ── Karat ─────────────────────────────────────────────────

function setKarat(k) {
  selectedKarat = k;
  document.querySelectorAll('.karat-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.k === k);
  });
  document.getElementById('gold-price-row').style.display = k === 'SS' ? 'none' : '';
  if (k === 'SS') {
    document.getElementById('formula-hint').textContent = 'used in formula: weight × 7';
  } else {
    const purity = KARAT_PURITY[k];
    document.getElementById('formula-hint').textContent =
      `used in formula: (((spot ÷ 31.1035) × ${purity.toFixed(4)}) + 8) × total weight`;
  }
  renderRows();
}

// ── Defaults ──────────────────────────────────────────────

function saveDefaults() {
  const d = {
    order: v('h-order'), date: v('h-date'), needby: v('h-needby'),
    placedby: v('h-placedby'), vendor: v('h-vendor'), karat: selectedKarat,
    goldPrice: v('gold-price')
  };
  localStorage.setItem('rm_defaults', JSON.stringify(d));
  flash('defaults-msg', 'Saved!');
}

function loadDefaults() {
  try {
    const d = JSON.parse(localStorage.getItem('rm_defaults') || '{}');
    if (d.order)     set('h-order',    d.order);
    if (d.date)      set('h-date',     d.date);
    if (d.needby)    set('h-needby',   d.needby);
    if (d.placedby)  set('h-placedby', d.placedby);
    if (d.vendor)    set('h-vendor',   d.vendor);
    if (d.karat)     setKarat(d.karat);
    if (d.goldPrice) set('gold-price', d.goldPrice);
  } catch(e) {}
}

function flash(id, msg, duration = 2200) {
  const el = document.getElementById(id);
  el.textContent = msg;
  setTimeout(() => el.textContent = '', duration);
}

function v(id)        { return document.getElementById(id).value; }
function set(id, val) { document.getElementById(id).value = val; }

// ── Row Management ────────────────────────────────────────

function addRow(data) {
  const id = rowId++;
  rows.push({
    id,
    imgUrl:         data?.imgUrl         || '',
    vendorStyle:    data?.vendorStyle    || '',
    style:          data?.style          || '',
    y:              data?.y              || '',
    w:              data?.w              || '',
    p:              data?.p              || '',
    obs:            data?.obs            || '',
    unitW:          data?.unitW          || '',
    weightOverride: data?.weightOverride || ''
  });
  renderRows();
}

function addRows() {
  const n = Math.min(Math.max(parseInt(document.getElementById('add-row-count').value) || 1, 1), 100);
  for (let i = 0; i < n; i++) addRow();
}

function removeRow(id) {
  rows = rows.filter(r => r.id !== id);
  renderRows();
}

function renderRows() {
  const tbody = document.getElementById('order-body');
  tbody.innerHTML = '';

  rows.forEach(r => {
    const weightCell = bruteForce
      ? `<input class="cell-input right" type="number" value="${r.weightOverride}" placeholder="0.00" step="0.01" data-id="${r.id}" data-field="weightOverride">`
      : `<span id="row-wt-${r.id}" style="display:block;text-align:right;padding-right:4px;color:var(--text-muted);">—</span>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-w">${weightCell}</td>
      <td class="col-img">
        <div class="img-cell" onclick="promptImgUrl(${r.id})" title="Click to set image URL">
          <img id="img-${r.id}" src="${r.imgUrl}" style="display:${r.imgUrl ? 'block' : 'none'}" onerror="this.style.display='none';document.getElementById('ph-${r.id}').style.display='flex'">
          <div id="ph-${r.id}" class="img-placeholder" style="display:${r.imgUrl ? 'none' : 'flex'}">paste<br>URL</div>
        </div>
      </td>
      <td class="col-vs"><input class="cell-input" type="text" value="${r.vendorStyle}" placeholder="" data-id="${r.id}" data-field="vendorStyle"></td>
      <td class="col-sn"><input class="cell-input" type="text" value="${r.style}" placeholder="ERW05" data-id="${r.id}" data-field="style"></td>
      <td class="col-mt" style="text-align:center;color:var(--text-muted);">${selectedKarat}</td>
      <td class="col-qty"><input class="cell-input center" type="number" value="${r.y}" placeholder="0" data-id="${r.id}" data-field="y"></td>
      <td class="col-qty"><input class="cell-input center" type="number" value="${r.w}" placeholder="0" data-id="${r.id}" data-field="w"></td>
      <td class="col-qty"><input class="cell-input center" type="number" value="${r.p}" placeholder="0" data-id="${r.id}" data-field="p"></td>
      <td class="col-obs"><input class="cell-input" type="text" value="${r.obs}" placeholder="" data-id="${r.id}" data-field="obs"></td>
      <td class="col-uw"><input class="cell-input right" type="number" value="${r.unitW}" placeholder="0.00" step="0.01" data-id="${r.id}" data-field="unitW"></td>
      <td class="col-del"><button class="del-btn" onclick="removeRow(${r.id})">✕</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.cell-input').forEach(input => {
    input.addEventListener('input', e => {
      const id = parseInt(e.target.dataset.id);
      const field = e.target.dataset.field;
      const r = rows.find(r => r.id === id);
      if (r) { r[field] = e.target.value; calcTotals(); }
    });
  });

  calcTotals();
}

function promptImgUrl(id) {
  const r = rows.find(r => r.id === id);
  const url = prompt('Paste image URL (leave blank to clear):', r?.imgUrl || '');
  if (url === null) return;
  if (r) r.imgUrl = url.trim();
  const imgEl = document.getElementById('img-' + id);
  const phEl  = document.getElementById('ph-'  + id);
  if (url.trim()) {
    imgEl.src = url.trim();
    imgEl.style.display = 'block';
    phEl.style.display  = 'none';
  } else {
    imgEl.src = '';
    imgEl.style.display = 'none';
    phEl.style.display  = 'flex';
  }
}

// ── Totals ────────────────────────────────────────────────

function rowWeight(r) {
  if (bruteForce && r.weightOverride !== '') return parseFloat(r.weightOverride) || 0;
  const qty = (parseFloat(r.y) || 0) + (parseFloat(r.w) || 0) + (parseFloat(r.p) || 0);
  return qty * (parseFloat(r.unitW) || 0);
}

function calcTotals() {
  let totalW = 0;
  rows.forEach(r => {
    const wt = rowWeight(r);
    totalW += wt;
    const el = document.getElementById('row-wt-' + r.id);
    if (el) el.textContent = wt > 0 ? wt.toFixed(2) : '—';
  });

  let value, formulaText;
  if (selectedKarat === 'SS') {
    value       = totalW * 7;
    formulaText = `${totalW.toFixed(2)} × 7`;
  } else {
    const spot   = parseFloat(v('gold-price')) || 4700;
    const purity = KARAT_PURITY[selectedKarat] || 14/24;
    value        = (((spot / 31.1035) * purity) + 8) * totalW;
    formulaText  = `(((${spot} ÷ 31.1035) × ${purity.toFixed(4)}) + 8) × ${totalW.toFixed(2)}`;
  }

  document.getElementById('stat-rows').textContent    = rows.length;
  document.getElementById('stat-weight').textContent  = totalW.toFixed(2) + ' g';
  document.getElementById('stat-value').textContent   = '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  document.getElementById('formula-display').textContent = formulaText;
  document.getElementById('row-count').textContent    = rows.length + (rows.length === 1 ? ' item' : ' items');
}

// ── Exports ───────────────────────────────────────────────

function getHeader() {
  const fb = id => { const el = document.getElementById(id); return el.value.trim() || el.placeholder; };
  return {
    order:    fb('h-order'),
    date:     v('h-date'),
    needby:   fb('h-needby'),
    placedby: fb('h-placedby'),
    vendor:   fb('h-vendor')
  };
}

function calcValue(totalW) {
  if (selectedKarat === 'SS') return totalW * 7;
  const spot   = parseFloat(v('gold-price')) || 4700;
  const purity = KARAT_PURITY[selectedKarat] || 14/24;
  return (((spot / 31.1035) * purity) + 8) * totalW;
}

function exportCSV() {
  const h      = getHeader();
  const totalW = rows.reduce((s, r) => s + rowWeight(r), 0);
  const value  = calcValue(totalW);

  let csv = `ORDER NUMBER:,${h.order}\n`;
  csv += `DATE:,${h.date},NEED BY:,${h.needby},PLACED BY:,${h.placedby}\n`;
  csv += `TO:,${h.vendor},METAL:,${selectedKarat}\n\n`;
  csv += `WEIGHT (g),IMAGE URL,VENDOR STYLE #,STYLE #,Y,W,P,OBSERVATIONS,UNIT WEIGHT (g)\n`;
  rows.forEach(r => {
    const wt = rowWeight(r);
    csv += `${wt > 0 ? wt.toFixed(2) : ''},${r.imgUrl||''},${r.vendorStyle||''},${r.style||''},${r.y||0},${r.w||0},${r.p||0},"${(r.obs||'').replace(/"/g,'""')}",${r.unitW||''}\n`;
  });
  csv += `\nEst. Weight (g):,${totalW.toFixed(2)}\nEst. Value:,$${value.toFixed(0)}\n`;

  downloadBlob(csv, `order-${h.order || 'export'}.csv`, 'text/csv');
}

function exportXLSX() {
  const h      = getHeader();
  const totalW = rows.reduce((s, r) => s + rowWeight(r), 0);
  const value  = calcValue(totalW);

  const wb     = XLSX.utils.book_new();
  const wsData = [
    [`ORDER NUMBER: ${h.order}`],
    [`DATE: ${h.date}`, '', `NEED BY: ${h.needby}`, '', `PLACED BY: ${h.placedby}`],
    [`TO: ${h.vendor}`, '', `METAL: ${selectedKarat}`],
    [],
    ['WEIGHT (g)', 'IMAGE URL', 'VENDOR STYLE #', 'STYLE #', 'Y', 'W', 'P', 'OBSERVATIONS', 'UNIT WEIGHT (g)'],
    ...rows.map(r => [
      rowWeight(r) || '', r.imgUrl || '', r.vendorStyle || '', r.style || '',
      parseInt(r.y) || 0, parseInt(r.w) || 0, parseInt(r.p) || 0,
      r.obs || '', parseFloat(r.unitW) || ''
    ]),
    [],
    ['Est. Weight (g):', totalW.toFixed(2)],
    ['Est. Value:',      `$${value.toFixed(0)}`]
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{wch:10},{wch:30},{wch:14},{wch:12},{wch:6},{wch:6},{wch:6},{wch:20},{wch:14}];
  XLSX.utils.book_append_sheet(wb, ws, 'Order');
  XLSX.writeFile(wb, `order-${h.order || 'export'}.xlsx`);
}

function exportPrint() {
  const missing = rows.filter(r => !r.unitW || r.unitW.toString().trim() === '');
  if (missing.length > 0) {
    const proceed = confirm(`${missing.length} row${missing.length > 1 ? 's are' : ' is'} missing a unit weight — the estimated weight and value will be incomplete.\n\nProceed anyway?`);
    if (!proceed) return;
  }

  const h      = getHeader();
  const totalW = rows.reduce((s, r) => s + rowWeight(r), 0);
  const value  = calcValue(totalW);

  const rowsHtml = rows.map(r => `
    <tr>
      <td class="col-wt">${rowWeight(r) > 0 ? rowWeight(r).toFixed(2) : ''}</td>
      <td class="col-img">${r.imgUrl ? `<img src="${r.imgUrl}" style="width:48px;height:48px;object-fit:contain;display:block;margin:0 auto;">` : ''}</td>
      <td class="col-vs">${r.vendorStyle || ''}</td>
      <td class="col-sn">${r.style || ''}</td>
      <td class="col-mt">${selectedKarat}</td>
      <td class="col-qty">${r.y || 0}</td>
      <td class="col-qty">${r.w || 0}</td>
      <td class="col-qty">${r.p || 0}</td>
      <td class="col-obs">${r.obs || ''}</td>
      <td class="col-uw">${r.unitW || ''}</td>
    </tr>`).join('');

  const footerHtml = document.getElementById('hide-totals').checked ? '' : `
    <div class="footer">
      <div class="weight">${totalW.toFixed(2)} g Est. Weight</div>
      <div class="total">$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
    </div>`;

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html><head><title>Order ${h.order}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; margin: 18px; color: #111; }
  .hdr-table { width:100%; border-collapse:collapse; margin-bottom:10px; }
  .hdr-table td { border:1px solid #333; padding:5px 10px; font-weight:bold; }
  .hdr-table .center { text-align:center; font-size:13px; }
  table.lines { width:100%; border-collapse:collapse; }
  table.lines th { border:1px solid #aaa; padding:5px 4px; background:#f5f5f5; font-size:10px; text-transform:uppercase; letter-spacing:.04em; text-align:center; vertical-align:middle; white-space:nowrap; }
  table.lines td { border:1px solid #ddd; padding:3px 4px; vertical-align:middle; text-align:center; }
  .col-wt  { width:44px; }
  .col-img { width:54px; padding:2px !important; }
  .col-vs  { width:68px; }
  .col-sn  { width:68px; }
  .col-mt  { width:34px; }
  .col-qty { width:22px; }
  .col-uw  { width:52px; }
  .footer { margin-top:12px; display:inline-flex; flex-direction:column; border:1px solid #333; }
  .footer .weight { font-size:11px; color:#555; padding:5px 14px; border-bottom:1px solid #333; }
  .footer .total  { font-size:16px; font-weight:bold; padding:6px 14px; }
  @media print { @page { margin:1cm; } }
</style>
</head><body>
<table class="hdr-table">
  <tr><td colspan="5" class="center">ORDER NUMBER: ${h.order}</td></tr>
  <tr><td colspan="2">DATE: ${h.date}</td><td colspan="2">NEED BY: ${h.needby}</td><td>PLACED BY: ${h.placedby}</td></tr>
  <tr><td colspan="3" class="center">TO: ${h.vendor}</td><td colspan="2" class="center">METAL: ${selectedKarat}</td></tr>
</table>
<table class="lines">
  <thead><tr>
    <th class="col-wt">Wt</th><th class="col-img">Image</th><th class="col-vs">Vendor Style #</th>
    <th class="col-sn">Style #</th><th class="col-mt">Metal</th>
    <th class="col-qty">Y</th><th class="col-qty">W</th><th class="col-qty">P</th>
    <th class="col-obs">Observations</th><th class="col-uw">Unit Wt (g)</th>
  </tr></thead>
  <tbody>${rowsHtml}</tbody>
</table>
${footerHtml}
<script>window.onload = () => window.print();<\/script>
</body></html>`);
  win.document.close();
}

// ── Data Save / Import ────────────────────────────────────

function exportData() {
  const h    = getHeader();
  const data = {
    header:    h,
    karat:     selectedKarat,
    goldPrice: v('gold-price'),
    rows:      rows.map(({ id, ...r }) => r)
  };
  downloadBlob(JSON.stringify(data, null, 2), `order-${h.order || 'data'}.json`, 'application/json');
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      restoreOrder(JSON.parse(e.target.result));
    } catch {
      alert('Could not read file — make sure it is a valid order JSON.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function restoreOrder(data) {
  if (rows.length > 0 && !confirm('This will replace your current order. Continue?')) return;
  const h = data.header || {};
  if (h.order    !== undefined) set('h-order',    h.order);
  if (h.date     !== undefined) set('h-date',     h.date);
  if (h.needby   !== undefined) set('h-needby',   h.needby);
  if (h.placedby !== undefined) set('h-placedby', h.placedby);
  if (h.vendor   !== undefined) set('h-vendor',   h.vendor);
  if (data.karat)               setKarat(data.karat);
  if (data.goldPrice)           set('gold-price', data.goldPrice);
  rows = []; rowId = 0;
  (data.rows || []).forEach(r => addRow(r));
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Init ──────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  ['h-order', 'h-needby', 'h-placedby', 'h-vendor'].forEach(id => {
    const el = document.getElementById(id);
    el.value = el.placeholder;
  });
  set('h-date', new Date().toISOString().split('T')[0]);
  loadDefaults();
  addRow();
});
