'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player } from '@/lib/types';
import { Trophy, ShieldAlert, RotateCcw, Home } from 'lucide-react';
import { soundEffects } from '@/lib/AudioEffects';

interface RevealModalProps {
  winner?: 'ARTISTS' | 'IMPOSTER';
  eliminatedPlayerId?: string;
  imposterId?: string;
  secretWord?: string;
  category?: string;
  players: Player[];
  isHost: boolean;
  isWinner?: boolean;
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export const RevealModal: React.FC<RevealModalProps> = ({
  winner,
  eliminatedPlayerId,
  imposterId,
  secretWord,
  category,
  players,
  isHost,
  isWinner = false,
  onPlayAgain,
  onBackToHome
}) => {
  const eliminatedPlayer = players.find(p => p.id === eliminatedPlayerId);
  const imposterPlayer = players.find(p => p.id === imposterId);
  const artistsWon = winner === 'ARTISTS';

  useEffect(() => {
    soundEffects.playVictory();

    if (!isWinner) return;

    const duration = 4 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: ['#00f0ff', '#ff0055', '#ffb700', '#00ff66']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: ['#00f0ff', '#ff0055', '#ffb700', '#00ff66']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [isWinner]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div
        className={`glass-panel p-8 sm:p-12 text-center border-3 border-black transition-all animate-slide-in ${
          artistsWon
            ? 'bg-[#ffeef2] shadow-flat'
            : 'bg-[#fffaee] shadow-flat'
        }`}
      >
        {/* Outcome Header Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-black uppercase tracking-wider mb-6 bg-white border-3 border-black shadow-flat text-black">
          {artistsWon ? (
            <>
              <Trophy className="w-4 h-4 text-black" />
              <span>VICTORY • IMPOSTER SUBDUED</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-black" />
              <span>IMPOSTER INFILTRATED & ESCAPED</span>
            </>
          )}
        </div>

        {/* Headline */}
        <h1 className="pixel-title text-3xl sm:text-4xl font-extrabold text-black mb-4">
          {artistsWon ? 'Case Closed!' : 'Compromised Mission!'}
        </h1>

        <p className="text-sm text-black rounded-text font-bold max-w-lg mx-auto mb-8 leading-relaxed">
          {artistsWon
            ? `Agent ${eliminatedPlayer?.name || 'suspect'} was correctly identified and ejected from the sector.`
            : `Agent ${eliminatedPlayer?.name || 'innocent'} was falsely suspected. The imposter has escaped!`}
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-left">
          {/* Imposter Reveal */}
          <div className="p-5 rounded-2xl bg-white border-3 border-black shadow-flat">
            <div className="text-[10px] font-bold font-mono uppercase text-black tracking-wider mb-2">
              IMPOSTER IDENTITY
            </div>
            <div className="flex items-center gap-3">
              <div
                className="avatar-circle text-white border-3 border-black font-black shrink-0"
                style={{ backgroundColor: imposterPlayer?.avatarColor }}
              >
                {imposterPlayer?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-extrabold text-base text-black">{imposterPlayer?.name}</div>
                <div className="text-[10px] text-black font-mono">ROLE: ELUSIVE DECEIVER</div>
              </div>
            </div>
          </div>

          {/* Word Dossier */}
          <div className="p-5 rounded-2xl bg-white border-3 border-black shadow-flat">
            <div className="text-[10px] font-bold font-mono uppercase text-black tracking-wider mb-2">
              WORD ARCHIVE
            </div>
            <div className="font-black text-xl text-black font-mono tracking-wide">{secretWord?.toUpperCase()}</div>
            <div className="text-[10px] text-black mt-1 font-mono">CLUE: {category?.toUpperCase()}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t-3 border-black">
          {isHost ? (
            <button
              onClick={onPlayAgain}
              className="btn py-3.5 px-8 text-xs font-black"
            >
              <RotateCcw className="w-4 h-4 inline mr-1 text-black" />
              <span>LAUNCH NEXT ROUND</span>
            </button>
          ) : (
            <div className="text-xs text-black font-mono uppercase bg-white px-4 py-3 rounded-xl border-3 border-black shadow-flat">
              WAITING FOR CHIEF TO LAUNCH NEXT MATCH...
            </div>
          )}

          <button
            onClick={onBackToHome}
            className="btn w-full sm:w-auto py-3.5 px-6 text-xs bg-white"
          >
            <Home className="w-4 h-4 inline mr-1 text-black" />
            <span>EXIT TERMINAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
