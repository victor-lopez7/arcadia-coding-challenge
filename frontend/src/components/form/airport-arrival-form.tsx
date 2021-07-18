import React, { FormEvent } from "react";

import AirportSearch from "./airport-search";
import DateRangeInput from "./date-range-input";
import '../../styles/airport-arrival-form.css';
import { AirportArrivalService } from "../../services/airport-arrival-service";
import Observable, { ChangeEvent } from "../../services/observable";
import Airport from "../../models/airport";

type AirportArrivalFormProps = { airportArrivalService: AirportArrivalService };
type AirportArrivalFormState = { 
    arrivalAirport?: Airport, 
    beginDate?: Date, 
    endDate?: Date 
};

type AirportArrivalFormFields = {
    [T in keyof AirportArrivalFormState]?: AirportArrivalFormState[T]
}

export default class AirportArrivalForm extends React.Component<AirportArrivalFormProps, AirportArrivalFormState> {

    private _fieldChangeObservable: Observable<AirportArrivalFormFields>;
    private _unsubscribeFieldChanges;

    constructor(props: AirportArrivalFormProps){
        super(props);
        this.state = {
            arrivalAirport: undefined,
            beginDate: undefined,
            endDate: undefined,
        }

        this._fieldChangeObservable = new Observable();
        this._unsubscribeFieldChanges =
            this._fieldChangeObservable.subscribe(event => this._onChange(event));
    }

    componentWillUnmount(){
        this._unsubscribeFieldChanges();
    }

    _onChange(event: ChangeEvent<AirportArrivalFormFields>){
        this.setState(event.target);
    }

    _onSubmit(event: FormEvent<HTMLFormElement>){
        event.preventDefault();

        const { arrivalAirport, beginDate, endDate } = this.state; 

        if( !this.canSubmit() )
            return;
        
        this.props.airportArrivalService.changeArrivals(
            (arrivalAirport as Airport).id , 
            beginDate as Date, 
            endDate as Date,
        );
    }

    canSubmit(){
        const { arrivalAirport, beginDate, endDate } = this.state; 
        return !!(arrivalAirport && beginDate && endDate);
    }

    render(){
        return (
            <form className="AirportArrivalForm" onSubmit={ event => this._onSubmit(event) }>
                <AirportSearch changeObservable={ this._fieldChangeObservable } />
                <DateRangeInput changeObservable={ this._fieldChangeObservable } />
                
                <button className="btn btn-primary" disabled={ !this.canSubmit() } >
                    Submit
                </button>
            </form>
        )
    }
}