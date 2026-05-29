import { Injectable, inject } from '@angular/core';
import { TrainerStore } from './trainer.store';
import { Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { BattleRecord } from '../models/trainer.model';

/**
 * Derived observables from the TrainerStore.
 */
@Injectable({
  providedIn: 'root'
})
export class TrainerSelectors {
  private readonly trainerStore = inject(TrainerStore);

  // Expose the state as an observable from the BaseStore
  private get state$() {
    return this.trainerStore.stateObservable$;
  }

  /**
   * Calculates the win/loss ratio for the current trainer.
   */
  public readonly winLossRatio$: Observable<{ wins: number; losses: number; total: number; winRate: number }> = 
    this.state$.pipe(
      map(state => state.battles),
      distinctUntilChanged((prev, curr) => prev.length === curr.length),
      map((battles: BattleRecord[]) => {
        const wins = battles.filter(b => b.result === 'win').length;
        const losses = battles.filter(b => b.result === 'loss').length;
        const total = wins + losses;
        const winRate = total > 0 ? (wins / total) * 100 : 0;
        
        return { wins, losses, total, winRate };
      }),
      shareReplay(1)
    );

  /**
   * Tracks the total number of teams the trainer has created.
   */
  public readonly totalTeams$: Observable<number> = 
    this.state$.pipe(
      map(state => state.teams.length),
      distinctUntilChanged(),
      shareReplay(1)
    );
}
