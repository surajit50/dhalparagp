
const fs = require('fs');
const path = 'public/templates/measurement-book.json';

try {
  const data = fs.readFileSync(path, 'utf8');
  const json = JSON.parse(data);
  const schemas = json.schemas[0]; // Assuming single page or first page schemas
  const names = Object.values(schemas).map(s => s.name);
  console.log('Schema names:', names);
} catch (err) {
  console.error('Error:', err);
}
