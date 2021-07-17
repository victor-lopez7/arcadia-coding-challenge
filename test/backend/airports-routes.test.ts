import supertest from 'supertest';
import axios from 'axios';

import app from '../../backend/app';
import config from '../../backend/config';
import AirportModel from '../../backend/models/airport.model';
import airportData from '../../data/airport-codes.json';
import AirportRaw from '../../data/raw-data-models/airport-raw';
import RawDataParser from '../../data/raw-data-parser';
import { AIRPORT_BASE_LIMIT, AIRPORT_MAX_LIMIT } from '../../backend/airports-routes';
import AirportArrivalModel from '../../backend/models/airport-arrival.model';

let mockData: any = (airportData as Array<AirportRaw>)
    .slice(0, 120)
    .map(RawDataParser.parseAirport);

const AIRPORTS_BASE_ROUTE = `${config.baseAPI}${config.airports}`;
let mongooseMock: any;

describe(AIRPORTS_BASE_ROUTE, () => {
    
    beforeEach(() => {
        mongooseMock = jest
            .spyOn<any, any>(AirportModel, 'find')
            .mockReturnValue({
                limit: (l: number) => mockData.slice(0, l),
            });
    })

    afterEach(() => {
        jest.clearAllMocks();
    })
    
    test(`GET ${AIRPORTS_BASE_ROUTE}/`, async() => {
        await supertest(app).get(`${AIRPORTS_BASE_ROUTE}/`)
            .expect(200)
            .then((response) => {
                expect(response.body).toBeTruthy();
                expect(response.body.length).toEqual(AIRPORT_BASE_LIMIT);
            });
    });

    test(`GET ${AIRPORTS_BASE_ROUTE} 404`, async() => {
        jest.clearAllMocks();
        mongooseMock = jest
            .spyOn(AirportModel, 'find')
            .mockImplementation(() => {
                throw new Error();
            })

        await supertest(app)
                .get(`${AIRPORTS_BASE_ROUTE}`)
                .expect(404);
    });
    
    test(`GET ${AIRPORTS_BASE_ROUTE}?limit`, async() => {
        const LIMIT = 99;
        await supertest(app).get(`${AIRPORTS_BASE_ROUTE}/?limit=${LIMIT}`)
            .expect(200)
            .then((response) => {
                expect(response.body).toBeTruthy();
                expect(response.body.length).toEqual(LIMIT);
            });
    });
    
    test(`GET ${AIRPORTS_BASE_ROUTE}?limit>AIRPORT_MAX_LIMIT`, async() => {
        const LIMIT = AIRPORT_MAX_LIMIT + 1;
        await supertest(app).get(`${AIRPORTS_BASE_ROUTE}/?limit=${LIMIT}`)
            .expect(200)
            .then((response) => {
                expect(response.body).toBeTruthy();
                expect(response.body.length).toEqual(AIRPORT_MAX_LIMIT);
            });
    });
    
    test(`GET ${AIRPORTS_BASE_ROUTE}?limit 400 BAD LIMIT`, async() => {
        const LIMIT = "sdadsa";
        await supertest(app)
                .get(`${AIRPORTS_BASE_ROUTE}/?limit=${LIMIT}`)
                .expect(400);
    });

})

const AIRPORT_BY_ID_ENDPOINT = AIRPORTS_BASE_ROUTE + '/:id';

