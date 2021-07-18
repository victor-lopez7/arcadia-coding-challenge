import { AIRPORTS_API_BASE } from "../config/client-config";
import Airport from "../models/airport";

export default class AirportService {

    static async searchAirports(searchQuery: string, limit?: number): Promise<Airport[]>{
        const callLimit = limit ? `limit=${limit}` : '';
        const airports = await fetch(`${AIRPORTS_API_BASE}?search=${searchQuery}${callLimit}`)
        return await airports.json();
    }
    
    static async searchAirportByID(id: string): Promise<Airport>{
        const airports = await fetch(`${AIRPORTS_API_BASE}${id}`);
        return await airports.json();
    }
    
}
