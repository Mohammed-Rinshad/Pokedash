import { Injectable, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseStore } from './base.store';
import { TrainerProfile, TrainerTeam, BattleRecord, BattleLogEntry, Trainer } from '../models/trainer.model';
import { Pokemon } from '../models/pokemon.model';
import { TrainerService } from '../core/services/trainer.service';
import { forkJoin, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface TrainerState {
  profile: TrainerProfile | null;
  teams: TrainerTeam[];
  battles: BattleRecord[];
  battleLogs: BattleLogEntry[];
  loading: boolean;
  error: string | null;
  activeTeamId: number | null;
}

const initialState: TrainerState = {
  profile: null,
  teams: [],
  battles: [],
  battleLogs: [],
  loading: false,
  error: null,
  activeTeamId: null
};

/**
 * Store for managing Trainer data via the local mock GraphQL server.
 */
@Injectable({
  providedIn: 'root'
})
export class TrainerStore extends BaseStore<TrainerState> {
  private readonly trainerService = inject(TrainerService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    super(initialState);
    // Initialize default trainer data (Ash Ketchum, id: 1) and start live polling
    this.loadTrainerData(1);
    this.startLiveBattleLogs();
  }

  // --- Selectors (Signals) ---
  private stateSignal = this.getStateSignal();
  
  public get stateObservable$() {
    return this.state$;
  }
  
  public readonly profile = computed(() => this.stateSignal().profile);
  public readonly teams = computed(() => this.stateSignal().teams);
  public readonly battles = computed(() => this.stateSignal().battles);
  public readonly battleLogs = computed(() => this.stateSignal().battleLogs);
  public readonly loading = computed(() => this.stateSignal().loading);
  public readonly error = computed(() => this.stateSignal().error);
  public readonly activeTeamId = computed(() => this.stateSignal().activeTeamId);
  
  // Active Team Selector
  public readonly activeTeam = computed(() => {
    const teams = this.teams();
    const activeId = this.activeTeamId();
    if (activeId) {
      return teams.find(t => t.id === activeId);
    }
    return teams.length > 0 ? teams[0] : undefined;
  });

  // --- Actions ---

  /**
   * Loads all data for a specific trainer from the local mock server.
   */
  public loadTrainerData(trainerId: number): void {
    this.setState({ loading: true, error: null });
    
    forkJoin({
      profile: this.trainerService.getTrainerProfile(trainerId),
      teams: this.trainerService.getTrainerTeams(trainerId),
      battles: this.trainerService.getTrainerBattles(trainerId)
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        const currentActiveId = this.state.activeTeamId;
        const activeStillValid =
          currentActiveId != null && result.teams.some((t) => t.id === currentActiveId);
        this.setState({
          profile: result.profile,
          teams: result.teams,
          battles: result.battles,
          activeTeamId: activeStillValid
            ? currentActiveId
            : result.teams.length > 0
              ? result.teams[0].id
              : null,
          loading: false
        });
      },
      error: (err) => this.setError('Failed to load trainer data')
    });
  }

  /**
   * Starts polling for live battle logs.
   */
  public startLiveBattleLogs(): void {
    this.trainerService.getLiveBattleLogs().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (battleLogs) => this.setState({ battleLogs }),
      error: (err) => console.error('Failed to poll battle logs', err)
    });
  }

  /**
   * Creates a new team and stores it.
   */
  public createTeam(teamData: Omit<TrainerTeam, 'id'>): Observable<TrainerTeam> {
    return this.trainerService.createTeam(teamData).pipe(
      tap((newTeam) => {
        const pokemon_ids =
          newTeam.pokemon_ids.length > 0 ? newTeam.pokemon_ids : teamData.pokemon_ids;
        const team: TrainerTeam = { ...newTeam, pokemon_ids };
        const currentTeams = this.state.teams;
        this.setState({
          teams: [...currentTeams, team],
          activeTeamId: team.id,
        });
      }),
      catchError((err) => {
        this.setError('Failed to create team');
        return throwError(() => err);
      })
    );
  }

  public updateTeam(id: number, updates: Partial<TrainerTeam>): void {
    this.trainerService.updateTeam(id, updates).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updatedTeam) => {
        const currentTeams = this.state.teams.map(t => t.id === id ? updatedTeam : t);
        this.setState({ teams: currentTeams });
      },
      error: (err) => this.setError('Failed to update team')
    });
  }

  public addToTeam(pokemon: Pokemon): void {
    const activeTeam = this.activeTeam();
    if (activeTeam && activeTeam.pokemon_ids.length < 6) {
      if (activeTeam.pokemon_ids.includes(pokemon.id)) return;
      this.updateTeam(activeTeam.id, { pokemon_ids: [...activeTeam.pokemon_ids, pokemon.id] });
    }
  }

  public removeFromTeam(pokemonId: number): void {
    const activeTeam = this.activeTeam();
    if (activeTeam) {
      this.updateTeam(activeTeam.id, { pokemon_ids: activeTeam.pokemon_ids.filter(id => id !== pokemonId) });
    }
  }

  public setError(error: string | null): void {
    this.setState({ error, loading: false });
  }
}
