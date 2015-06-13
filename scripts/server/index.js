import express from 'express';
import jade from 'jade';
import jadeBabel from 'jade-babel';
import { server } from '../../config';

const jadeWithBabel = jadeBabel({}, jade);

express()
.engine('jade', jadeWithBabel.__express)
.set('view engine', 'jade')
.set('views', `${process.cwd()}/views`)
.use(express.static(`${process.cwd()}/public`))
.get('/', (req, res) => res.render('index'))
.listen(server.port, () => {
  console.log(`Listening on port ${server.port}`);
});
