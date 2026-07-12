'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RoomState, CanvasStroke } from '@/lib/types';
import { soundEffects } from '@/lib/AudioEffects';
import { Navbar } from '@/components/Navbar';
import { LobbyView } from '@/components/LobbyView';
import { WordBanner } from '@/components/WordBanner';
import { TurnIndicator } from '@/components/TurnIndicator';
import { DrawingBoard } from '@/components/DrawingBoard';
import { VotingView } from '@/components/VotingView';
import { RevealModal } from '@/components/RevealModal';
import { Loader2, AlertTriangle } from 'lucide-react';

interface RoomClientProps {
  code: string;
}

export const RoomClient: React.FC<RoomClientProps> = ({ code }) => {
  const router = useRouter();
  const [room, setRoom] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>('');

  // Read stored playerId from localStorage on load
  useEffect(() => {
    const storedId = localStorage.getItem(`kti_player_${code}`);
    if (storedId) {
      setMyPlayerId(storedId);
    }
  }, [code]);

  const lastActivePlayerIdRef = useRef<string | null>(null);

  // Play chimes/notifications on turn transition
  useEffect(() => {
    if (room && room.phase === 'DRAWING') {
      const activePlayer = room.players[room.currentTurnIndex];
      if (activePlayer && activePlayer.id !== lastActivePlayerIdRef.current) {
        lastActivePlayerIdRef.current = activePlayer.id;
        soundEffects.playTurnStart();
        if (activePlayer.id === myPlayerId) {
          // Play click chime twice for active user warning
          setTimeout(() => {
            soundEffects.playClick();
          }, 150);
        }
      }
    } else {
      lastActivePlayerIdRef.current = null;
    }
  }, [room, myPlayerId]);

  // Connect to live SSE feed for room state
  useEffect(() => {
    if (!code) return;

    // Fetch initial room state
    fetch(`/api/room/${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.room) {
          setRoom(data.room);
          setLoading(false);
        } else {
          setError(data.error || 'Room not found');
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Failed to connect to room server');
        setLoading(false);
      });

    // Subscribe to SSE updates
    const eventSource = new EventSource(`/api/room/${code}/events`);

    eventSource.onmessage = (event) => {
      try {
        const updatedRoom: RoomState = JSON.parse(event.data);
        if (updatedRoom && updatedRoom.code) {
          setRoom(updatedRoom);
          setLoading(false);
        }
      } catch {}
    };

    return () => {
      eventSource.close();
    };
  }, [code]);

  // Realtime Polling fallback to guarantee state updates when drawing/voting
  useEffect(() => {
    if (!code) return;
    if (!room || (room.phase !== 'DRAWING' && room.phase !== 'VOTING')) return;

    const pollInterval = setInterval(() => {
      fetch(`/api/room/${code}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.room) {
            setRoom(data.room);
          }
        })
        .catch(() => {});
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [code, room?.phase]);

  // Game Action dispatcher helper
  const sendRoomAction = useCallback(async (action: string, payload: Record<string, unknown> = {}) => {
    try {
      const res = await fetch(`/api/room/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          playerId: myPlayerId,
          payload
        })
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoom(data.room);
      }
    } catch (err) {
      console.error(`Failed action ${action}:`, err);
    }
  }, [code, myPlayerId]);

  // Action handlers
  const handleAddBot = () => sendRoomAction('ADD_BOT');
  const handleStartMatch = () => sendRoomAction('START_MATCH');
  const handleUpdateSettings = (settings: { maxRounds?: number; turnDurationSeconds?: number }) => {
    sendRoomAction('UPDATE_SETTINGS', settings);
  };

  const handleSubmitStroke = (stroke: CanvasStroke, inkUsed: number) => {
    sendRoomAction('SUBMIT_STROKE', { stroke, inkUsed });
  };

  const handleEndTurn = () => sendRoomAction('END_TURN');

  const handleCastVote = (targetPlayerId: string) => {
    sendRoomAction('CAST_VOTE', { targetPlayerId });
  };

  const handleForceTally = () => sendRoomAction('TALLY_VOTES');

  const handlePlayAgain = () => sendRoomAction('PLAY_AGAIN');

  const handleLeaveRoom = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin mb-4" />
        <p className="text-sm text-[var(--text-secondary)] font-medium">Connecting to Room {code}...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-[var(--secondary)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Room Unavailable</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{error || 'This invite code may be invalid or expired.'}</p>
          <button onClick={handleLeaveRoom} className="btn btn-primary w-full">
            Return to Main Menu
          </button>
        </div>
      </div>
    );
  }

  const myPlayer = room.players.find(p => p.id === myPlayerId);
  const isHost = myPlayer?.isHost || false;
  const activePlayer = room.players[room.currentTurnIndex];
  const isMyTurn = activePlayer?.id === myPlayerId;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        roomCode={room.code}
        playerName={myPlayer?.name}
        onLeaveRoom={handleLeaveRoom}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        {/* PHASE 1: LOBBY */}
        {room.phase === 'LOBBY' && (
          <LobbyView
            room={room}
            playerId={myPlayerId}
            onAddBot={handleAddBot}
            onStartMatch={handleStartMatch}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {/* PHASE 2: DRAWING */}
        {room.phase === 'DRAWING' && (
          <div className="space-y-4 animate-slide-in">
            <WordBanner
              role={myPlayer?.role}
              secretWord={room.secretWord}
              category={room.category}
            />

            <TurnIndicator
              players={room.players}
              currentTurnIndex={room.currentTurnIndex}
              currentRound={room.currentRound}
              maxRounds={room.settings.maxRounds}
              turnStartTime={room.turnStartTime}
              turnDurationSeconds={room.settings.turnDurationSeconds}
              myPlayerId={myPlayerId}
              onEndTurn={handleEndTurn}
            />

            <DrawingBoard
              strokes={room.strokes}
              isMyTurn={isMyTurn}
              myPlayerId={myPlayerId}
              myPlayerName={myPlayer?.name || 'Artist'}
              initialInk={myPlayer?.inkRemaining ?? 100}
              onSubmitStroke={handleSubmitStroke}
              onEndTurn={handleEndTurn}
            />

            {/* Neo-Brutalist Player Roster Container at the bottom */}
            <div className="roster-container mt-8 max-w-4xl mx-auto">
              <h3 className="pixel-title text-sm mb-4 text-black text-center sm:text-left">INVESTIGATORS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {/* Row 1 */}
                <div className="flex items-center justify-between gap-3">
                  <div className="neo-sticker-btn w-1/2 py-2 px-3 border-3 border-black bg-white hover:transform-none select-none text-center font-bold">
                    {room.players[0] ? room.players[0].name.toUpperCase() : 'PLAYER 1'}
                  </div>
                  <div className="w-1/2 py-2.5 px-4 bg-white border-3 border-black rounded-full box-shadow shadow-flat text-xs font-mono font-bold text-black h-10 flex items-center justify-center">
                    {room.players[0] ? (room.players[0].isBot ? 'BOT AGENT' : 'ONLINE') : ''}
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between gap-3">
                  <div className="neo-sticker-btn w-1/2 py-2 px-3 border-3 border-black bg-white hover:transform-none select-none text-center font-bold">
                    {room.players[1] ? room.players[1].name.toUpperCase() : 'PLAYER 2'}
                  </div>
                  <div className="w-1/2 py-2.5 px-4 bg-white border-3 border-black rounded-full box-shadow shadow-flat text-xs font-mono font-bold text-black h-10 flex items-center justify-center">
                    {room.players[1] ? (room.players[1].isBot ? 'BOT AGENT' : 'ONLINE') : ''}
                  </div>
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-between gap-3">
                  <div className="neo-sticker-btn w-1/2 py-2 px-3 border-3 border-black bg-white hover:transform-none select-none text-center font-bold">
                    {room.players[2] ? room.players[2].name.toUpperCase() : 'PLAYER 3'}
                  </div>
                  <div className="w-1/2 py-2.5 px-4 bg-white border-3 border-black rounded-full box-shadow shadow-flat text-xs font-mono font-bold text-black h-10 flex items-center justify-center">
                    {room.players[2] ? (room.players[2].isBot ? 'BOT AGENT' : 'ONLINE') : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 3: VOTING */}
        {room.phase === 'VOTING' && (
          <VotingView
            players={room.players}
            myPlayerId={myPlayerId}
            isHost={isHost}
            votes={room.votes}
            onCastVote={handleCastVote}
            onForceTally={handleForceTally}
          />
        )}

        {/* PHASE 4: REVEAL */}
        {room.phase === 'REVEAL' && (
          <RevealModal
            winner={room.winner}
            eliminatedPlayerId={room.eliminatedPlayerId}
            imposterId={room.imposterId}
            secretWord={room.secretWord}
            category={room.category}
            players={room.players}
            isHost={isHost}
            isWinner={(myPlayer?.role === 'ARTIST' && room.winner === 'ARTISTS') || (myPlayer?.role === 'IMPOSTER' && room.winner === 'IMPOSTER')}
            onPlayAgain={handlePlayAgain}
            onBackToHome={handleLeaveRoom}
          />
        )}
      </main>
    </div>
  );
};
