import path from 'path';
import express from 'express';
import jade from 'jade';
import jadeBabel from 'jade-babel';

jade = jadeBabel({}, jade);

const appDir = path.dirname(require.main.filename);
const port = Number(process.env.PORT || 8080);

const app = express()
.engine('jade', jade.__express)
.set('view engine', 'jade')
.set('views', `${appDir}/views`)
.use(express.static(`${appDir}/public`))
.get('/', (req, res) => res.render('index'))
.listen(port, () => {
  (msg => console.log(`Hello from ${msg} ! Listening on port ${port}`))('Node');
});
