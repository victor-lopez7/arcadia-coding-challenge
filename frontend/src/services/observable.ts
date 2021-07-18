
export type ChangeEvent<T> = {
    [P in keyof T]?: T[P] extends Function ? never : T[P] 
}
export type Callback<T> = (event: ChangeEvent<T>) => void;
export type CallbackOperation<T> = (callback: Callback<T>) => void;

export default class Observable<T> {
    private _observers: Callback<T>[]  = [];

    subscribe(callback: Callback<T>): CallbackOperation<T>{
        this._observers.push(callback);
        return this.unsubscribe.bind(this, callback)
    }

    notifyAll(event: ChangeEvent<T>){
        this._observers.forEach( callback => {
            callback( event );
        });
    }

    unsubscribe(callback: Callback<T>){
        this._observers = this._observers.filter(obs => obs !== callback);
    }
}