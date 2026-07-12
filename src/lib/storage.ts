import { RoomState, Player } from './types';
import { getRandomWord } from './words';
import { BotAI } from './botAI';

// Global memory store for instant zero-config Vercel / local storage
const globalRooms = (globalThis as unknown as { __rooms?: Map<string, RoomState> });
if (!globalRooms.__rooms) {
  globalRooms.__rooms = new Map<string, RoomState>();
}
const roomsMap = globalRooms.__rooms;

// SSE Listeners map roomCode -> set of callbacks
type RoomUpdateListener = (room: RoomState) => void;
const globalListeners = (globalThis as unknown as { __listeners?: Map<string, Set<RoomUpdateListener>> });
if (!globalListeners.__listeners) {
  globalListeners.__listeners = new Map<string, Set<RoomUpdateListener>>();
}
const listenersMap = globalListeners.__listeners;

export class RoomStorage {
  public static async getRoom(code: string): Promise<RoomState | null> {
    const upperCode = code.toUpperCase().trim();
    return roomsMap.get(upperCode) || null;
  }

  public static async setRoom(room: RoomState): Promise<void> {
    roomsMap.set(room.code, room);
    this.notifyListeners(room);
  }

  public static subscribe(code: string, listener: RoomUpdateListener): () => void {
    const upperCode = code.toUpperCase().trim();
    if (!listenersMap.has(upperCode)) {
      listenersMap.set(upperCode, new Set());
    }
    listenersMap.get(upperCode)!.add(listener);

    return () => {
      const set = listenersMap.get(upperCode);
      if (set) {
        set.delete(listener);
      }
    };
  }

  private static notifyListeners(room: RoomState) {
    const set = listenersMap.get(room.code);
    if (set) {
      set.forEach(cb => cb(room));
    }
  }

  // Generate unique 6-character room code (e.g. IMP-482)
  public static generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      if (i === 3) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Start match helper
  public static startMatch(room: RoomState): RoomState {
    const updated = { ...room };
    const allPlayers = [...updated.players];
    if (allPlayers.length < 2) return room; // Safety check

    // Pick a random word
    const chosenWord = getRandomWord();
    updated.secretWord = chosenWord.word;
    updated.category = chosenWord.category;

    // Pick 1 random imposter
    const imposterIndex = Math.floor(Math.random() * allPlayers.length);
    updated.imposterId = allPlayers[imposterIndex].id;

    // Assign roles & reset ink
    updated.players = allPlayers.map((p, idx) => ({
      ...p,
      role: idx === imposterIndex ? 'IMPOSTER' : 'ARTIST',
      inkRemaining: 100
    }));

    updated.phase = 'DRAWING';
    updated.currentRound = 1;
    updated.currentTurnIndex = 0;
    updated.turnStartTime = Date.now();
    updated.strokes = [];
    updated.votes = {};
    updated.winner = undefined;
    updated.eliminatedPlayerId = undefined;

    // Check if the first player is a bot
    this.handleBotTurnIfNeeded(updated);

    return updated;
  }

  // Handle advancing turn to the next player
  public static advanceTurn(room: RoomState): RoomState {
    const updated = { ...room };
    const numPlayers = updated.players.length;

    // Advance turn index
    let nextTurnIndex = updated.currentTurnIndex + 1;
    let nextRound = updated.currentRound;

    if (nextTurnIndex >= numPlayers) {
      nextTurnIndex = 0;
      nextRound++;
    }

    if (nextRound > updated.settings.maxRounds) {
      // Transition to VOTING phase
      updated.phase = 'VOTING';
      updated.turnStartTime = Date.now();
      // Trigger bot votes automatically
      this.handleBotVotesIfNeeded(updated);
      return updated;
    }

    updated.currentTurnIndex = nextTurnIndex;
    updated.currentRound = nextRound;
    updated.turnStartTime = Date.now();

    // Replenish ink for next turn
    updated.players = updated.players.map(p => ({
      ...p,
      inkRemaining: 100
    }));

    // If next player is a bot, simulate their turn after 1.5 seconds
    this.handleBotTurnIfNeeded(updated);

    return updated;
  }

  private static handleBotTurnIfNeeded(room: RoomState) {
    const activePlayer = room.players[room.currentTurnIndex];
    if (activePlayer && activePlayer.isBot) {
      setTimeout(() => {
        const latestRoom = roomsMap.get(room.code);
        if (!latestRoom || latestRoom.phase !== 'DRAWING') return;

        const botPlayer = latestRoom.players[latestRoom.currentTurnIndex];
        if (!botPlayer || !botPlayer.isBot) return;

        // Generate bot stroke
        const stroke = BotAI.generateBotStroke(latestRoom, botPlayer);
        latestRoom.strokes.push(stroke);

        // Advance to next turn
        const nextRoom = this.advanceTurn(latestRoom);
        roomsMap.set(nextRoom.code, nextRoom);
        this.notifyListeners(nextRoom);
      }, 1600);
    }
  }

  private static handleBotVotesIfNeeded(room: RoomState) {
    setTimeout(() => {
      const latestRoom = roomsMap.get(room.code);
      if (!latestRoom || latestRoom.phase !== 'VOTING') return;

      const updatedRoom = { ...latestRoom };
      updatedRoom.players.forEach(p => {
        if (p.isBot && !updatedRoom.votes[p.id]) {
          updatedRoom.votes[p.id] = BotAI.pickBotVote(updatedRoom, p.id);
        }
      });

      roomsMap.set(updatedRoom.code, updatedRoom);
      this.notifyListeners(updatedRoom);
    }, 2500);
  }

  // Tally votes and transition to REVEAL
  public static tallyVotesAndReveal(room: RoomState): RoomState {
    const updated = { ...room };
    const voteCounts: Record<string, number> = {};

    Object.values(updated.votes).forEach(suspectId => {
      voteCounts[suspectId] = (voteCounts[suspectId] || 0) + 1;
    });

    // Find player with highest votes
    let highestSuspectId = '';
    let maxVotes = -1;
    Object.entries(voteCounts).forEach(([pId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        highestSuspectId = pId;
      }
    });

    updated.eliminatedPlayerId = highestSuspectId;
    if (highestSuspectId === updated.imposterId) {
      updated.winner = 'ARTISTS';
    } else {
      updated.winner = 'IMPOSTER';
    }

    updated.phase = 'REVEAL';
    return updated;
  }
}
