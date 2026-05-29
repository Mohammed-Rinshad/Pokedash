import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Pokemon } from '../../models/pokemon.model';
import { PokemonStore, SortOption, SortDirection } from '../../state/pokemon.store';
import { PokemonSelectors } from '../../state/pokemon.selectors';
import { TrainerStore } from '../../state/trainer.store';
import { PokemonDetailPanelComponent } from './components/pokemon-detail-panel.component';

const SKELETON_ROWS = Array.from({ length: 25 }, (_, i) => i);

/**
 * Standalone Pokédex UI.
 * Presentation-focused: reads from `PokemonSelectors` signals and triggers store actions.
 */
@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PokemonDetailPanelComponent],
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
  public readonly teams = this.trainerStore.teams;
  public readonly activeTeam = this.trainerStore.activeTeam;
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
    // Read teams() so OnPush views re-render when any team's roster changes.
    return this.teams().some((team) => team.pokemon_ids.includes(pokemonId));
  }

  /**
   * Action column: membership is checked across all saved teams; "Available" adds to the active team only.
   */
  public getTeamActionState(pokemonId: number): 'available' | 'in-team' | 'manage-in-builder' {
    if (this.isInTeam(pokemonId)) {
      return 'in-team';
    }
    const active = this.activeTeam();
    if (!active || active.pokemon_ids.length >= 6) {
      return 'manage-in-builder';
    }
    return 'available';
  }

  public addToTeam(event: Event, pokemon: Pokemon): void {
    event.stopPropagation();
    this.trainerStore.addToTeam(pokemon);
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

