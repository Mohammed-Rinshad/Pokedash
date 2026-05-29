import { Injectable, computed, inject } from '@angular/core';
import { BaseStore } from './base.store';
import { PokemonService } from '../core/services/pokemon.service';
import { Pokemon } from '../models/pokemon.model';

export interface PokemonState {
  pokemons: Pokemon[];
  selectedPokemonId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: PokemonState = {
  pokemons: [],
  selectedPokemonId: null,
  loading: false,
  error: null,
};

/**
 * Store specifically for managing Pokemon data, bridging GraphQL responses
 * to our application state using BehaviorSubjects and Signals.
 */
@Injectable({
  providedIn: 'root'
})
export class PokemonStore extends BaseStore<PokemonState> {
  private readonly pokemonService = inject(PokemonService);

  constructor() {
    super(initialState);
  }

  // --- Selectors (Signals) ---
  private stateSignal = this.getStateSignal();
  
  public readonly pokemons = computed(() => this.stateSignal().pokemons);
  public readonly loading = computed(() => this.stateSignal().loading);
  public readonly error = computed(() => this.stateSignal().error);
  
  public readonly selectedPokemon = computed(() => {
    const state = this.stateSignal();
    return state.pokemons.find(p => p.id === state.selectedPokemonId) || null;
  });

  // --- Actions ---
  
  /**
   * Updates the store with a new list of pokemons.
   */
  public setPokemons(pokemons: Pokemon[]): void {
    this.setState({ pokemons, loading: false, error: null });
  }

  /**
   * Toggles the global loading state for pokemon fetching.
   */
  public setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Sets a global error message for the pokemon feature.
   */
  public setError(error: string): void {
    this.setState({ error, loading: false });
  }

  /**
   * Selects a specific pokemon to be viewed in the detail panel.
   */
  public selectPokemon(id: number): void {
    this.setState({ selectedPokemonId: id });
  }

  /**
   * Fetches a page of Pokémon and updates store state (loading/error/data).
   */
  public fetchPokemons(limit: number, offset: number): void {
    this.setLoading(true);
    this.pokemonService.getPokemons(limit, offset).subscribe({
      next: (pokemons) => {
        this.setPokemons(pokemons);
      },
      error: (err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Failed to load Pokémon. Please try again.';
        this.setError(message);
      },
    });
  }
}
