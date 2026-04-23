const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'src/views/Products/ProductManagement.tsx'), 'utf8');

assert(
  source.includes('const [exporting, setExporting] = useState(false);'),
  'product export should track exporting state'
);

assert(
  source.includes('const handleExport = async () => {'),
  'product export should provide a dedicated export handler'
);

assert(
  source.includes('text/csv;charset=utf-8;'),
  'product export should generate a UTF-8 CSV blob'
);

assert(
  source.includes('onClick={handleExport}'),
  'export button should trigger the export handler'
);

assert(
  source.includes('loading={exporting}'),
  'export button should show loading state while exporting'
);

console.log('product export UI tests passed');
