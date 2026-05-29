import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Pokemon } from '../../models/pokemon.model';
import { PokemonStore } from '../../state/pokemon.store';

const SKELETON_ROWS = Array.from({ length: 25 }, (_, i) => i);

/**
 * Standalone Pokédex UI.
 * Presentation-focused: reads from `PokemonStore` signals and triggers store actions.
 */
@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokedex.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokedexComponent implements OnInit {
  private readonly pokemonStore = inject(PokemonStore);

  public readonly pokemons = this.pokemonStore.pokemons;
  public readonly loading = this.pokemonStore.loading;
  public readonly error = this.pokemonStore.error;

  public readonly skeletonRowIds = SKELETON_ROWS;

  ngOnInit(): void {
    // First feature version: show the first page.
    this.pokemonStore.fetchPokemons(25, 0);
  }

  public retry(): void {
    this.pokemonStore.fetchPokemons(25, 0);
  }

  public selectPokemon(id: number): void {
    this.pokemonStore.selectPokemon(id);
  }

  public statValue(pokemon: Pokemon, statName: string): number | '-' {
    const value = pokemon.stats?.find((s) => s.name === statName)?.value;
    return value ?? '-';
  }
}

