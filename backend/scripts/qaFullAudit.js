/**
 * Golden Fisheries — Full QA automation audit (API + routes + build)
 * Run: npm run test:qa
 * Requires: backend running (npm run dev), optional seed:e2e
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || '5000';
const BASE = process.env.E2E_API_BASE || `http://127.0.0.1:${PORT}/api/v1`;
const HEALTH = process.env.E2E_HEALTH_URL || `http://127.0.0.1:${PORT}/health`;
const PASS = process.env.E2E_PASSWORD || 'e2e_test_123';
const ADMIN_PHONE = process.env.SEED_ADMIN_PHONE || '9076062592';
const ADMIN_PASS = process.env.SEED_ADMIN_PASSWORD || 'admin_password_123';

const report = {
  startedAt: new Date().toISOString(),
  passed: [],
  failed: [],
  warnings: [],
};

const pass = (cat, msg, detail = '') => {
  report.passed.push({ cat, msg, detail });
  console.log(`[PASS] ${cat}: ${msg}${detail ? ` — ${detail}` : ''}`);
};
const fail = (cat, msg, detail = '') => {
  report.failed.push({ cat, msg, detail });
  console.log(`[FAIL] ${cat}: ${msg}${detail ? ` — ${detail}` : ''}`);
};
const warn = (cat, msg, detail = '') => {
  report.warnings.push({ cat, msg, detail });
  console.log(`[WARN] ${cat}: ${msg}${detail ? ` — ${detail}` : ''}`);
};

async function api(method, urlPath, { token, platform, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (platform) headers['X-Client-Platform'] = platform;
  const res = await fetch(`${BASE}${urlPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  let json;
  const text = await res.text();
  try {
    json = JSON.parse(text);
  } catch {
    json = { success: false, message: text.slice(0, 200) };
  }
  return { status: res.status, json };
}

async function login(phone, password, platform) {
  const { status, json } = await api('POST', '/auth/login', {
    body: { phone, password },
    platform,
  });
  if (status !== 200 || !json?.data?.accessToken) {
    throw new Error(json?.message || `HTTP ${status}`);
  }
  return json.data.accessToken;
}

function runCmd(cmd, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, shell: true, stdio: 'pipe' });
    let out = '';
    child.stdout?.on('data', (d) => { out += d; });
    child.stderr?.on('data', (d) => { out += d; });
    child.on('close', (code) => resolve({ code, out }));
  });
}

const SMOKE_GETS = [
  { path: '/integrations/status', auth: false, label: 'Integrations status' },
  { path: '/users/all', auth: true, platform: 'WEB', label: 'Users list' },
  { path: '/farmers/all', auth: true, platform: 'WEB', label: 'Farmers' },
  { path: '/buyers/all', auth: true, platform: 'WEB', label: 'Buyers' },
  { path: '/products/all', auth: true, platform: 'WEB', label: 'Products' },
  { path: '/vehicles/all', auth: true, platform: 'WEB', label: 'Vehicles' },
  { path: '/drivers/all', auth: true, platform: 'WEB', label: 'Drivers' },
  { path: '/harvests/all', auth: true, platform: 'WEB', label: 'Harvests' },
  { path: '/tapals/all', auth: true, platform: 'WEB', label: 'Tapals' },
  { path: '/inventory', auth: true, platform: 'WEB', label: 'Inventory' },
  { path: '/reports/dashboard/stats', auth: true, platform: 'WEB', label: 'Dashboard stats' },
  { path: '/notifications', auth: true, platform: 'WEB', label: 'Notifications' },
];

async function checkHealth() {
  try {
    const res = await fetch(HEALTH, { signal: AbortSignal.timeout(5000) });
    if (res.status === 200) {
      pass('Infra', 'Health endpoint', HEALTH);
      return true;
    }
    fail('Infra', 'Health endpoint', `HTTP ${res.status}`);
    return false;
  } catch (e) {
    fail('Infra', 'Backend reachable', e.message);
    return false;
  }
}

async function check404() {
  const { status, json } = await api('GET', '/this-route-does-not-exist-qa');
  if (status === 404) {
    pass('Infra', 'Unknown API returns 404');
  } else {
    fail('Infra', 'Unknown API should 404', `got ${status}`);
  }
}

async function checkAuthMatrix(tokens) {
  const roles = [
    { name: 'Admin WEB', phone: ADMIN_PHONE, pass: ADMIN_PASS, platform: 'WEB' },
    { name: 'Procurement', phone: '9000000001', pass: PASS, platform: 'MOBILE' },
    { name: 'Buyer', phone: '9000000002', pass: PASS, platform: 'MOBILE' },
    { name: 'Driver', phone: '9000000003', pass: PASS, platform: 'MOBILE' },
    { name: 'Restaurant', phone: '9000000005', pass: PASS, platform: 'WEB' },
    { name: 'Fish Mall', phone: '9000000007', pass: PASS, platform: 'WEB' },
  ];
  for (const r of roles) {
    try {
      await login(r.phone, r.pass, r.platform);
      pass('Auth', `${r.name} login`);
    } catch (e) {
      fail('Auth', `${r.name} login`, e.message);
    }
  }

  const { status } = await api('POST', '/auth/login', {
    body: { phone: '9000000001', password: 'wrong_password_xyz' },
    platform: 'WEB',
  });
  if (status === 401) pass('Auth', 'Invalid password rejected');
  else fail('Auth', 'Invalid password should 401', `got ${status}`);

  const otpSend = await api('POST', '/auth/otp/send', {
    body: { phone: '9000000003', loginPortal: 'driver' },
  });
  if (otpSend.status === 200) pass('Auth', 'Driver OTP send');
  else if (otpSend.status === 500 && String(otpSend.json?.message).includes('SMS')) {
    warn('Auth', 'Driver OTP send (SMS)', otpSend.json.message);
  } else {
    fail('Auth', 'Driver OTP send', `${otpSend.status} ${otpSend.json?.message}`);
  }

  const unknownOtp = await api('POST', '/auth/otp/send', {
    body: { phone: '9999999999', loginPortal: 'driver' },
  });
  if (unknownOtp.status === 404) pass('Auth', 'Unknown phone OTP blocked');
  else fail('Auth', 'Unknown phone should 404', `${unknownOtp.status}`);
}

async function smokeApis(adminWeb) {
  for (const ep of SMOKE_GETS) {
    const { status, json } = await api('GET', ep.path, {
      token: ep.auth ? adminWeb : undefined,
      platform: ep.platform || 'WEB',
    });
    if (status >= 500) {
      fail('API', ep.label, `HTTP ${status} — ${json?.message || 'server error'}`);
    } else if (status === 401 && ep.auth) {
      fail('API', ep.label, 'unexpected 401 with admin token');
    } else if (status === 404) {
      fail('API', ep.label, '404 not found');
    } else {
      pass('API', ep.label, `HTTP ${status}`);
    }
  }
}

function checkFrontendRoutes() {
  const routerPath = path.join(ROOT, 'frontend/src/router/index.jsx');
  const content = fs.readFileSync(routerPath, 'utf8');
  const imports = [...content.matchAll(/import\(['"](.+?)['"]\)/g)].map((m) => m[1]);
  const lazyImports = [...content.matchAll(/import\(['"](\.\.\/.+?)['"]\)/g)].map((m) => m[1]);
  let missing = 0;
  for (const rel of lazyImports) {
    const base = rel.replace(/^\.\.\//, '');
    const candidates = [
      path.join(ROOT, 'frontend/src', `${base}.jsx`),
      path.join(ROOT, 'frontend/src', `${base}.js`),
      path.join(ROOT, 'frontend/src', base, 'index.jsx'),
    ];
    if (!candidates.some((p) => fs.existsSync(p))) {
      fail('Frontend', 'Missing route component', rel);
      missing++;
    }
  }
  if (missing === 0) pass('Frontend', `Route components exist (${lazyImports.length} lazy imports)`);
}

async function checkFrontendBuild() {
  const { code, out } = await runCmd('npm', ['run', 'build'], path.join(ROOT, 'frontend'));
  if (code === 0) pass('Frontend', 'Production build');
  else fail('Frontend', 'Production build failed', out.slice(-800));
}

async function runBusinessE2E() {
  const { code, out } = await runCmd('node', ['scripts/e2eBusinessFlow.js'], path.join(ROOT, 'backend'));
  if (code === 0) pass('E2E', 'Full business flow script');
  else {
    fail('E2E', 'Business flow script', 'see output below');
    console.log(out.slice(-3000));
  }
}

function writeReport() {
  const lines = [
    '# QA Automation Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `| Metric | Count |`,
    `|--------|-------|`,
    `| Passed | ${report.passed.length} |`,
    `| Failed | ${report.failed.length} |`,
    `| Warnings | ${report.warnings.length} |`,
    '',
  ];
  if (report.failed.length) {
    lines.push('## Failures', '');
    for (const f of report.failed) {
      lines.push(`- **${f.cat}** — ${f.msg}${f.detail ? `: ${f.detail}` : ''}`);
    }
    lines.push('');
  }
  if (report.warnings.length) {
    lines.push('## Warnings', '');
    for (const w of report.warnings) {
      lines.push(`- **${w.cat}** — ${w.msg}${w.detail ? `: ${w.detail}` : ''}`);
    }
    lines.push('');
  }
  lines.push('## Passed (summary)', '');
  const byCat = {};
  for (const p of report.passed) {
    byCat[p.cat] = (byCat[p.cat] || 0) + 1;
  }
  for (const [k, v] of Object.entries(byCat)) {
    lines.push(`- ${k}: ${v}`);
  }
  const outPath = path.join(ROOT, 'docs/QA_AUTOMATION_REPORT.md');
  fs.writeFileSync(outPath, lines.join('\n'));
  console.log(`\nReport written: ${outPath}`);
}

async function main() {
  console.log('\n=== Golden Fisheries QA Full Audit ===\n');

  if (!(await checkHealth())) {
    writeReport();
    process.exit(1);
  }

  await check404();

  let adminWeb;
  try {
    adminWeb = await login(ADMIN_PHONE, ADMIN_PASS, 'WEB');
  } catch (e) {
    fail('Auth', 'Admin login (required for smoke)', e.message);
    warn('Setup', 'Run: npm run seed:admin && npm run seed:e2e');
  }

  await checkAuthMatrix();
  if (adminWeb) await smokeApis(adminWeb);

  checkFrontendRoutes();
  await checkFrontendBuild();
  await runBusinessE2E();

  console.log('\n--- Summary ---');
  console.log(`PASS: ${report.passed.length}  FAIL: ${report.failed.length}  WARN: ${report.warnings.length}`);
  writeReport();
  process.exit(report.failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
