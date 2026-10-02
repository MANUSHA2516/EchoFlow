const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);
const { homeFor, destinationFor, workspaceFor, isWebRole } = require('../src/lib/access-policy.ts');
const { encodeSession, decodeSession } = require('../src/lib/session-token.ts');
const secret = 'test-secret-with-at-least-thirty-two-characters';
const session = () => ({ accountId: 'ECHO-STF-001', role: 'technician', expiresAt: Date.now() + 60000, demo: true });

test('staff and room leads use staff routes; only super admin uses admin routes', () => {
  for (const role of ['technician', 'room_lead']) {
    assert.equal(workspaceFor(role), 'staff');
    assert.equal(homeFor(role), '/');
    assert.equal(destinationFor(role, '/admin/settings'), '/');
    assert.equal(destinationFor(role, '/patients/patient-01'), '/patients/patient-01');
  }
  assert.equal(homeFor('super_admin'), '/admin');
  assert.equal(destinationFor('super_admin', '/admin/profile/edit'), '/admin/profile/edit');
  assert.equal(destinationFor('super_admin', '/queue'), '/admin');
  assert.equal(isWebRole('patient'), false);
  assert.equal(isWebRole('admin'), false);
});
test('redirects reject external, encoded, executable and unknown destinations', () => {
  for (const path of ['https://evil.test', '//evil.test', '/\\evil.test', 'javascript:alert(1)', '/%2f%2fevil.test', '/login', '/admin/../queue', '/unknown', '/\n/evil.test']) {
    assert.equal(destinationFor('technician', path), '/');
    assert.equal(destinationFor('super_admin', path), '/admin');
  }
  assert.equal(destinationFor('technician', '/queue?filter=waiting'), '/queue?filter=waiting');
});
test('signed session round trips and preserves role', () => {
  const value = session();
  assert.deepEqual(decodeSession(encodeSession(value, secret), secret, true), value);
});
test('editing a staff cookie cannot grant admin access', () => {
  const token = encodeSession(session(), secret);
  const [payload, signature] = token.split('.');
  const edited = JSON.parse(Buffer.from(payload, 'base64url').toString());
  edited.role = 'super_admin';
  assert.equal(decodeSession(`${Buffer.from(JSON.stringify(edited)).toString('base64url')}.${signature}`, secret, true), null);
  assert.equal(decodeSession(token, 'another-secret', true), null);
});
test('expired, malformed and unknown-role sessions are rejected', () => {
  for (const token of [undefined, '', '{}', 'a.b', 'a.b.c']) assert.equal(decodeSession(token, secret, true), null);
  for (const value of [{ ...session(), expiresAt: 0 }, { ...session(), role: 'patient' }, { ...session(), expiresAt: 'tomorrow' }]) {
    assert.equal(decodeSession(encodeSession(value, secret), secret, true), null);
  }
});
test('demo cookies cannot be used when demo mode is off', () => {
  assert.equal(decodeSession(encodeSession(session(), secret), secret, false), null);
});
test('live sessions must include an API token for server verification', () => {
  const value = { ...session(), demo: false };
  assert.equal(decodeSession(encodeSession(value, secret), secret, false), null);
  value.accessToken = 'verified-by-api-on-each-read';
  assert.deepEqual(decodeSession(encodeSession(value, secret), secret, false), value);
});
