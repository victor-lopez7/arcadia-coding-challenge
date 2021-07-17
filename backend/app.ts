import express from 'express';
import cors from 'cors';
import config from './config';
import airportsRoutes from './airports-routes';

const app: express.Application = express();
app.use( express.json() );
app.use( cors() );
app.use( express.static( config.static ) )

app.use( `${config.baseAPI}${config.airports}`, airportsRoutes )

export default app;

