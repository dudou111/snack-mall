const assert = require('assert');
const fs = require('fs');
const path = require('path');

const serverRoot = __dirname;
const indexPath = path.join(serverRoot, 'index.js');
const source = fs.readFileSync(indexPath, 'utf8');

const routerImports = Array.from(
  source.matchAll(/require\(['"]\.\/router\/([^'"]+)['"]\)/g),
  (match) => match[1]
);

const missingRouters = routerImports.filter((routerPath) => {
  const resolvedPath = path.join(serverRoot, 'router', `${routerPath}.js`);
  return !fs.existsSync(resolvedPath);
});

assert.deepStrictEqual(
  missingRouters,
  [],
  `Missing router files referenced by index.js: ${missingRouters.join(', ')}`
);

console.log('server router import tests passed');
