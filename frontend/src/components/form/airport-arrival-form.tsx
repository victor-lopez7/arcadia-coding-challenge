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

export default class AirportArrivalForm extends React.Component<AirportArrivalFormProps, AirportArrivalFormState> {

    // Observable to be able to observe for field changes without 
    // coupling or using global variables
    private _fieldChangeObservable: Observable<AirportArrivalFormState>;
    // unsubscribe from the observable function returned from subscribe method
    private _unsubscribeFieldChanges;

    constructor(props: AirportArrivalFormProps){
        super(props);
        this.state = {
            arrivalAirport: undefined,
            beginDate: undefined,
            endDate: undefined,
        }
        // we create the observable and subscribe to it (getting the unsubscribe)
        this._fieldChangeObservable = new Observable();
        this._unsubscribeFieldChanges =
            this._fieldChangeObservable.subscribe(event => this._onChange(event));
        // we subsribe with onChange to performing updates
    }

    // avoid memory leaks by ubsubscribing when unmounting component
    componentWillUnmount(){
        this._unsubscribeFieldChanges();
    }

    // update state when an observable notifies a field change
    _onChange(event: ChangeEvent<AirportArrivalFormState>){
        this.setState(event.target);
    }

    _onSubmit(event: FormEvent<HTMLFormElement>){
        // prevent form submit 
        event.preventDefault();
        // get state
        const { arrivalAirport, beginDate, endDate } = this.state; 
        //  if any field is undefined we return and we cant submit
        if( !this.canSubmit() )
            return;
        // if we can submit a service call is made 
        // to change the arrivals displayed by the app
        // to match the form submission
        this.props.airportArrivalService.changeArrivals(
            (arrivalAirport as Airport).id , 
            beginDate as Date, 
            endDate as Date,
        );
    }
    
    canSubmit(){
        const { arrivalAirport, beginDate, endDate } = this.state; 
        // we can submit if all fields are given (!! casts to boolean)
        return !!(arrivalAirport && beginDate && endDate);
    }

    render(){
        return (
            <form className="AirportArrivalForm" onSubmit={ event => this._onSubmit(event) }>
                {/* We provide the observable to the fields so they can notify the form for changes */}
                <AirportSearch changeObservable={ this._fieldChangeObservable } />
                <DateRangeInput changeObservable={ this._fieldChangeObservable } />
                {/* The button is disabled if we cant submit */}
                <button className="btn btn-primary" disabled={ !this.canSubmit() } >
                    Submit
                </button>
            </form>
        )
    }
}