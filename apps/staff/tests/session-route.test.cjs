const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);
const policy = require('../src/lib/access-policy.ts');
const source = ts.transpileModule(fs.readFileSync(require.resolve('../src/app/api/session/route.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function load(overrides = {}) {
  const saved = [];
  const server = {
    demoEnabled: false, readSession: async () => null, clearSession: async () => {},
    publicSession: session => session, saveSession: async (session, keep) => saved.push({ session, keep }),
    apiRequest: async () => { throw new Error('API unavailable'); }, ...overrides,
  };
  const exports = {};
  vm.runInNewContext(source, { exports, Buffer, console, Date,
    require: name => {
      if (name === 'next/server') return { NextResponse: { json: (body, init) => new Response(JSON.stringify(body), init) } };
      if (name === '@/lib/server-session') return server;
      if (name === '@/lib/access-policy') return policy;
      throw new Error('Unexpected dependency: ' + name);
    },
  });
  return { ...exports, saved };
}
function request(body, origin = 'http://localhost:3001') {
  return { nextUrl: new URL('http://localhost:3001/api/session'), headers: new Headers({ origin }), json: async () => body };
}
const staff = { accountId: 'ECHO-STF-001', password: 'EchoFlow!demo', keep: true };
const token = 'header.' + Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 900 })).toString('base64url') + '.signature';
const live = account => async path => new Response(JSON.stringify(path.endsWith('/login') ? { accessToken: token, refreshToken: 'refresh' } : account), { status: 200 });

test('live API outage never falls back to valid demo credentials', async () => {
  const route = load();
  assert.equal((await route.POST(request(staff))).status, 503);
  assert.equal(route.saved.length, 0);
});
test('invalid live credentials do not fall back to demo', async () => {
  const route = load({ apiRequest: async () => new Response('{}', { status: 401 }) });
  assert.equal((await route.POST(request(staff))).status, 401);
  assert.equal(route.saved.length, 0);
});
test('client supplied role cannot promote a verified technician', async () => {
  const route = load({ apiRequest: live({ staffId: staff.accountId, role: 'technician', status: 'active' }) });
  assert.equal((await route.POST(request({ ...staff, role: 'super_admin' }))).status, 200);
  assert.equal(route.saved[0].session.role, 'technician');
});
test('room lead is a supported staff account', async () => {
  const route = load({ apiRequest: live({ staffId: staff.accountId, role: 'room_lead', status: 'active' }) });
  assert.equal((await route.POST(request(staff))).status, 200);
  assert.equal(route.saved[0].session.role, 'room_lead');
});
test('wrong account identity, patient role, role mismatch and suspended staff are denied', async () => {
  for (const account of [
    { staffId: 'OTHER', role: 'technician', status: 'active' },
    { staffId: staff.accountId, role: 'patient', status: 'active' },
    { staffId: staff.accountId, role: 'super_admin', status: 'active' },
    { staffId: staff.accountId, role: 'technician', status: 'suspended' },
  ]) {
    const route = load({ apiRequest: live(account) });
    assert.equal((await route.POST(request(staff))).status, 403);
    assert.equal(route.saved.length, 0);
  }
});
test('admin sign-in forwards the access code to the API and verifies its role', async () => {
  let submitted;
  const route = load({ apiRequest: async (path, init) => {
    if (path.endsWith('/login')) { assert.equal(path, '/auth/admin/login'); submitted = JSON.parse(init.body); }
    return live({ adminId: 'ECHO-ADM-014', role: 'super_admin' })(path);
  } });
  assert.equal((await route.POST(request({ accountId: 'ECHO-ADM-014', password: 'password', twoFactorCode: '654321' }))).status, 200);
  assert.equal(submitted.twoFactorCode, '654321');
  assert.equal(route.saved[0].session.role, 'super_admin');
});
test('cross-origin session changes are rejected', async () => {
  const route = load({ demoEnabled: true });
  assert.equal((await route.POST(request(staff, 'https://evil.test'))).status, 403);
  assert.equal((await route.DELETE(request({}, 'https://evil.test'))).status, 403);
  assert.equal(route.saved.length, 0);
});
test('demo administrator needs correct credentials and access code', async () => {
  const route = load({ demoEnabled: true });
  const admin = { accountId: 'ECHO-ADM-014', password: 'EchoFlow!demo' };
  assert.equal((await route.POST(request(admin))).status, 401);
  assert.equal((await route.POST(request({ ...admin, twoFactorCode: '000000' }))).status, 401);
  assert.equal((await route.POST(request({ ...admin, twoFactorCode: '123456' }))).status, 200);
});
