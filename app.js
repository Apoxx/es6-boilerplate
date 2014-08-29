var express = require('express')
var stylus = require('stylus')
var nib = require('nib')
var traceur = require('jade-traceur')
var jade = require('jade')

var app = express()

app.use(stylus.middleware({
  src: __dirname + '/style',
  dest: __dirname + '/public',
  compile: function (str, path) {
    return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib())
  }
}))

jade = traceur({experimental: true}, jade)
app.engine('jade', jade.__express)
app.set('view engine', 'jade')
app.set('views', __dirname + '/views')

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => res.render('index'))

var port = Number(process.env.PORT || 8080)
app.listen(8080)

;(msg => console.log(`Hello from ${msg} ! Listening on port ${port}`))('Node')