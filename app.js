var fs = require('fs');
require('babel/register');
require('./scripts/server');
fs.closeSync(fs.openSync('./tmp/reload', 'w'));
