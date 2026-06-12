// Generates a single combined PDF for all suites in test-results/results.json
import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── helpers ──────────────────────────────────────────────────────────────────

function collectSections(suite) {
  const sections = [];
  if (suite.specs && suite.specs.length > 0) {
    const tests = suite.specs.map(spec => {
      const result = spec.tests?.[0]?.results?.[0];
      return {
        title: spec.title,
        status: spec.ok ? 'passed' : (result?.status || 'failed'),
        duration: result?.duration ?? 0,
      };
    });
    sections.push({ name: suite.title || 'Tests', tests });
  }
  for (const sub of suite.suites ?? []) {
    sections.push(...collectSections(sub));
  }
  return sections;
}

function fmtDuration(ms) {
  return ms >= 1000 ? (ms / 1000).toFixed(1) + 's' : ms + 'ms';
}

function totalDuration(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

function fmtTime(iso) {
  return new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
}

function specToTitle(file) {
  return path.basename(file, '.ts')
    .replace(/\.spec$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ── HTML builder (combined report) ───────────────────────────────────────────

function buildCombinedHtml(reportTitle, stats, fileBlocks) {
  const { total, passed, failed, skipped, duration, startTime } = stats;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const allPassed = failed === 0;

  const fileHtml = fileBlocks.map(({ title, sections }) => {
    const sectionRows = sections.map(sec => {
      const rows = sec.tests.map((t, i) => `
        <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
          <td class="tc-title">${t.title}</td>
          <td class="status-${t.status}">${t.status === 'passed' ? '&#10003; Passed' : t.status === 'skipped' ? '&#8212; Skipped' : '&#10007; Failed'}</td>
          <td class="duration">${fmtDuration(t.duration)}</td>
        </tr>`).join('');
      return `
      <div class="suite-block">
        <div class="suite-header">${sec.name}</div>
        <table>
          <thead>
            <tr>
              <th>Test Case</th>
              <th style="width:110px">Status</th>
              <th style="width:80px">Duration</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    }).join('');

    // per-file mini stats
    const allTests = sections.flatMap(s => s.tests);
    const fp = allTests.filter(t => t.status === 'passed').length;
    const ff = allTests.filter(t => t.status === 'failed').length;
    const fs_ = allTests.filter(t => t.status === 'skipped').length;
    const ft = allTests.length;

    return `
    <div class="file-block">
      <div class="file-header">
        <span class="file-title">${title}</span>
        <span class="file-stats">
          <span class="fs-total">${ft} tests</span>
          <span class="fs-pass">&#10003; ${fp}</span>
          ${ff > 0 ? `<span class="fs-fail">&#10007; ${ff}</span>` : ''}
          ${fs_ > 0 ? `<span class="fs-skip">&#8212; ${fs_}</span>` : ''}
        </span>
      </div>
      <div class="file-content">${sectionRows}</div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${reportTitle} - Test Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #2c2c2c; background: #fff; }

  .page-header {
    background: linear-gradient(135deg, #1a3c5e 0%, #2e6da4 100%);
    color: white; padding: 24px 32px 20px;
  }
  .page-header h1 { font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
  .page-header .subtitle { font-size: 12px; opacity: 0.85; margin-top: 4px; }

  .summary-bar {
    background: #f0f4f8; border-bottom: 2px solid #d0dce8;
    padding: 14px 32px; display: flex; gap: 32px; align-items: center; flex-wrap: wrap;
  }
  .summary-item { text-align: center; }
  .summary-item .val { font-size: 26px; font-weight: 700; line-height: 1; }
  .summary-item .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; margin-top: 2px; }
  .val-total { color: #1a3c5e; }
  .val-pass  { color: #1a7a3a; }
  .val-fail  { color: #c0392b; }
  .val-skip  { color: #888; }

  .meta-row {
    padding: 10px 32px; background: #fff; border-bottom: 1px solid #e0e0e0;
    font-size: 10.5px; color: #555; display: flex; gap: 28px; flex-wrap: wrap;
  }
  .meta-row span b { color: #2c2c2c; }

  .content { padding: 20px 32px; }

  /* file section */
  .file-block { margin-bottom: 32px; }
  .file-header {
    background: #0f2d4a; color: #fff;
    padding: 10px 16px; border-radius: 6px 6px 0 0;
    display: flex; justify-content: space-between; align-items: center;
  }
  .file-title { font-size: 13px; font-weight: 700; letter-spacing: 0.4px; }
  .file-stats { display: flex; gap: 14px; font-size: 11px; font-weight: 600; }
  .fs-total { color: #b0c8e8; }
  .fs-pass  { color: #7ee8a2; }
  .fs-fail  { color: #ff8a80; }
  .fs-skip  { color: #ccc; }
  .file-content { border: 1px solid #c8d8ea; border-top: none; border-radius: 0 0 6px 6px; padding: 12px 12px 4px; }

  /* suite block */
  .suite-block { margin-bottom: 14px; break-inside: avoid; }
  .suite-header {
    background: #2e6da4; color: white; padding: 6px 12px;
    font-size: 11px; font-weight: 600; border-radius: 4px 4px 0 0; letter-spacing: 0.3px;
  }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #dbe8f4; }
  thead th {
    padding: 6px 10px; text-align: left; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.4px; color: #1a3c5e; border-bottom: 2px solid #2e6da4;
  }
  tbody td { padding: 5px 10px; border-bottom: 1px solid #eaecef; vertical-align: middle; }
  .row-even { background: #fff; }
  .row-odd  { background: #f7f9fb; }
  .tc-title  { color: #2c2c2c; }
  .duration  { text-align: right; color: #666; font-size: 10px; white-space: nowrap; }
  .status-passed  { color: #1a7a3a; font-weight: 600; white-space: nowrap; }
  .status-failed  { color: #c0392b; font-weight: 600; white-space: nowrap; }
  .status-skipped { color: #888;    font-weight: 600; white-space: nowrap; }

  .badge {
    display: inline-block; border-radius: 12px; padding: 2px 10px;
    font-size: 11px; font-weight: 700; margin-left: 12px; vertical-align: middle;
  }
  .badge-pass { background: #e6f4ea; color: #1a7a3a; border: 1px solid #a8d5b0; }
  .badge-fail { background: #fdecea; color: #c0392b; border: 1px solid #f5b0a8; }

  .footer {
    margin-top: 28px; padding: 12px 32px; border-top: 2px solid #e0e0e0;
    font-size: 9.5px; color: #888; display: flex; justify-content: space-between;
  }
</style>
</head>
<body>
<div class="page-header">
  <h1>${reportTitle} &mdash; Test Execution Report
    <span class="badge ${allPassed ? 'badge-pass' : 'badge-fail'}">${allPassed ? 'ALL PASSED' : `${failed} FAILED`}</span>
  </h1>
  <div class="subtitle">Combined report &mdash; ${fileBlocks.length} spec files</div>
</div>

<div class="summary-bar">
  <div class="summary-item">
    <div class="val val-total">${total}</div>
    <div class="lbl">Total Tests</div>
  </div>
  <div class="summary-item">
    <div class="val val-pass">${passed}</div>
    <div class="lbl">Passed</div>
  </div>
  <div class="summary-item">
    <div class="val val-fail">${failed}</div>
    <div class="lbl">Failed</div>
  </div>
  <div class="summary-item">
    <div class="val val-skip">${skipped}</div>
    <div class="lbl">Skipped</div>
  </div>
  <div class="summary-item">
    <div class="val val-total" style="font-size:20px">${totalDuration(duration)}</div>
    <div class="lbl">Total Duration</div>
  </div>
  <div class="summary-item">
    <div class="val val-pass" style="font-size:20px">${passRate}%</div>
    <div class="lbl">Pass Rate</div>
  </div>
</div>

<div class="meta-row">
  <span><b>Start Time:</b> ${fmtTime(startTime)} IST</span>
  <span><b>Browser:</b> Chromium (Desktop Chrome)</span>
  <span><b>Environment:</b> Staging</span>
  <span><b>Spec Files:</b> ${fileBlocks.length}</span>
</div>

<div class="content">${fileHtml}</div>

<div class="footer">
  <span>Generated by Playwright Test Runner &mdash; ElevatorPlus QA Automation</span>
  <span>Report generated automatically after test run</span>
</div>
</body>
</html>`;
}

// ── main ──────────────────────────────────────────────────────────────────────

const root = __dirname;
const jsonPath = path.resolve(root, 'test-results', 'results.json');
const report = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const topSuites = report.suites ?? [];

if (topSuites.length === 0) {
  console.log('No suites found in results.json');
  process.exit(0);
}

// Build fileBlocks from all suites
const fileBlocks = [];
let totalPassed = 0, totalFailed = 0, totalSkipped = 0, totalDur = 0;

for (const topSuite of topSuites) {
  const file = topSuite.file || topSuite.title || 'unknown';
  const title = specToTitle(file);
  const sections = collectSections(topSuite);
  if (sections.length === 0) continue;

  const allTests = sections.flatMap(s => s.tests);
  totalPassed  += allTests.filter(t => t.status === 'passed').length;
  totalFailed  += allTests.filter(t => t.status === 'failed').length;
  totalSkipped += allTests.filter(t => t.status === 'skipped').length;
  totalDur     += allTests.reduce((sum, t) => sum + t.duration, 0);

  fileBlocks.push({ title, sections });
}

const stats = {
  total: totalPassed + totalFailed + totalSkipped,
  passed: totalPassed,
  failed: totalFailed,
  skipped: totalSkipped,
  duration: totalDur,
  startTime: report.stats?.startTime ?? new Date().toISOString(),
};

const reportsDir = path.resolve(root, 'pdf-reports');
fs.mkdirSync(reportsDir, { recursive: true });

const now = new Date();
const pad = n => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

const reportTitle = 'Sales Master';
const slug = 'sales-master';
const html = buildCombinedHtml(reportTitle, stats, fileBlocks);

const tmpHtml = path.join(reportsDir, `_tmp_${slug}.html`);
const pdfPath = path.join(reportsDir, `${timestamp}_${slug}.pdf`);

fs.writeFileSync(tmpHtml, html);

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`file://${tmpHtml}`);
  await page.waitForLoadState('networkidle');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '0mm', right: '0mm' },
  });
  await page.close();
  console.log(`✓ Combined PDF saved: ${pdfPath}`);
} finally {
  fs.unlinkSync(tmpHtml);
  await browser.close();
}
