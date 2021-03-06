// Model for airport arrivals in the app
export default interface AirportArrival {
    arrivalAirport: string,
    beginDate: number,
    endDate: number,
    departureAirport: string | null,
    departureAirportDistance: number | null,
    callsign: string | null,
}