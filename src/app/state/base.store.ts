import { BehaviorSubject, Observable } from 'rxjs';
import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

/**
 * Generic BaseStore leveraging RxJS BehaviorSubject for state management.
 * Provides a predictable, immutable state container and exposes data as Angular Signals.
 */
export class BaseStore<T> {
  protected state$: BehaviorSubject<T>;

  constructor(initialState: T) {
    this.state$ = new BehaviorSubject<T>(initialState);
  }

  /**
   * Returns the current state snapshot synchronously.
   */
  protected get state(): T {
    return this.state$.getValue();
  }

  /**
   * Emits new state immutably.
   * @param newState Partial state to merge with current state.
   */
  protected setState(newState: Partial<T>): void {
    this.state$.next({
      ...this.state,
      ...newState,
    });
  }

  /**
   * Returns an Observable of the entire state.
   */
  public getState$(): Observable<T> {
    return this.state$.asObservable();
  }

  /**
   * Returns an Angular Signal of the entire state.
   * Uses requireSync: true since BehaviorSubject always provides an initial value.
   */
  public getStateSignal(): Signal<T> {
    return toSignal(this.state$.asObservable(), { requireSync: true });
  }
}
