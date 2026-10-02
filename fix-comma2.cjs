const fs = require('fs');
const path = 'C:/Users/ALI HAIDER/OneDrive/Desktop/KHAAS CHAI/khaas-chai/backend/src/services/supabaseService.js';
let c = fs.readFileSync(path, 'utf8');

// Fix createCategory -> updateCategory missing comma
// Line 41:     return category;
// Line 42:   }
// Line 43: (empty)
// Line 44:   async updateCategory(id, data) {
c = c.replace(
  'return category;\n  }\n\n  async updateCategory(id, data) {',
  'return category;\n  },\n\n  async updateCategory(id, data) {'
);

fs.writeFileSync(path, c, 'utf8');
console.log('Fixed missing comma before updateCategory');