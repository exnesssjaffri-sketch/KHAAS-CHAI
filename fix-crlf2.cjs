const fs = require('fs');
const path = 'C:/Users/ALI HAIDER/OneDrive/Desktop/KHAAS CHAI/khaas-chai/backend/src/services/supabaseService.js';
let c = fs.readFileSync(path, 'utf8');
c = c.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
fs.writeFileSync(path, c, 'utf8');
console.log('Converted CRLF to LF');