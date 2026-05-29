import { Pokemon } from './pokemon.model';

export interface Trainer {
  id: number;
  name: string;
  avatarUrl: string;
  team: Pokemon[];
  battlesWon: number;
  battlesLost: number;
}
