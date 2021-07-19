// Classic functional Observable implementation

export type ChangeEvent<T> = {
    target: T,
}
export type Callback<T> = (event: ChangeEvent<T>) => void;

export default class Observable<T> {
    private _observers: Callback<T>[]  = [];

    subscribe(callback: Callback<T>){
        this._observers.push(callback);
        return () => this.unsubscribe(callback);
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