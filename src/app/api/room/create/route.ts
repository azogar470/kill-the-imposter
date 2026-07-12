import { NextResponse } from 'next/server';
import { RoomStorage } from '@/lib/storage';
import { RoomState, Player } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { hostName, hostColor } = await req.json();
    const name = (hostName || 'Detective').trim().slice(0, 16);
    const color = hostColor || '#00f0ff';

    const code = RoomStorage.generateRoomCode();
    const hostPlayer: Player = {
      id: `player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      avatarColor: color,
      isHost: true,
      inkRemaining: 100
    };

    const newRoom: RoomState = {
      code,
      createdAt: Date.now(),
      phase: 'LOBBY',
      players: [hostPlayer],
      settings: {
        maxRounds: 2,
        turnDurationSeconds: 25,
        inkPerTurn: 100
      },
      currentRound: 0,
      currentTurnIndex: 0,
      turnStartTime: 0,
      strokes: [],
      votes: {}
    };

    await RoomStorage.setRoom(newRoom);

    return NextResponse.json({
      success: true,
      code: newRoom.code,
      playerId: hostPlayer.id,
      room: newRoom
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ success: false, error: 'Failed to create room' }, { status: 500 });
  }
}
