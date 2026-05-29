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

export interface GetPokemonDetailsQueryVariables {
  id: number;
}

export interface GetPokemonDetailsQueryPokemon {
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
  pokemon_v2_pokemonabilities: Array<{
    is_hidden: boolean;
    pokemon_v2_ability: {
      name: string;
      pokemon_v2_abilityeffecttexts: Array<{
        effect: string;
        short_effect: string;
      }>;
    };
  }>;
  pokemon_v2_pokemonmoves: Array<{
    pokemon_v2_move: {
      name: string;
    };
    level: number;
  }>;
  pokemon_v2_pokemonspecy: {
    pokemon_v2_evolutionchain: {
      pokemon_v2_pokemonspecies: Array<{
        id: number;
        name: string;
      }>;
    } | null;
  } | null;
}

export interface GetPokemonDetailsQueryResponse {
  pokemon_v2_pokemon: GetPokemonDetailsQueryPokemon[];
}

export const GET_POKEMON_DETAILS = gql`
  query GetPokemonDetails($id: Int!) {
    pokemon_v2_pokemon(where: {id: {_eq: $id}}) {
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
      pokemon_v2_pokemonabilities {
        is_hidden
        pokemon_v2_ability {
          name
          pokemon_v2_abilityeffecttexts(where: {language_id: {_eq: 9}}) {
            effect
            short_effect
          }
        }
      }
      pokemon_v2_pokemonmoves(limit: 10, order_by: {level: asc}) {
        pokemon_v2_move {
          name
        }
        level
      }
      pokemon_v2_pokemonspecy {
        pokemon_v2_evolutionchain {
          pokemon_v2_pokemonspecies(order_by: {order: asc}) {
            id
            name
          }
        }
      }
    }
  }
`;

export interface SearchPokemonQueryVariables {
  searchTerm: string;
}

export const SEARCH_POKEMON = gql`
  query SearchPokemon($searchTerm: String!) {
    pokemon_v2_pokemon(
      where: {name: {_ilike: $searchTerm}}
      limit: 10
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
