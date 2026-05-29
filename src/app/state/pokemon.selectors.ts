import { Injectable, inject } from '@angular/core';
import { PokemonStore } from './pokemon.store';
import { Observable, combineLatest, map, shareReplay, debounceTime, distinctUntilChanged } from 'rxjs';
import { Pokemon } from '../models/pokemon.model';

@Injectable({ providedIn: 'root' })
export class PokemonSelectors {
  private readonly pokemonStore = inject(PokemonStore);
  private readonly state$ = this.pokemonStore.getState$();

  // Extract individual streams from the global state observable
  private readonly pokemons$ = this.state$.pipe(map(state => state.pokemons));
  
  // Apply RxJS debounce and distinct filtering to the search query stream
  private readonly searchQuery$ = this.state$.pipe(
    map(state => state.searchQuery),
    debounceTime(300),
    distinctUntilChanged()
  );

  private readonly typeFilter$ = this.state$.pipe(map(state => state.typeFilter), distinctUntilChanged());
  private readonly sortBy$ = this.state$.pipe(map(state => state.sortBy), distinctUntilChanged());
  private readonly sortDirection$ = this.state$.pipe(map(state => state.sortDirection), distinctUntilChanged());

  /**
   * Dynamically extracts all unique types from the currently fetched Pokémon.
   */
  public readonly availableTypes$: Observable<string[]> = this.pokemons$.pipe(
    map(pokemons => {
      const types = new Set<string>();
      pokemons.forEach(p => p.types.forEach(t => types.add(t)));
      return ['All', ...Array.from(types).sort()];
    }),
    shareReplay(1)
  );

  /**
   * Combines all filtering and sorting criteria with the list of Pokémon.
   */
  public readonly filteredPokemons$: Observable<Pokemon[]> = combineLatest([
    this.pokemons$,
    this.searchQuery$,
    this.typeFilter$,
    this.sortBy$,
    this.sortDirection$
  ]).pipe(
    map(([pokemons, query, type, sortBy, sortDir]) => {
      let result = [...pokemons];

      // 1. Search Filter
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(lowerQuery));
      }

      // 2. Type Filter
      if (type && type !== 'All') {
        result = result.filter(p => p.types.includes(type));
      }

      // 3. Sorting
      result.sort((a, b) => {
        let valA: number | string = 0;
        let valB: number | string = 0;
        
        if (sortBy === 'name') {
          valA = a.name;
          valB = b.name;
        } else if (sortBy === 'hp' || sortBy === 'attack') {
          valA = a.stats?.find(s => s.name === sortBy)?.value || 0;
          valB = b.stats?.find(s => s.name === sortBy)?.value || 0;
        } else if (sortBy === 'id') {
          valA = a.id;
          valB = b.id;
        }

        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });

      return result;
    }),
    shareReplay(1)
  );

  /**
   * Derived pagination state: Current page number (1-indexed).
   */
  public readonly currentPage$: Observable<number> = this.state$.pipe(
    map(state => Math.floor(state.offset / state.limit) + 1),
    distinctUntilChanged()
  );

  /**
   * Derived pagination state: Total pages available.
   */
  public readonly totalPages$: Observable<number> = this.state$.pipe(
    map(state => Math.ceil(state.totalCount / state.limit)),
    distinctUntilChanged()
  );
}
