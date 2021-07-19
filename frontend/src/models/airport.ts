// Model for airports in the app
export default interface Airport {
    id: string,
    name: string,
    countryCode: string,
    municipality: string,
    latitude: number, 
    longitude: number,
}