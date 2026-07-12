export type GamePhase = 'LOBBY' | 'ROLE_ASSIGNMENT' | 'DRAWING' | 'VOTING' | 'REVEAL';

export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  isHost: boolean;
  isBot?: boolean;
  isReady?: boolean;
  role?: 'IMPOSTER' | 'ARTIST';
  inkRemaining: number; // 0 to 100
  score?: number;
}

export interface StrokePoint {
  x: number;
  y: number;
}

export interface CanvasStroke {
  id: string;
  playerId: string;
  playerName: string;
  color: string;
  size: number;
  points: StrokePoint[];
}

export interface RoomSettings {
  maxRounds: number;
  turnDurationSeconds: number;
  inkPerTurn: number;
}

export interface RoomState {
  code: string;
  createdAt: number;
  phase: GamePhase;
  players: Player[];
  settings: RoomSettings;
  
  // Current game session data
  secretWord?: string;
  category?: string;
  imposterId?: string;
  
  currentRound: number;
  currentTurnIndex: number; // Index into players array
  turnStartTime: number;
  
  strokes: CanvasStroke[];
  
  // Votes map playerId -> votedForPlayerId
  votes: Record<string, string>;
  
  // Reveal outcomes
  winner?: 'ARTISTS' | 'IMPOSTER';
  eliminatedPlayerId?: string;
}

export interface WordEntry {
  word: string;
  category: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}
