const fs = require('fs');
const path = 'C:/Users/ALI HAIDER/OneDrive/Desktop/KHAAS CHAI/khaas-chai/backend/src/services/supabaseService.js';
let c = fs.readFileSync(path, 'utf8');

// Fix template literal placeholders
c = c.replace(/query\.ilike\('name', %%\);/g, "query.ilike('name', `%${filters.search}%`);");

// Add missing comma after getUserByEmail
c = c.replace('return data;\n  // Categories', 'return data,\n  // Categories');

// Add missing comma after deleteCategory
c = c.replace('return true;\n  // Products', 'return true,\n  // Products');

// Add missing comma after deleteProduct
c = c.replace('return true;\n  // Cart', 'return true,\n  // Cart');

// Add missing comma after deleteOrder
c = c.replace('return true;\n  // Inventory', 'return true,\n  // Inventory');

// Add missing comma after deleteCategory (second occurrence)
c = c.replace('return true;\n  // Admin', 'return true,\n  // Admin');

// Add missing comma after deleteContact
c = c.replace('return true;\n  // Newsletter', 'return true,\n  // Newsletter');

// Add storage methods and closing
const storageMethods = `
  // Storage - Handle image uploads
  async uploadImage(file, folder = 'products') {
    const fileName = \`\${folder}/\${Date.now()}-\${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}\`;
    const { data, error } = await supabaseAdmin.storage.from('images').upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) throw error;
    const { publicUrl: urlData } = supabaseAdmin.storage.from('images').getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async deleteImage(url) {
    try {
      const path = url.split('/images/')[1];
      if (!path) return;
      await supabaseAdmin.storage.from('images').remove([path]);
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  }
};

export default supabaseService;
`;

c += storageMethods;

fs.writeFileSync(path, c, 'utf8');
console.log('Fixed supabaseService.js');