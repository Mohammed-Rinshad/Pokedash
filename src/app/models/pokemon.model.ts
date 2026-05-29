export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  imageUrl: string;
  stats?: PokemonStat[];
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
  effect: string;
  shortEffect: string;
}

export interface PokemonMove {
  name: string;
  level: number;
}

export interface PokemonEvolution {
  id: number;
  name: string;
}

export interface PokemonDetails extends Pokemon {
  height: number;
  weight: number;
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  evolutionChain: PokemonEvolution[];
}
