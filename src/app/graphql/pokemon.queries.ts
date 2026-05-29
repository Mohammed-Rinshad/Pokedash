import { gql } from '@apollo/client/core';

export interface GetPokemonsQueryVariables {
  limit: number;
  offset: number;
}

export interface GetPokemonsQueryPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  pokemon_v2_pokemontypes: Array<{
    pokemon_v2_type: {
      name: string;
    };
  }>;
  pokemon_v2_pokemonstats: Array<{
    pokemon_v2_stat: {
      name: string;
    };
    base_stat: number;
  }>;
}

export interface GetPokemonsQueryResponse {
  pokemon_v2_pokemon: GetPokemonsQueryPokemon[];
}

/**
 * Paginated fetch of Pokémon with their core metadata, types, and stats.
 *
 * Targets the PokéAPI GraphQL schema (`pokemon_v2_*` tables).
 */
export const GET_POKEMONS = gql`
  query GET_POKEMONS($limit: Int!, $offset: Int!) {
    pokemon_v2_pokemon(
      limit: $limit
      offset: $offset
      order_by: { id: asc }
    ) {
      id
      name
      height
      weight
      pokemon_v2_pokemontypes {
        pokemon_v2_type {
          name
        }
      }
      pokemon_v2_pokemonstats {
        pokemon_v2_stat {
          name
        }
        base_stat
      }
    }
  }
`;

