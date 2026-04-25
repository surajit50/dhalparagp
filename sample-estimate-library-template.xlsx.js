// Script to generate sample Excel template for bulk upload
const XLSX = require('xlsx');

// Sample data with proper headings
const sampleData = [
    {
        "Code": "1.1.1",
        "Description": "Excavation in foundation trenches or drains (not exceeding 1.5 m in width), including dressing sides and ramming bottom",
        "Unit": "Cum",
        "Rate": 250.50,
        "Category": "Earthwork"
    },
    {
        "Code": "1.1.2",
        "Description": "Filling available excavated earth (excluding rock) in trenches, plinth, sides of foundation etc. in layers not exceeding 20cm",
        "Unit": "Cum",
        "Rate": 125.75,
        "Category": "Earthwork"
    },
    {
        "Code": "2.1.1",
        "Description": "Cement concrete 1:3:6 (1 cement: 3 coarse sand: 6 graded stone aggregate 40mm nominal size)",
        "Unit": "Cum",
        "Rate": 4500.00,
        "Category": "Concrete Work"
    },
    {
        "Code": "2.1.2",
        "Description": "Reinforced cement concrete work in beams, lintels, slabs etc. including shuttering and finishing",
        "Unit": "Cum",
        "Rate": 6800.00,
        "Category": "Concrete Work"
    },
    {
        "Code": "3.1.1",
        "Description": "Brick work with common burnt clay F.P.S. (non modular) bricks of class designation 7.5 in foundation and plinth",
        "Unit": "Sqm",
        "Rate": 450.25,
        "Category": "Masonry"
    },
    {
        "Code": "3.1.2",
        "Description": "Brick work with common burnt clay F.P.S. (non modular) bricks of class designation 7.5 in superstructure",
        "Unit": "Sqm",
        "Rate": 485.50,
        "Category": "Masonry"
    },
    {
        "Code": "4.1.1",
        "Description": "12mm cement plaster of mix 1:4 (1 cement : 4 fine sand)",
        "Unit": "Sqm",
        "Rate": 185.00,
        "Category": "Plastering"
    },
    {
        "Code": "5.1.1",
        "Description": "Providing and laying ceramic glazed wall tiles confirming to IS:15622 of approved make",
        "Unit": "Sqm",
        "Rate": 680.00,
        "Category": "Finishing"
    },
    {
        "Code": "6.1.1",
        "Description": "Painting with acrylic emulsion paint of approved brand and manufacture",
        "Unit": "Sqm",
        "Rate": 95.50,
        "Category": "Painting"
    },
    {
        "Code": "7.1.1",
        "Description": "Providing and fixing M.S. grills of required pattern in frames of windows etc.",
        "Unit": "Kg",
        "Rate": 125.00,
        "Category": "Metal Work"
    }
];

// Create a new workbook
const wb = XLSX.utils.book_new();

// Convert data to worksheet
const ws = XLSX.utils.json_to_sheet(sampleData);

// Set column widths for better readability
ws['!cols'] = [
    { wch: 12 },  // Code
    { wch: 80 },  // Description
    { wch: 10 },  // Unit
    { wch: 12 },  // Rate
    { wch: 20 }   // Category
];

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, "Estimate Library");

// Write to file
XLSX.writeFile(wb, 'sample-estimate-library-template.xlsx');

console.log('Sample Excel template created successfully!');
console.log('File: sample-estimate-library-template.xlsx');
