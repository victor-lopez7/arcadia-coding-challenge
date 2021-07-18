import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import AirportSearch from "../../../frontend/src/components/form/airport-search";
import Airport from "../../../frontend/src/models/airport";
import AirportService from "../../../frontend/src/services/airport-service";

const airportsMock: Airport[] = [
    {
        countryCode: '',
        id: 'ABC',
        latitude: 10,
        longitude: 10,
        municipality: '',
        name: ''            
    },
    {
        countryCode: '',
        id: 'DEF',
        latitude: 10,
        longitude: 10,
        municipality: '',
        name: ''            
    },
    {
        countryCode: '',
        id: 'GHI',
        latitude: 10,
        longitude: 10,
        municipality: '',
        name: ''            
    },
]

describe('AirportSearch', () => {
    
    const airportSearchImpl = AirportService.searchAirports;

    function focusSearchInput(){
        const searchInput = document.querySelector<HTMLInputElement>('.AirportSearch input');
        searchInput?.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
    }

    beforeAll(() => {
        AirportService.searchAirports = jest.fn().mockReturnValue(new Promise(resolve => {
            resolve(airportsMock);
        }));
    })

    afterAll(() => {
        AirportService.searchAirports = airportSearchImpl;
    })

    beforeEach(() => {
        act(() => {
            render(<AirportSearch />);
        })
    })

    test('renders airport-search', () => {
        const airportSearch = document.querySelector('.AirportSearch');
        expect(airportSearch).toBeInTheDocument();
    });

    test('renders results when focused', async () => {
        await act(async () => focusSearchInput())

        const searchResults = document.querySelectorAll('ul li')
        searchResults.forEach( resultElem => expect(resultElem).toBeInTheDocument() )
    });

    test('renders results when focused', async () => {
        await act(async () => focusSearchInput())

        const searchResults = document.querySelectorAll('ul li')
        searchResults.forEach( resultElem => expect(resultElem).toBeInTheDocument() )
    });

    test('select an element of the displayed list', async () => {
        await act(async () => focusSearchInput());
        await act(async () => document.querySelector<any>('ul li').click())
        await act(async () => focusSearchInput());

        const searchResults = document.querySelectorAll('ul li.active')
        searchResults.forEach( resultElem => expect(resultElem).toBeInTheDocument() )
    });
    
    test('search for an airport', async () => {
        const searchValue = 'test';
        await act(async () => {
            const inputElement = document.querySelector('input');
            if(inputElement){
                inputElement.value = searchValue;
                inputElement.dispatchEvent(new Event('input', { bubbles: true }))
            }
        });

        expect(AirportService.searchAirports).toBeCalledWith(searchValue);
    });

    test('not unfocused after if you click on the input', async () => {
        await act(async () => focusSearchInput());
        await act(async () => {
            document.querySelector('input')?.click();
        })

        const searchResults = document.querySelectorAll('ul li')
        searchResults.forEach( resultElem => expect(resultElem).toBeInTheDocument() )
    });

})