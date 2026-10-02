const fs = require('fs');
const path = 'C:/Users/ALI HAIDER/OneDrive/Desktop/KHAAS CHAI/khaas-chai/backend/src/services/supabaseService.js';
const code = fs.readFileSync(path, 'utf8');

// Try to parse with acorn (ES module parser)
try {
  const acorn = require('acorn');
  acorn.parse(code, { sourceType: 'module', ecmaVersion: 'latest' });
  console.log('SYNTAX OK');
} catch (e) {
  console.log('SYNTAX ERROR:', e.message);
  console.log('At line:', e.loc?.line, 'col:', e.loc?.column);
  const lines = code.split('\n');
  const line = e.loc?.line;
  if (line) {
    console.log('Context:');
    for (let i = Math.max(0, line - 3); i < Math.min(lines.length, line + 2); i++) {
      console.log(i + 1, JSON.stringify(lines[i]));
    }
  }
}