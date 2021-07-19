import React, { FormEvent, } from "react";
import Airport from "../../models/airport";
import AirportService from "../../services/airport-service";
import Observable from "../../services/observable";
import '../../styles/airport-search.css'

type AirportSearchProps = {
    changeObservable?: Observable<{arrivalAirport?: Airport}>
};
// we mantain two kinds of text in the input
// when an airport is selected
// the text inputted by the user
export type AirportSearchState = { 
    airportSearchResults: Airport[],
    arrivalAirport?: Airport,
    inputText: string,
};

const AIRPORT_SEARCH_TEXT = {
    searchPlaceholder: 'Search by ICAO, airport name or municipality'
}

export default class AirportSearch extends React.Component<AirportSearchProps, AirportSearchState> {

    private _unfocusEventListener!: EventListener;
    
    constructor(props: AirportSearchProps){
        super(props);
        this.state = {
            airportSearchResults: [],
            arrivalAirport: undefined,
            inputText: '',
        }
    }

    // if the click event arrives at the root we hide the results
    componentDidMount(){
        document.addEventListener( 'click', () => this.resetSearchResults() );
    }

    // we avoid memory leaks
    componentWillUnmount(){
        document.removeEventListener( 'click', this._unfocusEventListener );
    }

    // if we start to input the inputText state field is changed and
    // if an airport was selected previously, this selection is resetted
    _handleSearchInput(event: FormEvent<HTMLInputElement>){
        const searchParam = event.currentTarget.value;

        this.setState({inputText: searchParam});
        this.changeSelectedAirport(undefined);
        
        this.search(searchParam);
    }

    _handleResultClick(selectedAirport: Airport){
        // if we click a result an airport is selected
        this.setState({inputText: selectedAirport.id})
        this.changeSelectedAirport(selectedAirport);
    }

    // resert the search results
    resetSearchResults(){
        this.setState({ airportSearchResults: [] })
    }
    
    // encapsulate state change on airort and observable notification
    changeSelectedAirport(arrivalAirport?: Airport){
        this.setState({ arrivalAirport });
        // notify observer of arrivalAiport
        this.props.changeObservable?.notifyAll({target: { arrivalAirport }});
    }

    // we make the search and update the state when promise is resolved
    search(searchParam: string){
        AirportService.searchAirports(searchParam).then(
            airportSearchResults => {
                this.setState({airportSearchResults})
            }
        )
    }

    //  render search results
    renderAirportResult(airport: Airport) {
        const isActiveClass = airport.id === this.state.arrivalAirport?.id
            ?  'active'
            : ''
        ;
        
        return (
            <li className={`list-group-item list-group-item-action ${isActiveClass}`}
                onClick={() => this._handleResultClick(airport)}
                key={airport.id}
            >
                [{ airport.id }] { airport.name } ({ airport.municipality })
            </li>
        )
    }

    render(){
        return (
            <div className="AirportSearch">
                <div>
                    <label htmlFor="arrivalAirportCode" className="form-label">Arrival airport (ICAO)</label>
                    <input type="text" className="form-control" name="arrivalAirportCode"
                        // if there is any airport is selected we display its code 
                        // if there is no airport selected we displayed the text inputted by the user
                        value={ this.state.arrivalAirport?.id || this.state.inputText }
                        onInput={ event => this._handleSearchInput(event) }
                        onFocus={ () => this.search(this.state.inputText) }
                        // we stop the propagation if there is a click in the comp
                        // so the event does not bubble up to the root and the 
                        onClick={ e => e.stopPropagation() }
                        placeholder={ AIRPORT_SEARCH_TEXT.searchPlaceholder }
                    />
                </div>
                <ul className="list-group">
                    { this.state.airportSearchResults.map(airport =>  this.renderAirportResult(airport)) }
                </ul>
            </div>
        )
    }
}