const fs = require('fs');
const path = require('path');

const backupDir = process.env.DB_BACKUP_DIR || path.join(process.cwd(), 'backups');

function run() {
  if (!fs.existsSync(backupDir)) {
    console.error(`Backup directory missing: ${backupDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(backupDir)
    .filter((file) => file.toLowerCase().endsWith('.bak'));

  if (files.length === 0) {
    console.error(`No .bak files found in ${backupDir}`);
    process.exit(1);
  }

  console.log(`Backups found: ${files.length}`);
}

run();
