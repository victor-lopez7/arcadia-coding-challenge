import React from "react";

import AirportSearch from "./airport-search";
import DateRangeInput from "./date-range-input";
import '../../styles/airport-arrival-form.css';

export default class AirportArrivalForm extends React.Component {
    render(){
        return (
            <form className="AirportArrivalForm" onSubmit={ e =>  e.preventDefault() }>
                <AirportSearch />
                <DateRangeInput />
                <button className="btn btn-primary">
                    Submit
                </button>
            </form>
        )
    }
}