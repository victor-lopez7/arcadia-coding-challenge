// model for the raw data coming from the OpenSky API
export default interface AirportArrivalRaw {
    icao24:	string,
    firstSeen: number,
    estDepartureAirport: string | null,
    lastSeen: number,
    estArrivalAirport: string | null,
    callsign: string | null,
    estDepartureAirportHorizDistance: number | null,
    estDepartureAirportVertDistance: number | null,
    estArrivalAirportHorizDistance: number,
    estArrivalAirportVertDistance: number,
    departureAirportCandidatesCount: number,
    arrivalAirportCandidatesCount: number,
}