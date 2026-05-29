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
