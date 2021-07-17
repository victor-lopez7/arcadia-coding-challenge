import mongoose from "mongoose";
import AirportArrival from "../../frontend/src/models/airport-arrival";

const airportArrivalSchema = new mongoose.Schema<AirportArrival>({
    arrivalAirport: String,
    beginDate: Number,
    endDate: Number,
    departureAirport: {type: String, required: false},
    departureAirportDistance: {Number, required: false},
    callsign: {type: String, required: false},
});

const AirportArrivalModel = mongoose.model<AirportArrival>('AirportArrival', airportArrivalSchema);

export default AirportArrivalModel;