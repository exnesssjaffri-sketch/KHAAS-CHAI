const fs = require('fs');
const path = 'C:/Users/ALI HAIDER/OneDrive/Desktop/KHAAS CHAI/khaas-chai/backend/src/services/supabaseService.js';
let c = fs.readFileSync(path, 'utf8');

// Fix deleteCategory -> listProducts missing comma
// Line 48:     return true;
// Line 49:   }
// Line 50: (empty)
// Line 51:   // Products methods
// Line 52:   async listProducts(filters = {}) {
c = c.replace(
  'return true;\n  }\n\n  // Products methods\n  async listProducts(filters = {}) {',
  'return true;\n  },\n\n  // Products methods\n  async listProducts(filters = {}) {'
);

fs.writeFileSync(path, c, 'utf8');
console.log('Fixed missing comma before listProducts');