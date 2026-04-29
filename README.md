# Ross Metals — Order Generator

A browser-based tool for generating, exporting, and archiving jewelry purchase orders.

---

## Files

```
ross-order-gen/
├── ross-order-generator.html   — markup
├── styles.css                  — all styles
├── app.js                      — all logic
└── README.md
```

---

## Usage

Open `ross-order-generator.html` in any browser. No server or install required. Keep all three files in the same folder.

---

## Features

### Order Header
- Order number, date, need-by, placed by, vendor
- Metal (karat) selector: **10K / 14K / 18K / 22K / SS**
- Gold spot price input (auto-hidden when SS is selected)
- Save / Load defaults to persist header fields across sessions

### Order Lines
- Add rows individually or in bulk using the number input next to **+ Add Row**
- **Weight** — auto-calculated as `(Y + W + P) × Unit Weight`
- **Image** — click cell to paste an image URL
- **Brute Force** mode (navbar toggle) — unlocks the weight column for manual entry

### Totals
- Est. Weight (g) — sum of all row weights
- Est. Value — calculated from the selected metal formula:
  - **Gold (10K–22K):** `(((spot ÷ 31.1035) × purity) + 8) × total weight`
  - **SS:** `total weight × 7`
- "Hide weight & amount in PDF" checkbox — strips the footer from PDF exports

### Data / Exports
| Button | Output |
|---|---|
| Save Data | Downloads a `.json` snapshot of the full order |
| Import Order | Loads a previously saved `.json` file |
| Export CSV | Comma-separated export |
| Export XLSX | Excel workbook via SheetJS |
| Print / Save PDF | Print-ready view in a new window |

---

## Gold Purity Reference

| Karat | Purity |
|---|---|
| 10K | 0.4167 |
| 14K | 0.5833 |
| 18K | 0.7500 |
| 22K | 0.9167 |
| SS | flat ×7 |

---

## Dependencies

- [SheetJS (xlsx)](https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js) — XLSX export (CDN)
- [Google Fonts](https://fonts.google.com) — Cormorant Garamond, Outfit, IBM Plex Mono (CDN)

Both are loaded from CDN; an internet connection is required on first load for fonts and XLSX export to work correctly.
