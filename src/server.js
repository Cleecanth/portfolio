import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import path from 'path';
import * as sapper from '../__sapper__/server.js';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';
//const destPath = path.resolve(process.cwd(), 'static');

polka() // You can also use Express
    .use(
        compression({ threshold: 0 }),
        sirv('static', { dev }),
        sapper.middleware()
    )
    .listen(PORT, (err) => {
        if (err) console.info('error', err);
    });
