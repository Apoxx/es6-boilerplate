var path = require('path');
var express = require('express');
var to5 = require('jade-6to5');
var jade = require('jade');

var appDir = path.dirname(require.main.filename);

var app = express();

jade = to5({}, jade);
app.engine('jade', jade.__express);
app.set('view engine', 'jade');
app.set('views', appDir + '/views');

app.use(express.static(appDir + '/public'));

app.get('/', (req, res) => res.render('index'));

var port = Number(process.env.PORT || 8080);

app.listen(port, () => {
  (msg => console.log(`Hello from ${msg} ! Listening on port ${port}`))('Node');
});
