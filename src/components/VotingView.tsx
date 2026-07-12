'use client';

import React, { useState } from 'react';
import { Player } from '@/lib/types';
import { ShieldAlert, Vote, CheckCircle2, UserCheck, FastForward, UserX } from 'lucide-react';
import { soundEffects } from '@/lib/AudioEffects';

interface VotingViewProps {
  players: Player[];
  myPlayerId: string;
  isHost: boolean;
  votes: Record<string, string>;
  onCastVote: (targetPlayerId: string) => void;
  onForceTally: () => void;
}

export const VotingView: React.FC<VotingViewProps> = ({
  players,
  myPlayerId,
  isHost,
  votes,
  onCastVote,
  onForceTally
}) => {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(
    votes[myPlayerId] || null
  );

  const hasVoted = Boolean(votes[myPlayerId]);
  const totalVotesCast = Object.keys(votes).length;

  const handleVoteClick = (targetId: string) => {
    if (hasVoted) return;
    setSelectedSuspectId(targetId);
    soundEffects.playVoteThud();
    onCastVote(targetId);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* emergency alert header */}
      <div className="glass-panel p-6 sm:p-8 mb-8 text-center bg-[#FADCC8] border-3 border-black shadow-flat">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-3 border-black bg-white text-[10px] font-mono font-bold tracking-widest text-black mb-4">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>INVESTIGATION BOARD • IDENTIFY IMPOSTER</span>
        </div>

        <h2 className="pixel-title text-2xl sm:text-3xl font-black text-black">
          Suspect Ejection Lineup
        </h2>
        <p className="text-xs sm:text-sm text-black mt-2 max-w-xl mx-auto leading-relaxed font-bold rounded-text">
          Examine the drawings. Select the investigator you believe submitted fake or misleading strokes.
        </p>

        {/* Live Vote Progress Counter */}
        <div className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border-3 border-black font-mono text-xs font-bold text-black shadow-flat">
          <Vote className="w-4 h-4 text-black" />
          <span>VOTES SUBMITTED: </span>
          <span className="text-black">{totalVotesCast} / {players.length}</span>
        </div>
      </div>

      {/* Grid of Suspect Dossiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {players.map((suspect) => {
          const isSelected = selectedSuspectId === suspect.id;
          const isMe = suspect.id === myPlayerId;
          const votesForSuspect = Object.values(votes).filter(id => id === suspect.id).length;

          return (
            <button
              key={suspect.id}
              disabled={hasVoted || isMe}
              onClick={() => handleVoteClick(suspect.id)}
              className={`glass-panel p-5 text-left border-3 border-black transition-all duration-300 flex flex-col justify-between h-48 ${
                isSelected
                  ? 'bg-[#ffeef2] shadow-flat'
                  : isMe
                  ? 'opacity-50 cursor-not-allowed bg-white'
                  : 'bg-white hover:bg-black/5 shadow-flat'
              }`}
            >
              <div className="w-full">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="avatar-circle text-white border-3 border-black font-black text-lg shrink-0 shadow-flat"
                      style={{ backgroundColor: suspect.avatarColor }}
                    >
                      {suspect.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-black text-base truncate max-w-[120px]">{suspect.name}</span>
                        {isMe && <span className="text-[8px] bg-white border-2 border-black px-1.5 py-0.5 rounded font-bold font-mono">YOU</span>}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {suspect.isBot && <span className="badge bg-[#A1F2EC] text-[8px] py-0.5 font-mono">BOT</span>}
                        {suspect.isHost && <span className="badge bg-[#FCE1A8] text-[8px] py-0.5 font-mono">HOST</span>}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="p-1 rounded-full bg-white border-3 border-black w-7 h-7 flex items-center justify-center shadow-flat">
                      <UserX className="w-4 h-4 text-black" />
                    </div>
                  )}
                </div>
              </div>

              {/* Suspicion dossier stats */}
              <div className="w-full mt-4 pt-3.5 border-t-3 border-black flex items-center justify-between text-[10px] font-mono font-bold text-black">
                <span>VOTE SUSPICION LEVEL</span>
                {votesForSuspect > 0 ? (
                  <span className="px-2 py-0.5 rounded bg-white border-3 border-black text-black font-mono shadow-flat">
                    {votesForSuspect} VOTE{votesForSuspect > 1 ? 'S' : ''}
                  </span>
                ) : (
                  <span className="text-black/40">CLEAR</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Tally controls */}
      <div className="glass-panel p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs font-mono">
          {hasVoted ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600 animate-pulse" />
              <span className="text-black font-bold uppercase tracking-wide">SUSPECT FILE TRANSMITTED. AWAITING FEEDBACK...</span>
            </>
          ) : (
            <span className="text-black uppercase">SELECT AN AGENT CARD TO CAST DEPOSIT ON SUSPECT.</span>
          )}
        </div>

        {isHost && (
          <button
            onClick={onForceTally}
            className="btn py-2.5 px-5 text-xs bg-white text-black border-3 border-black shadow-flat"
            title="Force immediate review"
          >
            <FastForward className="w-3.5 h-3.5 inline mr-1 text-black" />
            <span>FORCE EJECTION DEBATE</span>
          </button>
        )}
      </div>
    </div>
  );
};
