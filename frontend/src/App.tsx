import React from 'react';
import './App.css';
import AirportArrivalTable from './components/airport-arrival-table';
import AirportArrivalForm from './components/form/airport-arrival-form';
import airportArrivalService from './services/airport-arrival-service';

// Base app component, puts in place the other components
// and provides the service to the other components
class App extends React.Component {

  private _airportArrivalService;

  constructor(props: {}){
    super(props);
    this._airportArrivalService = airportArrivalService;
  }

  render(){
    return (
      <div className="App container">
        <h1>Arcadia coding challenge</h1>
        <AirportArrivalForm airportArrivalService={airportArrivalService} />
        <AirportArrivalTable airportArrivalService={airportArrivalService} />
      </div>
    )
  }
}

export default App;
