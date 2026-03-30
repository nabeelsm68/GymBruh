const fs = require('fs');

try {
    const content = fs.readFileSync('models.json', 'utf16le'); // Try utf16 first
    const matches = content.match(/models\/[a-z0-9\.-]+/g);
    if (matches) {
        console.log('--- FOUND ---');
        console.log([...new Set(matches)].join('\n'));
    } else {
        console.log('No matches in utf16le');
    }
} catch (e) {
    console.log('Error: ' + e.message);
}
