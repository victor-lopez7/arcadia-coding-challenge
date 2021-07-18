import React, { DetailedHTMLProps, FormEvent, InputHTMLAttributes } from "react";
import Observable from "../../services/observable";

import '../../styles/date-range-input.css';

type DateRangeInputProps = { changeObservable?: Observable<DateRangeInputState> }
type DateRangeInputState = { beginDate?: Date, endDate?: Date }

const MAX_DAYS_RANGE = 7;

type DateInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {label?: String};

function DateInput(props: DateInputProps) {
    
    return (
        <div className="date-input-wrapper">
            <label htmlFor={ props.name } className="form-label">{ props.label }</label>
            <input type="date" name={ props.name } className="form-control" 
                value={ props.value }
                onInput={ props.onInput }
                onKeyDown={ props.onKeyDown }
                min={ props.min }
                max={ props.max }
            />
        </div>
    )
}

export default class DateRangeInput extends React.Component<DateRangeInputProps, DateRangeInputState> {
    
    constructor(props: DateRangeInputProps){
        super(props);
        this.state = {
            beginDate: undefined,
            endDate: undefined,
        }
    }

    static formatDateAsDateInputString(date?: Date): string | undefined{
        if(date){
            const [ dateString ] = date.toJSON().split('T');
            return dateString;
        }
    }

    static addDaysToDate(date: Date, numDays: number){
        const newDate = new Date( date.toString() );
        newDate.setDate(date.getDate() + numDays);
        return newDate;
    }

    static minDate(date1: Date, date2: Date){
        return new Date( Math.min( date1.getTime(), date2.getTime() ) )
    }

    private changeState(newState: any){
        this.props.changeObservable?.notifyAll({target: {...this.state , ...newState}});
        this.setState(newState);
    }

    private _handleEndDateChange(event: FormEvent<HTMLInputElement>) {
        const { value } = event.currentTarget
        this.changeState({ endDate: new Date( value ) });
    }

    private _handleBeginDateChange(event: FormEvent<HTMLInputElement>){
        const { value } = event.currentTarget;
        const beginDate = new Date( value );

        if(this.firstDateInRange && this.state.endDate){
            const greaterThanEndDate =  beginDate.getTime() > this.state.endDate.getTime();
            const lowerThanSevenDaysBeforeEnd = beginDate.getTime() < this.firstDateInRange.getTime();
            
            if(greaterThanEndDate || lowerThanSevenDaysBeforeEnd){
                const sevenDaysAfterBeginDate = DateRangeInput.addDaysToDate(beginDate, MAX_DAYS_RANGE);
                const endDate = DateRangeInput.minDate( sevenDaysAfterBeginDate, this.today );
                this.changeState({ beginDate, endDate });
            } else {
                this.changeState({ beginDate });
            }

        } else {

            this.changeState({ beginDate });
            
        }
    }

    get beginDateString(){
        return DateRangeInput.formatDateAsDateInputString(this.state.beginDate);
    }
    
    get endDateString(){
        return DateRangeInput.formatDateAsDateInputString(this.state.endDate);
    }

    get endDateMax(){
        if(this.state.beginDate){
            const lastDayInRange = DateRangeInput.addDaysToDate(this.state.beginDate, + MAX_DAYS_RANGE);
            return DateRangeInput.minDate(lastDayInRange, this.today) ;
        }
        return this.today;
    }
    
    get firstDateInRange(){
        if(this.state.endDate){
            return DateRangeInput.addDaysToDate(this.state.endDate, - MAX_DAYS_RANGE);
        }
    }

    get today(){
        return new Date();
    }


    render(){
        return(
            <div className="DateRangeInput">

                <DateInput
                    label="Begin date"
                    name="beginDate"
                    value={ this.beginDateString }
                    onInput={ this._handleBeginDateChange.bind(this) }
                    onKeyDown={ e => e.preventDefault() }
                    max={ DateRangeInput.formatDateAsDateInputString(this.today) }
                />
                
                <DateInput
                    label="End date"
                    name="endDate"
                    value={ this.endDateString }
                    onInput={ event => this._handleEndDateChange(event) }
                    onKeyDown={ e => e.preventDefault() }
                    min={ this.beginDateString }
                    max={ DateRangeInput.formatDateAsDateInputString(this.endDateMax) }
                />

            </div>
        ) 
    }
    
}