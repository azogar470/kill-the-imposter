'use client';

import React from 'react';
import { Player } from '@/lib/types';

interface TurnIndicatorProps {
  players: Player[];
  currentTurnIndex: number;
  currentRound: number;
  maxRounds: number;
  turnStartTime: number;
  turnDurationSeconds: number;
  myPlayerId: string;
  onEndTurn: () => void;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  players,
  currentTurnIndex
}) => {
  const activePlayer = players[currentTurnIndex];
  const nameDisplay = (activePlayer?.name || 'ASHU').toUpperCase();

  return (
    <div className="w-full flex justify-start mb-4">
      <div className="status-badge-drawing">
        {nameDisplay} DRAWING
      </div>
    </div>
  );
};
