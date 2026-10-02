const fs = require('fs');
const c = fs.readFileSync('C:/Users/ALI HAIDER/OneDrive/Desktop/KHAAS CHAI/khaas-chai/backend/src/services/supabaseService.js', 'utf8');
const lines = c.split('\\n');
console.log('Line 48-52:');
for(let i=47; i<52; i++) {
  console.log(i+1, JSON.stringify(lines[i]));
}