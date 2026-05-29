import { Injectable, computed } from '@angular/core';
import { BaseStore } from './base.store';
import { Trainer } from '../models/trainer.model';
import { Pokemon } from '../models/pokemon.model';

export interface TrainerState {
  profile: Trainer | null;
  loading: boolean;
  error: string | null;
}

const initialState: TrainerState = {
  profile: {
    id: 1,
    name: 'Ash Ketchum',
    avatarUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', // Pikachu default
    team: [],
    battlesWon: 0,
    battlesLost: 0
  },
  loading: false,
  error: null,
};

/**
 * Store specifically for managing the Trainer's profile and their Pokemon team.
 */
@Injectable({
  providedIn: 'root'
})
export class TrainerStore extends BaseStore<TrainerState> {
  constructor() {
    super(initialState);
  }

  // --- Selectors (Signals) ---
  private stateSignal = this.getStateSignal();
  
  public readonly profile = computed(() => this.stateSignal().profile);
  public readonly team = computed(() => this.stateSignal().profile?.team || []);
  
  // --- Actions ---

  /**
   * Updates specific fields of the trainer profile.
   */
  public updateProfile(profileUpdates: Partial<Trainer>): void {
    const currentProfile = this.state.profile;
    if (currentProfile) {
      this.setState({ profile: { ...currentProfile, ...profileUpdates } });
    }
  }

  /**
   * Optimistically adds a pokemon to the trainer's team.
   * Enforces a maximum team size of 6.
   */
  public addToTeam(pokemon: Pokemon): void {
    const currentProfile = this.state.profile;
    if (currentProfile && currentProfile.team.length < 6) {
      // Prevent duplicates
      if (currentProfile.team.some(p => p.id === pokemon.id)) return;
      
      this.setState({ 
        profile: { 
          ...currentProfile, 
          team: [...currentProfile.team, pokemon] 
        } 
      });
    }
  }

  /**
   * Optimistically removes a pokemon from the trainer's team.
   */
  public removeFromTeam(pokemonId: number): void {
    const currentProfile = this.state.profile;
    if (currentProfile) {
      this.setState({ 
        profile: { 
          ...currentProfile, 
          team: currentProfile.team.filter(p => p.id !== pokemonId) 
        } 
      });
    }
  }

  /**
   * Sets the loading state for trainer profile operations.
   */
  public setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Sets the error state for trainer profile operations.
   */
  public setError(error: string | null): void {
    this.setState({ error, loading: false });
  }
}
