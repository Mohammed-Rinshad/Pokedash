import { Pokemon } from './pokemon.model';

export interface TrainerProfile {
  id: number;
  name: string;
  badge_count: number;
  region: string;
  avatar_url: string;
  rank: string;
}

export interface TrainerTeam {
  id: number;
  trainer_id: number;
  name: string;
  pokemon_ids: number[];
  created_at: string;
}

export interface BattleRecord {
  id: number;
  trainer_id: number;
  opponent_name: string;
  team_id: number;
  result: 'win' | 'loss';
  date: string;
  score_trainer: number;
  score_opponent: number;
}

export interface BattleLogEntry {
  id: number;
  battle_id: number;
  timestamp: string;
  message: string;
  severity: 'success' | 'info' | 'danger' | 'warning';
}

// Keeping the original Trainer interface for backward compatibility during transition
export interface Trainer {
  id: number;
  name: string;
  avatarUrl: string;
  team: Pokemon[]; // Resolves from TrainerTeam.pokemon_ids -> PokéAPI
  battlesWon: number;
  battlesLost: number;
}
