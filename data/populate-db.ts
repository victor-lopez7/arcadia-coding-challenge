import mongoose from 'mongoose';

import Airport from '../frontend/src/models/airport';
import airportsData from './airport-codes.json';
import AirportModel from '../backend/models/airport.model';
import config from '../backend/config';
import AirportRaw from './raw-data-models/airport-raw';
import RawDataParser from './raw-data-parser';

// Utility for filling the DB with json data for airports

async function populateAirportsCollection(rawAirports: Array<AirportRaw>){
    const airports: Array<Airport> =  
        rawAirports.map(RawDataParser.parseAirport);

    try{
        await AirportModel.create(airports);
    } catch(err) {
        console.log(err);
    }
}

mongoose.connect(
    config.databaseURL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    async () => {
        console.log('Opened connection with DB');
        await mongoose.connection.dropCollection('airports');
        await populateAirportsCollection(airportsData as Array<AirportRaw>);
        await mongoose.connection.close();
        console.log('Closed connection with DB');
    }
)




