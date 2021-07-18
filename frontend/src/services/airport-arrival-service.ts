import { AIRPORTS_API_BASE } from "../config/client-config";
import AirportArrival from "../models/airport-arrival";
import Observable, { Callback } from "./observable";

export class AirportArrivalService {
    // singleton
    private static _instance: AirportArrivalService;

    static createInstance(){
        return this._instance
            ? this._instance
            : new AirportArrivalService();
    }

    private _currentAirportArrrivals: AirportArrival[];
    private _currentAirportArrrivalsObservable: Observable<AirportArrival[]>;

    private constructor(){
        this._currentAirportArrrivalsObservable = new Observable<AirportArrival[]>();
        this._currentAirportArrrivals = [];
    }

    subscribe(callback: Callback<AirportArrival[]>){
        return this._currentAirportArrrivalsObservable.subscribe( callback );
    }

    async changeArrivals(id: string, beginDate: Date, endDate: Date){
        const [begin, end] = [beginDate, endDate].map(date => date.getTime() / 1000);
        const arrivalsResponse =
            await fetch(`${AIRPORTS_API_BASE}${id}/arrivals?begin=${begin}&end=${end}`);
        this._currentAirportArrrivals = await arrivalsResponse.json();

        this._currentAirportArrrivalsObservable.notifyAll(this._currentAirportArrrivals);
    }
}

const airportArrivalService = AirportArrivalService.createInstance();
export default airportArrivalService;