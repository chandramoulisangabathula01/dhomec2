const fs = require('fs');
const path = require('path');
const file = process.argv[2];
if (!file) {
    console.error('Usage: node read_file.js <file>');
    process.exit(1);
}
console.log(fs.readFileSync(file, 'utf8'));
