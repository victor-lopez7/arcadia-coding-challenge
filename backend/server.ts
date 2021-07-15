import express from 'express'
import cors from 'cors';
import { apiRoutes } from './routes';

const app: express.Application = express();
app.use( express.json() );
app.use( cors() );
app.use( express.static( 'dist/frontend' ) )
app.use( '/api', apiRoutes )

const PORT = process.env.PORT || 3000;

app.listen( PORT, () => {
  console.info( 'Server listening on port ' + PORT );
});