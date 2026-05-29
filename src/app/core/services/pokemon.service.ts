import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, catchError, map, retry, shareReplay, throwError } from 'rxjs';
import { GET_POKEMONS, type GetPokemonsQueryResponse, type GetPokemonsQueryVariables } from '../../graphql/pokemon.queries';
import { Pokemon, type PokemonStat } from '../../models/pokemon.model';

/**
 * Handles all Pokémon-related GraphQL data fetching + normalization.
 * Keeps the rest of the app (stores/components) presentation- and state-focused.
 */
@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly apollo = inject(Apollo);

  /**
   * Fetch a page of Pokémon from PokéAPI GraphQL and map it to the app's clean `Pokemon` model.
   */
  public getPokemons(limit: number, offset: number): Observable<Pokemon[]> {
    return this.apollo
      .query<GetPokemonsQueryResponse, GetPokemonsQueryVariables>({
        query: GET_POKEMONS,
        variables: { limit, offset },
      })
      .pipe(
        retry(3),
        map((result) => {
          const data = result.data;
          if (!data) {
            throw new Error('PokéAPI returned empty data.');
          }
          return data.pokemon_v2_pokemon.map((p) => this.toPokemon(p));
        }),
        catchError((err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'Failed to fetch Pokémon. Please try again.';
          return throwError(() => new Error(message));
        }),
        // Cache the single-page result for any concurrent subscribers.
        shareReplay(1),
      );
  }

  /**
   * Normalizes the raw PokéAPI GraphQL response into our internal `Pokemon` model.
   */
  private toPokemon(raw: GetPokemonsQueryResponse['pokemon_v2_pokemon'][number]): Pokemon {
    const imageUrl = this.imageUrlFromId(raw.id);

    const types = raw.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name);

    const stats: PokemonStat[] = raw.pokemon_v2_pokemonstats.map((s) => ({
      name: s.pokemon_v2_stat.name,
      value: s.base_stat,
    }));

    return {
      id: raw.id,
      name: raw.name,
      types,
      imageUrl,
      stats,
    };
  }

  /**
   * Builds a stable official artwork URL directly from the Pokémon ID.
   */
  private imageUrlFromId(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
}

