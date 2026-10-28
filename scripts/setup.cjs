const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');
if (!fs.existsSync(envPath)) {
  fs.copyFileSync(path.join(root, '.env.example'), envPath);
  console.log('Created .env from .env.example. Existing settings are never overwritten.');
}
fs.mkdirSync(path.join(root, 'data'), { recursive: true });
console.log('Setup complete. The database and tables are created when the API starts.');
