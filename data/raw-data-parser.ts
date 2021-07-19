import Airport from "../frontend/src/models/airport";
import AirportArrival from "../frontend/src/models/airport-arrival";
import AirportArrivalRaw from "./raw-data-models/airport-arrival-raw";
import AirportRaw from "./raw-data-models/airport-raw";

// Class for parsing from raw data models to app models,
// decouples the parsing from base models

export default class RawDataParser {
    static parseAirport(airportRaw: AirportRaw): Airport{
        const {
            iso_country: countryCode, 
            municipality, 
            name, 
            coordinates, 
            ident: id
        } = airportRaw;

        const [longitude, latitude] = coordinates.split(',').map(parseFloat)
        
        return {
            municipality,
            name,
            countryCode,
            id,
            latitude,
            longitude
        }
    }

    static parseAirportArrival(airportArrivalRaw: AirportArrivalRaw, arrivalAirportCode: string): AirportArrival{

        const {
            firstSeen: beginDate,
            estDepartureAirport: departureAirport,
            lastSeen: endDate,
            callsign,
            estDepartureAirportHorizDistance,
            estDepartureAirportVertDistance,
        } = airportArrivalRaw;

        //  we calculate departure airport distance as a basic euclidean space distance
        // it is not the distance from arrival airport to departure airport
        // because the distances provided by the API are not the distances from one airport to another
        // they are distances from the airborne to the last radar that detected the airborne in the
        // opensky network (but there is no more distance info in the API), both in arrival or departure
        // we could use the other data to calculate this
        const departureAirportDistance =
            estDepartureAirportHorizDistance && estDepartureAirportVertDistance
            ? Math.sqrt(estDepartureAirportHorizDistance ** 2 + estDepartureAirportVertDistance ** 2)
            : null;

        return {
            arrivalAirport: arrivalAirportCode,
            beginDate,
            endDate,
            departureAirport,
            departureAirportDistance,
            callsign,
        }
    }
}