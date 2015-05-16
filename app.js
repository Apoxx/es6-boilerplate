var fs = require('fs');
require('babel/register');
require('./scripts/server/main');
fs.closeSync(fs.openSync('./tmp/reload', 'w'));
