// Very basic curl command parser for MVP (supports method, url, headers, body)
export function parseCurlCommand(curl) {
  // Remove line continuations and split arguments
  const cleaned = curl.replace(/\\\n/g, ' ').replace(/\s+/g, ' ');
  const args = cleaned.match(/(?:"[^"]*"|'[^']*'|[^\s"]+)+/g) || [];
  if (!args.length || args[0] !== 'curl') throw new Error('Not a curl command');

  let method = 'GET';
  let url = '';
  let headers = [];
  let body = '';
  let lastOpt = '';

  for (let i = 1; i < args.length; i++) {
    let arg = args[i];
    if (arg === '-X' || arg === '--request') {
      method = args[++i].replace(/^['"]|['"]$/g, '');
      lastOpt = 'method';
    } else if (arg === '-H' || arg === '--header') {
      let header = args[++i].replace(/^['"]|['"]$/g, '');
      let [key, ...val] = header.split(':');
      headers.push({ key: key.trim(), value: val.join(':').trim() });
      lastOpt = 'header';
    } else if (arg === '-d' || arg === '--data' || arg === '--data-raw' || arg === '--data-binary') {
      body = args[++i].replace(/^['"]|['"]$/g, '');
      if (method === 'GET') method = 'POST';
      lastOpt = 'body';
    } else if (!arg.startsWith('-')) {
      if (!url) url = arg.replace(/^['"]|['"]$/g, '');
      lastOpt = 'url';
    } else {
      lastOpt = '';
    }
  }

  return { method, url, headers, data: body };
}
