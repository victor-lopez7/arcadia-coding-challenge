import mongoose from 'mongoose';

import app from './app';
import config from './config';

const PORT = process.env.PORT || 3000;

// connect the DB
mongoose.connect(
  config.databaseURL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.info('Openned connection with DB');
  }
)

// make the server available
app.listen( PORT, () => {
  console.info( 'Server listening on port ' + PORT );
});
