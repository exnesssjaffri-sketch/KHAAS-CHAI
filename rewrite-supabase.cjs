const fs = require('fs');
const path = 'C:/Users/ALI HAIDER/OneDrive/Desktop/KHAAS CHAI/khaas-chai/backend/src/services/supabaseService.js';

// Read the current file
let content = fs.readFileSync(path, 'utf8');

// Convert to LF line endings
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

// Remove any BOM
if (content.startsWith('\uFEFF')) {
  content = content.slice(1);
}

// Now let's rebuild the file properly
const lines = content.split('\n');

// Find the start of the object (after "export const supabaseService = {")
// Find the end (before "};")

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const supabaseService = {')) {
    startIdx = i;
    break;
  }
}

if (startIdx === -1) {
  console.error('Could not find start of supabaseService object');
  process.exit(1);
}

// Find the end - look for "};"
for (let i = startIdx + 1; i < lines.length; i++) {
  if (lines[i].trim() === '};') {
    endIdx = i;
    break;
  }
}

if (endIdx === -1) {
  console.error('Could not find end of supabaseService object');
  process.exit(1);
}

// Extract the methods part
const headerLines = lines.slice(0, startIdx + 1); // Includes the export line
const footerLines = lines.slice(endIdx); // Includes the }; and export default
const methodsLines = lines.slice(startIdx + 1, endIdx);

// Process methods to ensure proper commas
const processedMethods = [];
for (let i = 0; i < methodsLines.length; i++) {
  processedMethods.push(methodsLines[i]);
  
  // Check if this line ends a method and next line starts a new method or section
  const line = methodsLines[i];
  const trimmed = line.trim();
  
  if (trimmed.endsWith('}')) {
    // Check next non-empty line
    let j = i + 1;
    while (j < methodsLines.length && methodsLines[j].trim() === '') {
      j++;
    }
    
    if (j < methodsLines.length) {
      const nextLine = methodsLines[j];
      const nextTrimmed = nextLine.trim();
      
      // If next line starts a new method or section, we need a comma
      if (nextTrimmed.startsWith('async ') || 
          nextTrimmed.startsWith('//') && 
          !nextTrimmed.includes('Storage - Handle image uploads')) { // Storage is last
        // Add comma to current line if it doesn't have one
        if (!line.endsWith('},')) {
          processedMethods[processedMethods.length - 1] = line + ',';
        }
      }
    }
  }
}

// Rebuild the content
const newContent = [
  ...headerLines,
  ...processedMethods,
  ...footerLines
].join('\n');

fs.writeFileSync(path, newContent, 'utf8');
console.log('Rewritten supabaseService.js with proper formatting');