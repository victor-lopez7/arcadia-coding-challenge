import Airport from "../frontend/src/models/airport";
import AirportArrival from "../frontend/src/models/airport-arrival";
import AirportArrivalRaw from "./raw-data-models/airport-arrival-raw";
import AirportRaw from "./raw-data-models/airport-raw";

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