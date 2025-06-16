import { parseCurlCommand } from './parseCurl.js';

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
  } catch (e) {
    console.error(`FAIL: ${name}\n  ${e.message}`);
  }
}

// 1. Basic GET
// 2. Explicit method
// 3. Headers: -H and --header
// 4. Body: -d, --data, --data-raw, --data-binary
// 5. Quoted values
// 6. Multiple headers, multiple data
// 7. URL at start or end
// 8. No method (default GET)
// 9. POST with data
// 10. Edge: header with colon in value
// 11. Edge: data with spaces and quotes
// 12. Edge: no url

// Helper for deep comparison
function eq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

test('basic GET', () => {
  const c = `curl https://api.example.com`;
  const r = parseCurlCommand(c);
  if (r.method !== 'GET') throw new Error('method');
  if (r.url !== 'https://api.example.com') throw new Error('url');
  if (!eq(r.headers, [])) throw new Error('headers');
  if (r.data !== '') throw new Error('body');
});

test('explicit method -X POST', () => {
  const c = `curl -X POST https://api.example.com`;
  const r = parseCurlCommand(c);
  if (r.method !== 'POST') throw new Error('method');
});

test('header -H', () => {
  const c = `curl -H 'Authorization: Bearer token' https://api.example.com`;
  const r = parseCurlCommand(c);
  if (!eq(r.headers, [{ key: 'Authorization', value: 'Bearer token' }])) throw new Error('headers');
});

test('header --header', () => {
  const c = `curl --header "Accept: application/json" https://api.example.com`;
  const r = parseCurlCommand(c);
  if (!eq(r.headers, [{ key: 'Accept', value: 'application/json' }])) throw new Error('headers');
});

test('body -d', () => {
  const c = `curl -d "foo=bar" https://api.example.com`;
  const r = parseCurlCommand(c);
  if (r.data !== 'foo=bar') throw new Error('body');
  if (r.method !== 'POST') throw new Error('method');
});

test('body --data', () => {
  const c = `curl --data '{"k":1}' https://api.example.com`;
  const r = parseCurlCommand(c);
  if (r.data !== '{"k":1}') throw new Error('body');
});

test('body --data-raw', () => {
  const c = `curl --data-raw 'abc' https://api.example.com`;
  const r = parseCurlCommand(c);
  if (r.data !== 'abc') throw new Error('body');
});

test('body --data-binary', () => {
  const c = `curl --data-binary "bin" https://api.example.com`;
  const r = parseCurlCommand(c);
  if (r.data !== 'bin') throw new Error('body');
});

test('multiple headers', () => {
  const c = `curl -H 'A: 1' --header "B:2" https://api.example.com`;
  const r = parseCurlCommand(c);
  if (!eq(r.headers, [
    { key: 'A', value: '1' },
    { key: 'B', value: '2' }
  ])) throw new Error('headers');
});

test('header with colon in value', () => {
  const c = `curl -H 'X-Api: foo:bar:xyz' https://api.example.com`;
  const r = parseCurlCommand(c);
  if (!eq(r.headers, [
    { key: 'X-Api', value: 'foo:bar:xyz' }
  ])) throw new Error('headers');
});

test('body with spaces and quotes', () => {
  const c = `curl -d 'foo bar "baz"' https://api.example.com`;
  const r = parseCurlCommand(c);
  if (r.data !== 'foo bar "baz"') throw new Error('body');
});

test('url at end', () => {
  const c = `curl -X PUT -H 'A:1' -d 'x=1' https://foo.com/api`;
  const r = parseCurlCommand(c);
  if (r.url !== 'https://foo.com/api') throw new Error('url');
});

test('url at start', () => {
  const c = `curl https://foo.com/api -X PATCH`;
  const r = parseCurlCommand(c);
  if (r.url !== 'https://foo.com/api') throw new Error('url');
  if (r.method !== 'PATCH') throw new Error('method');
});

test('no url', () => {
  let failed = false;
  try {
    parseCurlCommand('curl -X GET');
  } catch (e) {
    failed = true;
  }
  if (!failed) throw new Error('should fail');
});

test('quoted url', () => {
  const c = `curl "https://foo.com/api"`;
  const r = parseCurlCommand(c);
  if (r.url !== 'https://foo.com/api') throw new Error('url');
});

test('multiple -d uses last', () => {
  const c = `curl -d 'a=1' -d 'b=2' https://api.example.com`;
  const r = parseCurlCommand(c);
  if (r.data !== 'b=2') throw new Error('body');
});
