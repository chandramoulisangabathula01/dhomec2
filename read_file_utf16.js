const fs = require('fs');
const file = process.argv[2];
try {
    const content = fs.readFileSync(file, 'utf16le');
    console.log(content);
} catch (e) {
    console.error(e);
}
