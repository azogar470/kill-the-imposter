import { NextResponse } from 'next/server';
import { RoomStorage } from '@/lib/storage';
import { Player } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { code, playerName, playerColor } = await req.json();
    const cleanCode = (code || '').toUpperCase().trim();
    const name = (playerName || 'Artist').trim().slice(0, 16);

    if (!cleanCode) {
      return NextResponse.json({ success: false, error: 'Invite code is required' }, { status: 400 });
    }

    const room = await RoomStorage.getRoom(cleanCode);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found. Check your invite code!' }, { status: 404 });
    }

    const avatarColors = ['#00f0ff', '#ff0055', '#ffaa00', '#00e676', '#9d4edd', '#ffffff'];
    const color = playerColor || avatarColors[room.players.length % avatarColors.length];

    const newPlayer: Player = {
      id: `player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      avatarColor: color,
      isHost: false,
      inkRemaining: 100
    };

    room.players.push(newPlayer);
    await RoomStorage.setRoom(room);

    return NextResponse.json({
      success: true,
      code: room.code,
      playerId: newPlayer.id,
      room
    });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json({ success: false, error: 'Failed to join room' }, { status: 500 });
  }
}