describe(AIRPORT_BY_ID_ENDPOINT, () => {
    const mockValue = {
        id: 'KRNO',
        name: '',
        countryCode: '',
        municipality: '',
        latitude: 10, 
        longitude: 10,
    }
    beforeEach(() => {
        jest.spyOn<any, any>(AirportModel, 'findOne')
            .mockImplementation((search: any) => {
                if(search.id === mockValue.id)
                    return mockValue;
            });
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    test(`GET ${AIRPORT_BY_ID_ENDPOINT} 200`,async () => {
         await supertest(app).get(`${AIRPORTS_BASE_ROUTE}/KRNO`)
            .expect(200)
            .then((response) => {
                expect(response.body).toBeTruthy();
                expect(response.body).toEqual(mockValue);
            });
    })
    
    test(`GET ${AIRPORT_BY_ID_ENDPOINT} 200 LOWERCASE`,async () => {
         await supertest(app).get(`${AIRPORTS_BASE_ROUTE}/krno`)
            .expect(200)
            .then((response) => {
                expect(response.body).toBeTruthy();
                expect(response.body).toEqual(mockValue);
            });
    })
    
    test(`GET ${AIRPORT_BY_ID_ENDPOINT} 404`,async () => {
         await supertest(app).get(`${AIRPORTS_BASE_ROUTE}/adas`)
            .expect(404)
    })
    
    test(`GET ${AIRPORT_BY_ID_ENDPOINT} 404`,async () => {

        jest.clearAllMocks()
        jest.spyOn(AirportModel, 'findOne')
            .mockImplementation(() => {
                throw new Error();
            });

        await supertest(app).get(`${AIRPORTS_BASE_ROUTE}/KRNO`)
            .expect(404)
    });
    
});

const ARRIVALS_ENDPOINT = AIRPORT_BY_ID_ENDPOINT + '/arrivals?begin&end';

describe(ARRIVALS_ENDPOINT, () => {
    
    const arrivalAirportMockValue = [{
        arrivalAirport: 'KRNO',
        beginDate: 1000,
        endDate: 2000,
        departureAirport: '',
        departureAirportDistance: 10,
        callsign: '',
    }]
    
    const arrivalAirportRawMockValue = {
        data: [{
            icao24:	'',
            firstSeen: 1000,
            estDepartureAirport: '',
            lastSeen: 2000,
            estArrivalAirport: 'LEMD',
            callsign: '',
            estDepartureAirportHorizDistance: 2,
            estDepartureAirportVertDistance: 2,
            estArrivalAirportHorizDistance: 2,
            estArrivalAirportVertDistance: 2,
            departureAirportCandidatesCount: 1,
            arrivalAirportCandidatesCount: 1,
        }]
    }

    let createMock: any;

    beforeEach(() => {
        jest.spyOn<any, any>(AirportArrivalModel, 'find')
            .mockImplementation((search: any) => {
                return {
                    where: () => ({
                        gt: () => ({
                            lt: () => {
                                const arrivalAirport = arrivalAirportMockValue[0].arrivalAirport;
                                return search.arrivalAirport === arrivalAirport
                                    ? arrivalAirportMockValue
                                    : [];
                            }
                        })
                    })
                };
            });
        
        jest.spyOn<any, any>(axios, 'get')
            .mockImplementation(() => {
                return arrivalAirportRawMockValue;
            });
        
        createMock = jest.spyOn<any, any>(AirportArrivalModel, 'create')
            .mockImplementation(args => args);
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    const buildArrivalsEndpointCall = (id: string, begin: any, end: any) => {
        return `${AIRPORTS_BASE_ROUTE}/${id}/arrivals?begin=${begin}&end=${end}`          
    }
    
    test(`GET ${ARRIVALS_ENDPOINT} 200 DB`, async () => {

        await supertest(app).get(buildArrivalsEndpointCall('KRNO', 1, 2))
            .expect(200)
            .then((response) => {
                expect(response.body).toBeTruthy();
                expect(response.body).toEqual(arrivalAirportMockValue);
            });
    })
    
    const searchedAirportAPI = 'LEMD';

    test(`GET ${ARRIVALS_ENDPOINT} 200 API`, async () => {

        await supertest(app).get(buildArrivalsEndpointCall(searchedAirportAPI, 1, 2))
            .expect(200)
            .then((response) => {
                expect(response.body).toBeTruthy();
                expect(response.body[0].arrivalAirport).toEqual(searchedAirportAPI);
                expect(createMock).toBeCalled();
            });
    })
    
    test(`GET ${ARRIVALS_ENDPOINT} 404`, async () => {
        
        jest.clearAllMocks();
        jest.spyOn(axios, 'get')
            .mockImplementation(() => {
                throw new Error();
            })

        await supertest(app).get(buildArrivalsEndpointCall(searchedAirportAPI, 1, 2))
            .expect(404)
    })
    
    test(`GET ${ARRIVALS_ENDPOINT} 400 BAD BEGIN (NEGATIVE)`, async () => {

        await supertest(app).get(buildArrivalsEndpointCall(searchedAirportAPI, -1, 2))
            .expect(400)
    })
    
    test(`GET ${ARRIVALS_ENDPOINT} 400 BAD BEGIN (STRING)`, async () => {

        await supertest(app).get(buildArrivalsEndpointCall(searchedAirportAPI, 'asnjdas', 2))
            .expect(400)
    })
    
    test(`GET ${ARRIVALS_ENDPOINT} 400 BAD END (NEGATIVE)`, async () => {

        await supertest(app).get(buildArrivalsEndpointCall(searchedAirportAPI, 1, -2))
            .expect(400)
    })
    
    test(`GET ${ARRIVALS_ENDPOINT} 400 BAD END (STRING)`, async () => {

        await supertest(app).get(buildArrivalsEndpointCall(searchedAirportAPI, 1, 'askjda'))
            .expect(400)
    })
    
    test(`GET ${ARRIVALS_ENDPOINT} 400 BAD END (STRING)`, async () => {

        await supertest(app).get(buildArrivalsEndpointCall(searchedAirportAPI, 1, 'askjda'))
            .expect(400)
    })
    
    test(`GET ${ARRIVALS_ENDPOINT} 400 BAD BEGIN > END`, async () => {
        await supertest(app).get(buildArrivalsEndpointCall(searchedAirportAPI, 2, 1))
            .expect(400)
    })

})