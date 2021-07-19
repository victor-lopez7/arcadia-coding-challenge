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

    // State of the service data (arrivals) and observable of this state
    private _currentAirportArrrivals: AirportArrival[];
    private _currentAirportArrrivalsObservable: Observable<AirportArrivalSeviceState>;

    private constructor(){
        this._currentAirportArrrivalsObservable = new Observable();
        this._currentAirportArrrivals = [];
    }
    
    //  delegates subscription as it is a private field
    //  also we avoid another classes to calling notifyAll
    subscribe(callback: Callback<AirportArrivalSeviceState>){
        return this._currentAirportArrrivalsObservable.subscribe( callback );
    }

    // method for requesting an state change (new arrivals data)
    async changeArrivals(id: string, beginDate: Date, endDate: Date){
        const [begin, end] = [beginDate, endDate].map(date => Math.floor(date.getTime() / 1000));
        
        // notify that a state change has been initiated
        this._currentAirportArrrivalsObservable.notifyAll({
            target: { status: AirportArrivalServiceStatus.LOADING, }
        });

        let arrivalsResponse;

        // we try to retrieve data and notify if it has been succesful
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
            // we notify error if it happens to be the case
            this._currentAirportArrrivalsObservable.notifyAll({
                target: { status: AirportArrivalServiceStatus.ERROR, }
            })
        }
            
        
    }
}

const airportArrivalService = AirportArrivalService.createInstance();
export default airportArrivalService;