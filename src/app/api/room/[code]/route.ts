import { NextResponse } from 'next/server';
import { RoomStorage } from '@/lib/storage';
import { Player, CanvasStroke } from '@/lib/types';

export async function GET(
  req: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const room = await RoomStorage.getRoom(code);
  if (!room) {
    return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, room });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const room = await RoomStorage.getRoom(code);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, playerId, payload } = body;

    // ACTION: Add AI Bot Player
    if (action === 'ADD_BOT') {
      const botNumber = room.players.filter(p => p.isBot).length + 1;
      const botColors = ['#9d4edd', '#ffaa00', '#00e676', '#ff0055', '#00f0ff'];
      const botNames = ['Bot Picasso', 'Bot Banksy', 'Bot Da Vinci', 'Bot Van Gogh', 'Bot Dali'];
      const newBot: Player = {
        id: `bot-${Date.now()}-${botNumber}`,
        name: botNames[(botNumber - 1) % botNames.length],
        avatarColor: botColors[botNumber % botColors.length],
        isHost: false,
        isBot: true,
        inkRemaining: 100
      };
      room.players.push(newBot);
      await RoomStorage.setRoom(room);
      return NextResponse.json({ success: true, room });
    }

    // ACTION: Update Settings
    if (action === 'UPDATE_SETTINGS') {
      room.settings = { ...room.settings, ...payload };
      await RoomStorage.setRoom(room);
      return NextResponse.json({ success: true, room });
    }

    // ACTION: Start Match
    if (action === 'START_MATCH') {
      if (room.players.length < 3) {
        return NextResponse.json({ success: false, error: 'Minimum 3 players required to start the match' }, { status: 400 });
      }
      const updatedRoom = RoomStorage.startMatch(room);
      await RoomStorage.setRoom(updatedRoom);
      return NextResponse.json({ success: true, room: updatedRoom });
    }

    // ACTION: Submit Stroke (Drawing)
    if (action === 'SUBMIT_STROKE') {
      if (room.phase !== 'DRAWING') {
        return NextResponse.json({ success: false, error: 'Not in drawing phase' }, { status: 400 });
      }
      const activePlayer = room.players[room.currentTurnIndex];
      if (!activePlayer || activePlayer.id !== playerId) {
        return NextResponse.json({ success: false, error: 'Not your turn' }, { status: 403 });
      }

      const stroke: CanvasStroke = payload.stroke;
      const inkUsed: number = payload.inkUsed || 10;
      room.strokes.push(stroke);

      // Deplete ink
      room.players = room.players.map(p => {
        if (p.id === playerId) {
          return {
            ...p,
            inkRemaining: Math.max(0, p.inkRemaining - inkUsed)
          };
        }
        return p;
      });

      await RoomStorage.setRoom(room);
      return NextResponse.json({ success: true, room });
    }

    // ACTION: End Turn
    if (action === 'END_TURN') {
      if (room.phase !== 'DRAWING') {
        return NextResponse.json({ success: false, error: 'Not in drawing phase' }, { status: 400 });
      }
      const activePlayer = room.players[room.currentTurnIndex];
      if (!activePlayer || activePlayer.id !== playerId) {
        return NextResponse.json({ success: false, error: 'Not your turn' }, { status: 403 });
      }

      const updatedRoom = RoomStorage.advanceTurn(room);
      await RoomStorage.setRoom(updatedRoom);
      return NextResponse.json({ success: true, room: updatedRoom });
    }

    // ACTION: Clear Canvas (Host only or active player)
    if (action === 'CLEAR_CANVAS') {
      room.strokes = [];
      await RoomStorage.setRoom(room);
      return NextResponse.json({ success: true, room });
    }

    // ACTION: Cast Vote
    if (action === 'CAST_VOTE') {
      if (room.phase !== 'VOTING') {
        return NextResponse.json({ success: false, error: 'Not in voting phase' }, { status: 400 });
      }
      const targetPlayerId = payload.targetPlayerId;
      room.votes[playerId] = targetPlayerId;

      // Check if all non-bot players (and bots) have voted
      const totalPlayers = room.players.length;
      if (Object.keys(room.votes).length >= totalPlayers) {
        const revealedRoom = RoomStorage.tallyVotesAndReveal(room);
        await RoomStorage.setRoom(revealedRoom);
        return NextResponse.json({ success: true, room: revealedRoom });
      } else {
        await RoomStorage.setRoom(room);
        return NextResponse.json({ success: true, room });
      }
    }

    // ACTION: Force Tally Votes (Host can end voting early)
    if (action === 'TALLY_VOTES') {
      if (room.phase !== 'VOTING') {
        return NextResponse.json({ success: false, error: 'Not in voting phase' }, { status: 400 });
      }
      const revealedRoom = RoomStorage.tallyVotesAndReveal(room);
      await RoomStorage.setRoom(revealedRoom);
      return NextResponse.json({ success: true, room: revealedRoom });
    }

    // ACTION: Play Again / Back to Lobby
    if (action === 'PLAY_AGAIN') {
      room.phase = 'LOBBY';
      room.strokes = [];
      room.votes = {};
      room.winner = undefined;
      room.eliminatedPlayerId = undefined;
      room.currentRound = 0;
      await RoomStorage.setRoom(room);
      return NextResponse.json({ success: true, room });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling room action:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
