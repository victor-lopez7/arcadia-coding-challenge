import mongoose from 'mongoose';

import app from './app';
import config from './config';

const PORT = process.env.PORT || 3000;

mongoose.connect(
  config.databaseURL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.info('Openned connection with DB');
  }
)

app.listen( PORT, () => {
  console.info( 'Server listening on port ' + PORT );
});
