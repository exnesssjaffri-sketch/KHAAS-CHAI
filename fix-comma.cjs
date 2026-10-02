const fs = require('fs');
const path = 'C:/Users/ALI HAIDER/OneDrive/Desktop/KHAAS CHAI/khaas-chai/backend/src/services/supabaseService.js';
let c = fs.readFileSync(path, 'utf8');

c = c.replace('  // Storage - Handle image uploads', '  // Storage - Handle image uploads');
// Fix line 224
c = c.replace(
  'return { data, meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } };\n  }\n\n  // Storage',
  'return { data, meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } };\n  },\n\n  // Storage'
);

fs.writeFileSync(path, c, 'utf8');
console.log('Fixed missing comma before Storage');