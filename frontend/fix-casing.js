const fs = require('fs');
const path = require('path');

const directories = [
  'd:/Project/CT449/Project/frontend/admin-web/src',
  'd:/Project/CT449/Project/frontend/user-web/src'
];

const replacements = {
  'TENSACH': 'TenSach',
  'DONGIA': 'DonGia',
  'SOQUYEN': 'SoQuyen',
  'NAMXUATBAN': 'NamXuatBan',
  'MANXB': 'MaNXB',
  'TACGIA': 'TacGia',
  'SOTRANG': 'SoTrang',
  'MOTA': 'MoTa',
  'NGONNGU': 'NgonNgu',
  'THELOAI': 'TheLoai',
  'TENNXB': 'TenNXB',
  'DIACHI': 'DiaChi'
};

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.vue') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [upper, pascal] of Object.entries(replacements)) {
        if (content.includes(upper)) {
          // Replace all occurrences
          const regex = new RegExp(`\\b${upper}\\b`, 'g');
          content = content.replace(regex, pascal);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

for (const dir of directories) {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
}
console.log('Done!');
