import Airport from "../../frontend/src/models/airport";
import mongoose from "mongoose";

const airportSchema = new mongoose.Schema<Airport>({
    id: String,
    name: String,
    countryCode: String,
    municipality: String,
    latitude: Number, 
    longitude: Number,
});

const AirportModel = mongoose.model<Airport>('Airport', airportSchema);
export default AirportModel;