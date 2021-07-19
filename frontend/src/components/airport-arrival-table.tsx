import React from "react";
import { DataGrid } from '@material-ui/data-grid';
import { AirportArrivalService, AirportArrivalServiceStatus, AirportArrivalSeviceState } from "../services/airport-arrival-service";
import AirportArrival from "../models/airport-arrival";
import { ChangeEvent } from "../services/observable";

import '../styles/airport-arrival-table.css';

type AirportArrivalTableProps = { airportArrivalService: AirportArrivalService }
type AirportArrivalTableState = { 
    arrivals: AirportArrival[],
    status: AirportArrivalServiceStatus,
}

const bigWidth = 250, rowsShown = 7, shortWidth = 150;

//  format date in a visually apealing format
const formatDateCell = (params: any) => {
    const [date, timeRaw] = params.value.toISOString().split('T');
    const [time] = timeRaw.split('.');
    return `${date} ${time}`
}

// Column defintion
const columns = [
  { field: 'arrivalAirport', headerName: 'Arrival Airport', width: shortWidth },
  { 
    field: 'beginDate', 
    headerName: 'Begin Date', 
    type: 'date', 
    valueFormatter: formatDateCell,
    width: bigWidth, 
  },
  { 
    field: 'endDate', 
    headerName: 'End Date', 
    type: 'date', 
    valueFormatter: formatDateCell,
    width: bigWidth,
  },
  { field: 'departureAirport', headerName: 'Departure Airport', width: shortWidth },
  {
    field: 'departureAirportDistance',
    headerName: 'Departure Airport Distance',
    type: 'number', 
    width: bigWidth
  },
  { field: 'callsign', headerName: 'Callsign', width: shortWidth },
];

export default class AirportArrivalTable extends React.Component<AirportArrivalTableProps, AirportArrivalTableState> {

    private _unsubscribeService;

    constructor(props: AirportArrivalTableProps){
        super(props);
        
        // subscribe to service to listen for changes in the current arrivals displayed
        this._unsubscribeService = 
            this.props.airportArrivalService.subscribe( this.serviceUpdate.bind(this) );

        this.state = {
            arrivals: [],
            status: AirportArrivalServiceStatus.COMPLETED,
        }
    }

    // avoid memory leaks unsubscribing from observable
    componentWillUnmount(){
        this._unsubscribeService();
    }

    // update made from the service (subscription callback)
    serviceUpdate(event: ChangeEvent<AirportArrivalSeviceState>){
        const { currentArrivals, status } = event.target;
        this.setState({ arrivals: currentArrivals ||  [], status })
    }

    //  parse data to populate correctly the table (provide ID)
    get arrivalsData(){
        return this.state.arrivals.map((arrival, i) => {
            return {
                ...arrival,
                id: i,
                beginDate: new Date(arrival.beginDate * 1000),
                endDate: new Date(arrival.endDate * 1000),
            }
        })
    }

    renderSpinner(){
        return (
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        )
    }

    renderTable(){
        return <DataGrid rows={this.arrivalsData} columns={columns} pageSize={rowsShown} />
    }

    renderError(){
        return (
            <div className="alert alert-danger" role="alert">
                The requested data could not be fetched or timed out!
            </div>
        )
    }

    // conditionally render depending on the arrival airport service
    renderContent(){
        switch(this.state.status){
            case AirportArrivalServiceStatus.LOADING:
                return this.renderSpinner();
            case AirportArrivalServiceStatus.ERROR:
                return this.renderError();
            case AirportArrivalServiceStatus.COMPLETED:
                return this.renderTable();
        }
    }
    
    render(){
        return (
            <div className="AirportArrivalTable">
                { this.renderContent() }
            </div>
        )
    }
}