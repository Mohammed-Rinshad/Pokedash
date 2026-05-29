import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, interval, switchMap, map, catchError, throwError, startWith, EMPTY } from 'rxjs';
import { 
  GET_TRAINER_PROFILE, 
  GET_TRAINER_TEAMS, 
  GET_TRAINER_BATTLES, 
  GET_ALL_BATTLE_LOGS, 
  CREATE_TEAM,
  UPDATE_TEAM 
} from '../../graphql/trainer.queries';
import { TrainerProfile, TrainerTeam, BattleRecord, BattleLogEntry } from '../../models/trainer.model';

/**
 * Service to interact with the local Mock GraphQL server for Trainer data.
 */
@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private readonly apollo = inject(Apollo);
  
  private get client() {
    return this.apollo.use('local');
  }

  /**
   * Fetches the trainer profile by ID.
   */
  public getTrainerProfile(id: number): Observable<TrainerProfile> {
    return this.client.query<any>({
      query: GET_TRAINER_PROFILE,
      variables: { id: id.toString() },
      fetchPolicy: 'network-only'
    }).pipe(
      map(res => this.normalizeProfile(res.data.Trainer)),
      catchError(this.handleError)
    );
  }

  /**
   * Fetches all teams belonging to a specific trainer.
   */
  public getTrainerTeams(trainerId: number): Observable<TrainerTeam[]> {
    return this.client.query<any>({
      query: GET_TRAINER_TEAMS,
      variables: { trainerId: trainerId.toString() },
      fetchPolicy: 'network-only'
    }).pipe(
      map(res => res.data.allTeams.map((team: Record<string, unknown>) => this.normalizeTeam(team))),
      catchError(this.handleError)
    );
  }

  /**
   * Fetches all battle records for a specific trainer.
   */
  public getTrainerBattles(trainerId: number): Observable<BattleRecord[]> {
    return this.client.query<any>({
      query: GET_TRAINER_BATTLES,
      variables: { trainerId: trainerId.toString() },
      fetchPolicy: 'network-only'
    }).pipe(
      map(res => res.data.allBattles.map((battle: Record<string, unknown>) => this.normalizeBattle(battle))),
      catchError(this.handleError)
    );
  }

  /**
   * Simulates a live battle log subscription by polling the mock server every 5 seconds.
   */
  public getLiveBattleLogs(): Observable<BattleLogEntry[]> {
    return interval(5000).pipe(
      startWith(0),
      switchMap(() =>
        this.client.query<any>({
          query: GET_ALL_BATTLE_LOGS,
          fetchPolicy: 'network-only'
        }).pipe(
          map(res => res.data.allBattleLogs.map((log: Record<string, unknown>) => this.normalizeBattleLog(log))),
          catchError((error) => {
            console.error('GraphQL Error:', error);
            return EMPTY;
          })
        )
      )
    );
  }

  /**
   * Creates a new team for a trainer.
   */
  public createTeam(team: Omit<TrainerTeam, 'id'>): Observable<TrainerTeam> {
    return this.client.mutate<any>({
      mutation: CREATE_TEAM,
      variables: {
        trainer_id: team.trainer_id.toString(),
        name: team.name,
        pokemon_ids: team.pokemon_ids,
        created_at: team.created_at
      }
    }).pipe(
      map(res => this.normalizeTeam(res.data.createTeam)),
      catchError(this.handleError)
    );
  }

  public updateTeam(id: number, updates: Partial<TrainerTeam>): Observable<TrainerTeam> {
    return this.client.mutate<any>({
      mutation: UPDATE_TEAM,
      variables: {
        id: id.toString(),
        name: updates.name,
        pokemon_ids: updates.pokemon_ids
      }
    }).pipe(
      map(res => this.normalizeTeam(res.data.updateTeam)),
      catchError(this.handleError)
    );
  }

  private normalizeProfile(raw: Record<string, unknown>): TrainerProfile {
    return {
      id: Number(raw['id']),
      name: String(raw['name']),
      badge_count: Number(raw['badge_count']),
      region: String(raw['region']),
      avatar_url: String(raw['avatar_url'] ?? '').trim(),
      rank: String(raw['rank']),
    };
  }

  private normalizeTeam(raw: Record<string, unknown>): TrainerTeam {
    return {
      id: Number(raw['id']),
      trainer_id: Number(raw['trainer_id']),
      name: String(raw['name']),
      pokemon_ids: Array.isArray(raw['pokemon_ids'])
        ? (raw['pokemon_ids'] as number[]).map(Number)
        : [],
      created_at: String(raw['created_at']),
    };
  }

  private normalizeBattle(raw: Record<string, unknown>): BattleRecord {
    return {
      id: Number(raw['id']),
      trainer_id: Number(raw['trainer_id']),
      opponent_name: String(raw['opponent_name']),
      team_id: Number(raw['team_id']),
      result: raw['result'] as BattleRecord['result'],
      date: String(raw['date']),
      score_trainer: Number(raw['score_trainer']),
      score_opponent: Number(raw['score_opponent']),
    };
  }

  private normalizeBattleLog(raw: Record<string, unknown>): BattleLogEntry {
    return {
      id: Number(raw['id']),
      battle_id: Number(raw['battle_id']),
      timestamp: String(raw['timestamp']),
      message: String(raw['message']),
      severity: raw['severity'] as BattleLogEntry['severity'],
    };
  }

  private handleError(error: any) {
    console.error('GraphQL Error:', error);
    return throwError(() => new Error('An error occurred during the GraphQL operation.'));
  }
}
