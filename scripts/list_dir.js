const fs = require('fs');
const path = require('path');
const d = path.resolve(__dirname, '..', 'kpi_data', '202510', '20251022_extracted');
console.log('Checking', d);
if(!fs.existsSync(d)) { console.log('extract dir not found'); process.exit(0)}
const items = fs.readdirSync(d);
console.log('extracted items count:', items.length);
items.forEach(i=>console.log(i));
