import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Pokemon } from '../../models/pokemon.model';
import { PokemonStore, SortOption, SortDirection } from '../../state/pokemon.store';
import { PokemonSelectors } from '../../state/pokemon.selectors';
import { TrainerStore } from '../../state/trainer.store';

const SKELETON_ROWS = Array.from({ length: 25 }, (_, i) => i);

/**
 * Standalone Pokédex UI.
 * Presentation-focused: reads from `PokemonSelectors` signals and triggers store actions.
 */
@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pokedex.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokedexComponent implements OnInit {
  public readonly pokemonStore = inject(PokemonStore);
  private readonly pokemonSelectors = inject(PokemonSelectors);
  private readonly trainerStore = inject(TrainerStore);
  private readonly destroyRef = inject(DestroyRef);

  // Global UI State
  public readonly loading = this.pokemonStore.loading;
  public readonly error = this.pokemonStore.error;
  public readonly team = this.trainerStore.team;
  public readonly skeletonRowIds = SKELETON_ROWS;

  // Filter & Sort State Signals
  public readonly filteredPokemons = toSignal(this.pokemonSelectors.filteredPokemons$, { initialValue: [] });
  public readonly availableTypes = toSignal(this.pokemonSelectors.availableTypes$, { initialValue: [] });
  public readonly currentPage = toSignal(this.pokemonSelectors.currentPage$, { initialValue: 1 });
  public readonly totalPages = toSignal(this.pokemonSelectors.totalPages$, { initialValue: 1 });

  // Form Controls
  public readonly searchControl = new FormControl('');
  
  // Track current sort state for the template
  public currentSortBy: SortOption = 'id';
  public currentSortDir: SortDirection = 'asc';
  public currentType: string = 'All';

  constructor() {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        this.pokemonStore.setSearchQuery(val || '');
      });
  }

  ngOnInit(): void {
    // Initial fetch
    this.pokemonStore.fetchPokemons();
  }

  public retry(): void {
    this.pokemonStore.fetchPokemons();
  }

  public selectPokemon(id: number): void {
    this.pokemonStore.selectPokemon(id);
  }

  public statValue(pokemon: Pokemon, statName: string): number | '-' {
    const value = pokemon.stats?.find((s) => s.name === statName)?.value;
    return value ?? '-';
  }

  public isInTeam(pokemonId: number): boolean {
    return this.team().some(p => p.id === pokemonId);
  }

  public addToTeam(event: Event, pokemon: Pokemon): void {
    event.stopPropagation();
    if (this.team().length < 6 && !this.isInTeam(pokemon.id)) {
      this.trainerStore.addToTeam(pokemon);
    }
  }

  // --- Filtering & Sorting ---

  public onTypeChange(event: Event): void {
    const type = (event.target as HTMLSelectElement).value;
    this.currentType = type;
    this.pokemonStore.setTypeFilter(type);
  }

  public onSortChange(event: Event): void {
    const sortBy = (event.target as HTMLSelectElement).value as SortOption;
    this.currentSortBy = sortBy;
    this.pokemonStore.setSort(sortBy, this.currentSortDir);
  }

  public toggleSortDirection(): void {
    this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc';
    this.pokemonStore.setSort(this.currentSortBy, this.currentSortDir);
  }

  // --- Pagination ---

  public nextPage(): void {
    this.pokemonStore.nextPage();
  }

  public prevPage(): void {
    this.pokemonStore.prevPage();
  }
}

