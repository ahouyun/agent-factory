const fs = require('fs');
const path = require('path');

const dir = path.dirname(__filename || process.argv[1]);
console.log('Writing files to:', dir);

// Helper function
function writeDay(filename, content) {
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, content, 'utf8');
    const lines = content.split('\n').length;
    console.log(`${filename} written: ${lines} lines`);
}

module.exports = { writeDay, dir };
