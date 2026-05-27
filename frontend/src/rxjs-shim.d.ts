declare module 'rxjs' {
  export interface Subscription {
    unsubscribe(): void;
  }

  export interface Observer<T> {
    next(value: T): void;
    error(err: unknown): void;
    complete(): void;
  }

  export type PartialObserver<T> = Partial<Observer<T>>;

  export interface Observable<T> {
    subscribe(observer?: PartialObserver<T> | ((value: T) => void)): Subscription;
    pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
    pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
  }

  export type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;
  export type MonoTypeOperatorFunction<T> = OperatorFunction<T, T>;

  export function tap<T>(next: (value: T) => void): MonoTypeOperatorFunction<T>;
}
