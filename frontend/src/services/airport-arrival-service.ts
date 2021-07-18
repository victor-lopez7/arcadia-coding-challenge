import { AIRPORTS_API_BASE } from "../config/client-config";
import AirportArrival from "../models/airport-arrival";
import Observable, { Callback } from "./observable";

export enum AirportArrivalServiceStatus {
    LOADING,
    ERROR,
    COMPLETED,
}

export type AirportArrivalSeviceState = {
    currentArrivals?: AirportArrival[],
    status: AirportArrivalServiceStatus,
}

export class AirportArrivalService {
    // singleton
    private static _instance: AirportArrivalService;

    static createInstance(){
        return this._instance
            ? this._instance
            : new AirportArrivalService();
    }

    private _currentAirportArrrivals: AirportArrival[];
    private _currentAirportArrrivalsObservable: Observable<AirportArrivalSeviceState>;

    private constructor(){
        this._currentAirportArrrivalsObservable = new Observable();
        this._currentAirportArrrivals = [];
    }

    subscribe(callback: Callback<AirportArrivalSeviceState>){
        return this._currentAirportArrrivalsObservable.subscribe( callback );
    }

    async changeArrivals(id: string, beginDate: Date, endDate: Date){
        const [begin, end] = [beginDate, endDate].map(date => Math.floor(date.getTime() / 1000));
        
        this._currentAirportArrrivalsObservable.notifyAll({
            target: { status: AirportArrivalServiceStatus.LOADING, }
        });

        let arrivalsResponse;

        try {
            arrivalsResponse =
                await fetch(`${AIRPORTS_API_BASE}${id}/arrivals?begin=${begin}&end=${end}`);
            
            this._currentAirportArrrivals = await arrivalsResponse.json();

            this._currentAirportArrrivalsObservable.notifyAll({
                target: {
                    currentArrivals: this._currentAirportArrrivals,
                    status: AirportArrivalServiceStatus.COMPLETED
                },
            });
        }
        catch {
            this._currentAirportArrrivalsObservable.notifyAll({
                target: { status: AirportArrivalServiceStatus.ERROR, }
            })
        }
            
        
    }
}

const airportArrivalService = AirportArrivalService.createInstance();
export default airportArrivalService;