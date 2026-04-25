
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'public/templates/probable-estimate.json');
const content = fs.readFileSync(filePath, 'utf8');
const json = JSON.parse(content);

console.log('Original Schema Count:', json.schemas.length);
const schema = json.schemas[0]; // Assuming single page template or first page schema
// Find table
const tableKey = Object.keys(schema).find(key => schema[key].type === 'table') || 
                 Object.values(schema).find(val => val.type === 'table');

// In pdfme v1, schemas is array of objects {name, type, ...}
// In v3, it is object {name: {type...}}
// The file content showed "schemas": [[{...}]] so it is v1/v2 style (array of arrays).

const tableSchema = schema.find(s => s.type === 'table');
console.log('Table Schema found:', !!tableSchema);
if (tableSchema) {
  console.log('Table Name:', tableSchema.name);
  console.log('Table Content (sample):', tableSchema.content);
  console.log('Table Head:', tableSchema.head); // If exists
  console.log('Table Widths:', tableSchema.columnWidths || tableSchema.headWidthPercentages);
}

// Write the content to a temp file to see structure if needed, but logging is enough.
// I will create the new templates based on this.

// Create Abstract Template (ensure it is saved as explicit abstract file)
const abstractPath = path.join(process.cwd(), 'public/templates/probable-estimate-abstract.json');
fs.writeFileSync(abstractPath, JSON.stringify(json, null, 2));

// Create Detailed Template
const detailedJson = JSON.parse(JSON.stringify(json));
const detailedSchema = detailedJson.schemas[0];
const detailedTableIndex = detailedSchema.findIndex(s => s.type === 'table');

if (detailedTableIndex !== -1) {
    const table = detailedSchema[detailedTableIndex];
    // Modify table for Detailed Estimate
    // Columns: Sl No, Page No, Description, Nos, Length, Breadth, Depth, Quantity, Unit, Rate, Amount
    // 11 Columns.
    // Original likely has: Sl No, Page No, Description, Quantity, Unit, Rate, Amount (7 columns)
    
    // We need to redefine the table structure. 
    // In pdfme, the `content` is the JSON string of data. The `head` or `columns` might be defined.
    // But wait, if it uses `table` plugin, does it define columns in schema?
    // Often it just takes a rectangular area and input data defines columns, OR it has specific column config.
    // Let's see what the log says.
    
    // For now, I'll just save the script and run it to inspect.
}
