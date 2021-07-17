import dotenv from 'dotenv';

dotenv.config();

export default {
    static: 'dist/frontend',
    baseAPI: '/api',
    airports: '/airports',
    databaseURL: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pmr6o.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    openSkyAPIArrivalsURL: ({airportCode, begin, end}: {[key: string]: any}) => {
        return `https://${process.env.OPENSKY_API_USER}:${process.env.OPENSKY_API_PASSWORD}@opensky-network.org/api/flights/arrival?airport=${airportCode}&begin=${begin}&end=${end}`
    }
}