import axios from "axios";
import { Router } from "express";
import RawDataParser from "../data/raw-data-parser";
import config from "./config";
import AirportModel from "./models/airport.model";
import AirportArrivalModel from './models/airport-arrival.model';

const airportsRoutes = Router();

// Limits for airport search api (not specified and maximum number of results)
const AIRPORT_BASE_LIMIT = 10,
      AIRPORT_MAX_LIMIT = 100;

const ERRORS = {
    BAD_LIMIT_PARAM: 'Limit should be a number',
    BEGIN_AND_END_REQUIRED: 'Both begin and end dates should be provided and positive numbers',
    BEGIN_GREATER_THAN_END: 'Begin date should be lower than end date',
}

const HTTP_STATUS = {
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
}

// 1 minute in ms
const API_CALL_TIMEOUT = 1 * 60 * 1000;

// Endpoint for getting the available airports
airportsRoutes.route('/').get(async (req, res) => {
    const { limit, search } = req.query;
    
    let queryLimit = parseFloat(limit as string);
    // if not search param is provided all match (i.e. match the void string)
    const searchedString: any = search || "";
    
    // if a limit query string and is not a valid number (BAD REQUEST)
    if( limit !== undefined && isNaN(queryLimit) ){

        res.status(HTTP_STATUS.BAD_REQUEST).send(ERRORS.BAD_LIMIT_PARAM);

    } else {

        // the limit is the max limit for the api if the provided one is above
        // if not limit provided Math.min(undefined, number) === undefined
        // we use the default one
        const limit =  Math.min(queryLimit, AIRPORT_MAX_LIMIT) 
                    || AIRPORT_BASE_LIMIT;
        
        try {
            const searchedRegex = new RegExp(searchedString, "i");
            
            // We search in the DB airports that match the search
            // We search in name, municipality and id (ICAO code)
            const airports = await AirportModel
                .find({$or: [
                    { name: { $regex: searchedRegex } },
                    { municipality: { $regex: searchedRegex } },
                    { id: { $regex: searchedRegex } },
                ]} as any)
                .limit(limit);  // Results limited by the calculated limit

            //  if no error the query has been completed and we send the result
            res.send(airports);

        } catch {
            // if the db call throws an error we return not found error
            res.sendStatus(HTTP_STATUS.NOT_FOUND);
            
        }
    }
});

// Endpoint for getting an specific airport data
airportsRoutes.route('/:id').get(async (req, res) => {
    try {
        // search the airport by id
        const airport = await AirportModel
            .findOne({id: req.params.id.toUpperCase()});

        // if not airport, not found error
        if( !airport ) throw new Error();

        // the airport has been fethced, we return it
        res.send(airport);
    }
    catch {
        // the error when we cant fetch an airport from the db
        // or the db connection has thrown
        res.sendStatus(HTTP_STATUS.NOT_FOUND);
    }
});

airportsRoutes.route('/:id/arrivals').get(async (req, res) => {
    
    const { begin, end } = req.query;
    // we can provide the airport code both in lower or upper case
    const arrivalAirportCode = req.params.id.toUpperCase();

    // parse date milliseconds to numbers
    const [beginDate, endDate] = ([begin, end] as Array<string>).map(parseFloat);

    if( !(beginDate > 0 && endDate > 0) ){

        // when not begin date or end date or they are negative (BAD REQUEST)
        // this is true because beginDate and endDate are either numbers or NaN
        // parseFloat: (s: string) => number | NaN
        res.status(HTTP_STATUS.BAD_REQUEST).send(ERRORS.BEGIN_AND_END_REQUIRED);

    } else if(beginDate > endDate) {

        // when beginDate is lower than end date (BAD REQUEST)
        res.status(HTTP_STATUS.BAD_REQUEST).send(ERRORS.BEGIN_GREATER_THAN_END);

    } else {
        
        try{
            // Fetch cached api calls
            // [BUG]
            // explanation: we make a call for dates B and E and cache the result in the DB
            // if we make a later call for dates B1 and B2 (B1 < B <= B2)
            // we return only cached results, and they are partially ok but not complete
            // because the results provided are in the range [B, B2] instead of [B1, B2]
            let airportArrivals: any = 
                await AirportArrivalModel
                    .find({ arrivalAirport: arrivalAirportCode,})
                    .where('endDate').gt(beginDate).lt(endDate)
            
            //  if there is no cached response we search for results in the api
            if( !airportArrivals.length ){
                const apiURL = config.openSkyAPIArrivalsURL({airportCode: arrivalAirportCode, begin, end});

                // timeout is provided because the api takes a lot of time on particular calls (opensky API)
                // we prefer to not make the api consumer wait for too long  (in this API)
                // ( maybe use a better error handling, with better error detail )
                const airportArrivalsResponse = 
                    await axios.get(apiURL, {timeout: API_CALL_TIMEOUT}); 
                
                // parse the raw data provided by the API in our models format
                airportArrivals = 
                    airportArrivalsResponse.data.map((arrival:any) => RawDataParser.parseAirportArrival(arrival, arrivalAirportCode));

                // we store the results for new api queries
                // to reduce response time for repeated calls
                AirportArrivalModel.create(airportArrivals);                

            }
            
            res.send(airportArrivals);

        } catch( err ) { // error if the api (opensky) returns an error or there is a timeout 
            
            // we could use this err for providing a better error response
            console.error(err); 
            res.sendStatus(HTTP_STATUS.NOT_FOUND);
        }

    }
})

export { AIRPORT_BASE_LIMIT, AIRPORT_MAX_LIMIT }

export default airportsRoutes;