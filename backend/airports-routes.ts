import axios from "axios";
import { Router } from "express";
import RawDataParser from "../data/raw-data-parser";
import config from "./config";
import AirportModel from "./models/airport.model";
import AirportArrivalModel from './models/airport-arrival.model';

const airportsRoutes = Router();

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

const API_CALL_TIMEOUT = 1 * 60 * 1000;
  
airportsRoutes.route('/').get(async (req, res) => {
    const { limit, search } = req.query;
    
    let queryLimit = parseFloat(limit as string);
    const searchedString: any = search || "";
    
    if( limit !== undefined && isNaN(queryLimit) ){

        res.status(HTTP_STATUS.BAD_REQUEST).send(ERRORS.BAD_LIMIT_PARAM);

    } else {

        const limit =  Math.min(queryLimit, AIRPORT_MAX_LIMIT) 
                    || AIRPORT_BASE_LIMIT;
        
        try {
            const searchedRegex = new RegExp(searchedString, "i");
            const airports = await AirportModel
                .find({$or: [
                    { name: { $regex: searchedRegex } },
                    { municipality: { $regex: searchedRegex } },
                    { id: { $regex: searchedRegex } },
                ]} as any)
                .limit(limit);

            res.send(airports);

        } catch {

            res.sendStatus(HTTP_STATUS.NOT_FOUND);
            
        }
    }
});

airportsRoutes.route('/:id').get(async (req, res) => {
    try {
        const airport = await AirportModel
            .findOne({id: req.params.id.toUpperCase()});

        if( !airport ) throw new Error();

        res.send(airport);
    }
    catch {
        res.sendStatus(HTTP_STATUS.NOT_FOUND);
    }
});

airportsRoutes.route('/:id/arrivals').get(async (req, res) => {
    const { begin, end } = req.query;
    const arrivalAirportCode = req.params.id.toUpperCase();

    const [beginDate, endDate] = ([begin, end] as Array<string>).map(parseFloat);

    if( !(beginDate > 0 && endDate > 0) ){

        res.status(HTTP_STATUS.BAD_REQUEST).send(ERRORS.BEGIN_AND_END_REQUIRED);

    } else if(beginDate > endDate) {

        res.status(HTTP_STATUS.BAD_REQUEST).send(ERRORS.BEGIN_GREATER_THAN_END);

    } else {
        
        try{
            let airportArrivals: any = 
                await AirportArrivalModel
                    .find({ arrivalAirport: arrivalAirportCode,})
                    .where('endDate').gt(beginDate).lt(endDate)
            
            if( !airportArrivals.length ){
                const apiURL = config.openSkyAPIArrivalsURL({airportCode: arrivalAirportCode, begin, end});
                const airportArrivalsResponse = 
                    await axios.get(apiURL, {timeout: API_CALL_TIMEOUT});
                
                airportArrivals = 
                    airportArrivalsResponse.data.map((arrival:any) => RawDataParser.parseAirportArrival(arrival, arrivalAirportCode));
                AirportArrivalModel.create(airportArrivals);                

            }
            
            res.send(airportArrivals);

        } catch( err ) {
            console.error(err);
            res.sendStatus(HTTP_STATUS.NOT_FOUND);
        }

    }
})

export { AIRPORT_BASE_LIMIT, AIRPORT_MAX_LIMIT }

export default airportsRoutes;