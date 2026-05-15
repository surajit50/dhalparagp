import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceColors(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Replace blue, indigo, sky, cyan, teal with orange
  // We use regex to only match these as part of tailwind classes, e.g. text-blue-500, bg-sky-50
  
  const colorsToReplace = ['blue', 'indigo', 'sky', 'cyan', 'teal'];
  
  colorsToReplace.forEach(color => {
    // Match something like `bg-blue-500`, `text-blue-600`, `border-blue-200`, `hover:bg-blue-700`
    // Match pattern: word boundaries or hyphens before the color name.
    const regex = new RegExp(`(?<=[a-z:-]+)${color}(?=-[0-9]{2,3})`, 'g');
    content = content.replace(regex, 'orange');
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated colors in: ${filePath}`);
  }
}

const componentsDir = path.join(process.cwd(), 'components');
const appDir = path.join(process.cwd(), 'app');

console.log('Replacing colors in components directory...');
walkDir(componentsDir, replaceColors);

console.log('Replacing colors in app directory...');
walkDir(appDir, replaceColors);

console.log('Done!');
