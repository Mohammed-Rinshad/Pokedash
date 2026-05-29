import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, catchError, map, retry, shareReplay, throwError, of } from 'rxjs';
import { GET_POKEMONS, GET_POKEMON_DETAILS, SEARCH_POKEMON, type GetPokemonsQueryResponse, type GetPokemonsQueryVariables, type GetPokemonDetailsQueryResponse, type GetPokemonDetailsQueryVariables, type SearchPokemonQueryVariables } from '../../graphql/pokemon.queries';
import { Pokemon, PokemonDetails, type PokemonStat } from '../../models/pokemon.model';

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
   * Fetch full details for a single Pokémon by ID.
   */
  public getPokemonDetails(id: number): Observable<PokemonDetails> {
    return this.apollo
      .query<GetPokemonDetailsQueryResponse, GetPokemonDetailsQueryVariables>({
        query: GET_POKEMON_DETAILS,
        variables: { id },
      })
      .pipe(
        retry(3),
        map((result) => {
          const data = result.data;
          if (!data || !data.pokemon_v2_pokemon.length) {
            throw new Error('Pokémon not found.');
          }
          return this.toPokemonDetails(data.pokemon_v2_pokemon[0]);
        }),
        catchError((err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'Failed to fetch Pokémon details. Please try again.';
          return throwError(() => new Error(message));
        }),
      );
  }

  /**
   * Search for Pokémon by name.
   */
  public searchPokemon(query: string): Observable<Pokemon[]> {
    return this.apollo
      .query<GetPokemonsQueryResponse, SearchPokemonQueryVariables>({
        query: SEARCH_POKEMON,
        variables: { searchTerm: `%${query}%` },
      })
      .pipe(
        retry(3),
        map((result) => {
          const data = result.data;
          if (!data) {
            return [];
          }
          return data.pokemon_v2_pokemon.map((p) => this.toPokemon(p));
        }),
        catchError(() => {
          return of([]); // return empty on search failure
        })
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
   * Normalizes the raw details response into the PokemonDetails model.
   */
  private toPokemonDetails(raw: GetPokemonDetailsQueryResponse['pokemon_v2_pokemon'][0]): PokemonDetails {
    const basic = this.toPokemon(raw as any); // Cast to any to reuse basic mapping

    const abilities = raw.pokemon_v2_pokemonabilities.map(a => {
      const texts = a.pokemon_v2_ability.pokemon_v2_abilityeffecttexts;
      const textObj = texts.length > 0 ? texts[0] : { effect: 'No description available', short_effect: 'No description available' };
      return {
        name: a.pokemon_v2_ability.name,
        isHidden: a.is_hidden,
        effect: textObj.effect,
        shortEffect: textObj.short_effect
      };
    });

    const moves = raw.pokemon_v2_pokemonmoves.map(m => ({
      name: m.pokemon_v2_move.name,
      level: m.level
    }));

    let evolutionChain: {id: number, name: string}[] = [];
    if (raw.pokemon_v2_pokemonspecy?.pokemon_v2_evolutionchain?.pokemon_v2_pokemonspecies) {
      evolutionChain = raw.pokemon_v2_pokemonspecy.pokemon_v2_evolutionchain.pokemon_v2_pokemonspecies.map(s => ({
        id: s.id,
        name: s.name
      }));
    }

    return {
      ...basic,
      height: raw.height,
      weight: raw.weight,
      abilities,
      moves,
      evolutionChain
    };
  }

  /**
   * Builds a stable official artwork URL directly from the Pokémon ID.
   */
  private imageUrlFromId(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
}

