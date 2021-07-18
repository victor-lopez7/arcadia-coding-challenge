import React, { FormEvent, } from "react";
import Airport from "../../models/airport";
import AirportService from "../../services/airport-service";
import '../../styles/airport-search.css'

type AirportProps = {};
type AirportState = { 
    airportSearchResults: Airport[],
    selectedAirport: Airport | undefined,
    inputText: string,
    activeIdx: number,
};

const AIRPORT_SEARCH_TEXT = {
    searchPlaceholder: 'Search by ICAO, airport name or municipality'
}

export default class AirportSearch extends React.Component<AirportProps, AirportState> {

    private _unfocusEventListener!: EventListener;

    constructor(props: AirportProps){
        super(props);
        this.state = {
            airportSearchResults: [],
            selectedAirport: undefined,
            inputText: '',
            activeIdx: -1,
        }
    }

    componentDidMount(){
        this._unfocusEventListener = event => this.resetSearchResults();

        document.addEventListener( 'click', event => this._unfocusEventListener(event) );
    }

    componentWillUnmount(){
        document.removeEventListener( 'click', this._unfocusEventListener );
    }

    _handleSearchInput(event: FormEvent<HTMLInputElement>){
        const searchParam = event.currentTarget.value;

        this.setState({selectedAirport: undefined, inputText: searchParam});
        
        this.search(searchParam);
    }

    _handleResultClick(selectedAirport: Airport){
        this.setState({inputText: selectedAirport.id})
        this.changeSelectedAirport(selectedAirport);
    }

    resetSearchResults(){
        this.setState({airportSearchResults: []})
    }

    changeSelectedAirport(selectedAirport: Airport){
        this.setState({ selectedAirport });
    }

    search(searchParam: string){
        AirportService.searchAirports(searchParam).then(
            airportSearchResults => {
                this.setState({airportSearchResults})
            }
        )
    }

    renderAirportResult(airport: Airport) {
        const isActiveClass = airport.id === this.state.selectedAirport?.id
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
                        value={ this.state.selectedAirport?.id || this.state.inputText }
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