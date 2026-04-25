const fs = require('fs');
const path = require('path');

const inputPath = path.join('public', 'templates', 'probable-estimate.json');
const abstractPath = path.join('public', 'templates', 'probable-estimate-abstract.json');
const detailedPath = path.join('public', 'templates', 'probable-estimate-detailed.json');

try {
  const content = fs.readFileSync(inputPath, 'utf8');
  const template = JSON.parse(content);
  
  // Create Abstract Template (Ensure correct headers if needed, but likely we just use the existing structure or slightly modify it)
  // We assume the existing one IS abstract-ish, but let's verify/enforce headers.
  
  const abstractTemplate = JSON.parse(JSON.stringify(template));
  const detailedTemplate = JSON.parse(JSON.stringify(template));
  
  // Helper to find table
  const findTable = (schemas) => {
    for (const schema of schemas) {
      if (Array.isArray(schema)) { // Page schemas are arrays
        for (const item of schema) {
          if (item.name === 'workitemstable' || item.type === 'table') {
            return item;
          }
        }
      }
    }
    return null;
  };

  // Modify Abstract Template
  // Abstract Headers: ["SL NO", "SHEDULE PAGE NO", "DESCRIPTION OF ITEM", "QUANTITY", "UNIT", "RATE", "AMOUNT"]
  const abstractTable = findTable(abstractTemplate.schemas);
  if (abstractTable) {
    console.log("Found table in Abstract template:", abstractTable.name);
    abstractTable.head = ["SL NO", "SHEDULE PAGE NO", "DESCRIPTION OF ITEM", "QUANTITY", "UNIT", "RATE", "AMOUNT"];
    // Adjust column widths if they are defined in 'headWidthPercentages' or similar (pdfme v1?) or 'columns' (pdfme v3?)
    // Based on "inputs" usage in ClientPage, it seems to be a simple table.
    // pdfme v1 table schema has `head` and `width` but column widths are usually auto or distributed.
    // Actually pdfme table usually needs `head` array.
    // Let's assume standard pdfme table.
  } else {
    console.error("Could not find table in template");
  }

  // Modify Detailed Template
  // Detailed Headers: ["Sl No", "Page No", "Description", "Nos", "Length", "Breadth", "Depth", "Quantity", "Unit", "Rate", "Amount"]
  const detailedTable = findTable(detailedTemplate.schemas);
  if (detailedTable) {
    console.log("Found table in Detailed template:", detailedTable.name);
    detailedTable.head = ["SL NO", "PAGE NO", "DESCRIPTION OF ITEM", "NOS", "LENGTH", "BREADTH", "DEPTH", "QUANTITY", "UNIT", "RATE", "AMOUNT"];
    // We might need to adjust the content/inputs to match this length.
  }

  // Save files
  fs.writeFileSync(abstractPath, JSON.stringify(abstractTemplate, null, 2));
  fs.writeFileSync(detailedPath, JSON.stringify(detailedTemplate, null, 2));
  
  console.log("Templates created successfully.");

} catch (err) {
  console.error("Error processing templates:", err);
}
