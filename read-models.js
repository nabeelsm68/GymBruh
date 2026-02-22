const fs = require('fs');

try {
    // Try reading as utf16le which is likely what PowerShell wrote
    const content = fs.readFileSync('models.json', 'utf16le');
    console.log('--- UTF16LE READ ---');
    console.log(content.substring(0, 500)); // Print first 500 chars to check

    // Try parsing
    const data = JSON.parse(content);
    console.log('\n--- MODELS ---');
    data.models.forEach(m => console.log(m.name));
} catch (e) {
    console.log('UTF16LE failed: ' + e.message);
    try {
        const content = fs.readFileSync('models.json', 'utf8');
        console.log('\n--- UTF8 READ ---');
        console.log(content.substring(0, 500));
        const data = JSON.parse(content);
        console.log('\n--- MODELS ---');
        data.models.forEach(m => console.log(m.name));
    } catch (e2) {
        console.log('UTF8 failed: ' + e2.message);
    }
}
