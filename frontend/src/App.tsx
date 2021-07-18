import React from 'react';
import './App.css';
import AirportArrivalForm from './components/form/airport-arrival-form';

class App extends React.Component {
  render(){
    return (
      <div className="App container">
        <h1>Arcadia coding challenge</h1>
        <AirportArrivalForm />
      </div>
    )
  }
}

export default App;
