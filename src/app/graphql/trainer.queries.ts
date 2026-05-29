import { gql } from 'apollo-angular';

export const GET_TRAINERS = gql`
  query GetTrainers {
    allTrainers {
      id
      name
      badge_count
      region
      avatar_url
      rank
    }
  }
`;

export const GET_TRAINER_PROFILE = gql`
  query GetTrainerProfile($id: ID!) {
    Trainer(id: $id) {
      id
      name
      badge_count
      region
      avatar_url
      rank
    }
  }
`;

export const GET_TRAINER_TEAMS = gql`
  query GetTrainerTeams($trainerId: ID!) {
    allTeams(filter: { trainer_id: $trainerId }) {
      id
      trainer_id
      name
      pokemon_ids
      created_at
    }
  }
`;

export const GET_TRAINER_BATTLES = gql`
  query GetTrainerBattles($trainerId: ID!) {
    allBattles(filter: { trainer_id: $trainerId }) {
      id
      trainer_id
      opponent_name
      team_id
      result
      date
      score_trainer
      score_opponent
    }
  }
`;

export const GET_BATTLE_LOGS = gql`
  query GetBattleLogs($battleId: ID!) {
    allBattleLogs(filter: { battle_id: $battleId }) {
      id
      battle_id
      timestamp
      message
      severity
    }
  }
`;

export const GET_ALL_BATTLE_LOGS = gql`
  query GetAllBattleLogs {
    allBattleLogs(sortField: "timestamp", sortOrder: "DESC") {
      id
      battle_id
      timestamp
      message
      severity
    }
  }
`;

export const CREATE_TEAM = gql`
  mutation CreateTeam($trainer_id: ID!, $name: String!, $pokemon_ids: [Int!]!, $created_at: String!) {
    createTeam(trainer_id: $trainer_id, name: $name, pokemon_ids: $pokemon_ids, created_at: $created_at) {
      id
      trainer_id
      name
      pokemon_ids
      created_at
    }
  }
`;

export const UPDATE_TEAM = gql`
  mutation UpdateTeam($id: ID!, $name: String, $pokemon_ids: [Int!]) {
    updateTeam(id: $id, name: $name, pokemon_ids: $pokemon_ids) {
      id
      trainer_id
      name
      pokemon_ids
      created_at
    }
  }
`;

export const LOG_BATTLE = gql`
  mutation LogBattle(
    $trainer_id: ID!,
    $opponent_name: String!,
    $team_id: ID!,
    $result: String!,
    $date: String!,
    $score_trainer: Int!,
    $score_opponent: Int!
  ) {
    createBattle(
      trainer_id: $trainer_id,
      opponent_name: $opponent_name,
      team_id: $team_id,
      result: $result,
      date: $date,
      score_trainer: $score_trainer,
      score_opponent: $score_opponent
    ) {
      id
      trainer_id
      opponent_name
      team_id
      result
      date
      score_trainer
      score_opponent
    }
  }
`;
