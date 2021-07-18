import React, { FormEvent, } from "react";
import Airport from "../../models/airport";
import AirportService from "../../services/airport-service";
import Observable from "../../services/observable";
import '../../styles/airport-search.css'

type AirportSearchProps = {
    changeObservable?: Observable<{arrivalAirport?: Airport}>
};

export type AirportSearchState = { 
    airportSearchResults: Airport[],
    arrivalAirport?: Airport,
    inputText: string,
    activeIdx: number,
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
            activeIdx: -1,
        }
    }

    componentDidMount(){
        document.addEventListener( 'click', () => this.resetSearchResults() );
    }

    componentWillUnmount(){
        document.removeEventListener( 'click', this._unfocusEventListener );
    }

    _handleSearchInput(event: FormEvent<HTMLInputElement>){
        const searchParam = event.currentTarget.value;

        this.setState({inputText: searchParam});
        this.changeSelectedAirport(undefined);
        
        this.search(searchParam);
    }

    _handleResultClick(selectedAirport: Airport){
        this.setState({inputText: selectedAirport.id})
        this.changeSelectedAirport(selectedAirport);
    }

    resetSearchResults(){
        this.setState({ airportSearchResults: [] })
    }

    changeSelectedAirport(arrivalAirport?: Airport){
        this.setState({ arrivalAirport });
        this.props.changeObservable?.notifyAll({target: { arrivalAirport }});
    }

    search(searchParam: string){
        AirportService.searchAirports(searchParam).then(
            airportSearchResults => {
                this.setState({airportSearchResults})
            }
        )
    }

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
                        value={ this.state.arrivalAirport?.id || this.state.inputText }
                        onInput={ event => this._handleSearchInput(event) }
                        onFocus={ e => this.search(this.state.inputText) }
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