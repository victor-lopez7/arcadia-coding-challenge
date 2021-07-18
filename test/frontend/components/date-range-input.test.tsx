import { render } from "@testing-library/react"
import { act } from "react-dom/test-utils";
import DateRangeInput from "../../../frontend/src/components/form/date-range-input"

async function changeInputValue(input: HTMLInputElement, value: string){
    await act(async () => {
        input.value = value;
        input.dispatchEvent(new Event('input', {bubbles: true}));
    })
}

async function keyDownOnInput(input: HTMLInputElement, key: string){
    await act(async () => {
        input.dispatchEvent(new KeyboardEvent('keydown', {
            'key': 'ArrowDown',
            bubbles: true
        }));
    })
}

const   baseBeginDate = '2020-06-12',
        baseBeginDateRange = '2020-06-19',
        endDateOutOfRangeBaseBegin = '2020-06-20';

describe('DateRangeInput', () => {
    let beginDateInput: HTMLInputElement,
        endDateInput: HTMLInputElement;

    const observableMock: any = { notifyAll: jest.fn() };
    
    beforeEach(async () => {
        await act(async () => {
            render(<DateRangeInput changeObservable={observableMock} />);
        })

        const inputs: NodeListOf<HTMLInputElement> = 
            document.querySelectorAll<HTMLInputElement>('input[type="date"]');

        [beginDateInput, endDateInput] = inputs;
    })

    test('beginDate input changes endDate input min and max date', async () => {
        
        await changeInputValue(beginDateInput, baseBeginDate);
        
        expect(endDateInput.min).toEqual(baseBeginDate);
        expect(endDateInput.max).toEqual(baseBeginDateRange);
        expect(observableMock.notifyAll).toBeCalled();

    });

    test('begin date out of end date range, changes end date to max range value', async () => {
        await changeInputValue(endDateInput, endDateOutOfRangeBaseBegin);
        await changeInputValue(beginDateInput, baseBeginDate);
        
        expect(endDateInput.max).toEqual(endDateInput.value);
        expect(endDateInput.max).toEqual(baseBeginDateRange);

    });
    
    test('begin date in end date range, only changes end date input max value', async () => {
        
        await changeInputValue(endDateInput, baseBeginDateRange);
        await changeInputValue(beginDateInput, baseBeginDate);
        
        expect(endDateInput.value).toEqual(baseBeginDateRange);
        expect(endDateInput.max).toEqual(baseBeginDateRange);

    });
    
    test('arrow down does not change any input value', async () => {
        
        await changeInputValue(beginDateInput, baseBeginDate);
        await changeInputValue(endDateInput, baseBeginDateRange);

        await keyDownOnInput(beginDateInput, 'ArrowDown');
        await keyDownOnInput(endDateInput, 'ArrowDown');
        
        expect(beginDateInput.value).toEqual(baseBeginDate);
        expect(endDateInput.value).toEqual(baseBeginDateRange);

    });
})

describe('DateRangeInput without observable', () => {
    let beginDateInput: HTMLInputElement,
        endDateInput: HTMLInputElement;

    beforeEach(async () => {
        await act(async () => {
            render(<DateRangeInput />);
        })

        const inputs: NodeListOf<HTMLInputElement> = 
            document.querySelectorAll<HTMLInputElement>('input[type="date"]');

        [beginDateInput, endDateInput] = inputs;
    })

    test('beginDate input changes endDate input min and max date', async () => {
        
        await changeInputValue(beginDateInput, baseBeginDate);
        
        expect(endDateInput.min).toEqual(baseBeginDate);
        expect(endDateInput.max).toEqual(baseBeginDateRange);

    })
})