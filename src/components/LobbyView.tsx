'use client';

import React, { useState } from 'react';
import { RoomState } from '@/lib/types';
import { Copy, Check, Users, Bot, Play, Share2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '@/lib/AudioEffects';

interface LobbyViewProps {
  room: RoomState;
  playerId: string;
  onAddBot: () => void;
  onStartMatch: () => void;
  onUpdateSettings: (settings: { maxRounds?: number; turnDurationSeconds?: number }) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  playerId,
  onAddBot,
  onStartMatch,
  onUpdateSettings
}) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const currentPlayer = room.players.find(p => p.id === playerId);
  const isHost = currentPlayer?.isHost || false;
  const canStart = room.players.length >= 3;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    soundEffects.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyInviteLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/room/${room.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    soundEffects.playClick();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* High-Tech Terminal Banner */}
      <div className="glass-panel p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge text-[10px] tracking-widest font-mono">
                ROOM STATUS: ACTIVE
              </span>
            </div>
            <h1 className="pixel-title text-2xl sm:text-3xl font-extrabold text-black">
              Investigation Lobby
            </h1>
            <p className="text-sm text-black rounded-text font-bold mt-1.5">
              Share the invite details below. A minimum of 3 investigators are required to decode the drawing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Room Code Indicator */}
            <div className="flex items-center gap-2.5 px-4.5 py-3 rounded-2xl bg-white border-3 border-black shadow-flat">
              <div>
                <div className="text-[9px] text-black font-mono uppercase tracking-wider">CASE CODE</div>
                <div className="font-mono font-black text-xl text-black tracking-widest">{room.code}</div>
              </div>
              <button
                onClick={copyRoomCode}
                className="p-2 rounded-xl bg-[#f0f0f5] border-3 border-black text-black transition-all ml-2 shadow-flat"
                title="Copy Code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Copy Invite Link */}
            <button
              onClick={copyInviteLink}
              className="btn py-3.5 px-5 text-xs flex items-center gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4 text-black" />}
              <span>{copiedLink ? 'COPIED!' : 'SHARE LINK'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Active Investigator list (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6 border-b-3 border-black pb-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-black" />
                <h3 className="text-sm font-bold text-black font-mono uppercase tracking-wider">
                  Investigating Agents ({room.players.length})
                </h3>
              </div>

              <button
                onClick={onAddBot}
                className="btn py-2 px-4 text-xs bg-[#f0f0f5]"
              >
                <Bot className="w-4 h-4 inline mr-1 text-black" />
                <span>+ ADD AI BOT</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {room.players.map((player) => {
                const isMe = player.id === playerId;
                return (
                  <div
                    key={player.id}
                    className={`p-4 rounded-2xl border-3 border-black transition-all flex items-center justify-between relative overflow-hidden ${
                      isMe
                        ? 'bg-[#eef2ff] shadow-flat'
                        : 'bg-white shadow-flat'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Custom themed avatar dot */}
                      <div
                        className="avatar-circle font-black text-white shrink-0 border-3 border-black shadow-flat"
                        style={{ backgroundColor: player.avatarColor }}
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-black text-base truncate max-w-[120px]">{player.name}</span>
                          {isMe && <span className="text-[8px] bg-white border-2 border-black px-1.5 py-0.5 rounded font-bold font-mono">YOU</span>}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px]">
                          {player.isHost && <span className="badge bg-[#FCE1A8] py-0.5">HOST</span>}
                          {player.isBot && <span className="badge bg-[#A1F2EC] py-0.5">AI BOT</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                );
              })}
            </div>

            {!canStart && (
              <div className="mt-6 p-4 rounded-2xl bg-[#FADCC8] border-3 border-black flex items-center justify-between gap-4 shadow-flat">
                <p className="text-xs text-black font-bold leading-relaxed flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-black" />
                  <span>The case requires at least 3 active agents to start. Click + ADD AI BOT to auto-fill.</span>
                </p>
                <button
                  onClick={onAddBot}
                  className="btn py-2 px-4 text-xs bg-white text-black font-black"
                >
                  ADD BOT
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mission controls (Right 1 col) */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2.5 mb-6 border-b-3 border-black pb-4">
              <h3 className="text-sm font-bold text-black font-mono uppercase tracking-wider">Specs Setup</h3>
            </div>

            <div className="space-y-6">
              {/* Max Rounds Option */}
              <div>
                <label className="text-[10px] font-bold font-mono text-black tracking-widest block uppercase mb-2">
                  Investigation Rounds
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((r) => (
                    <button
                      key={r}
                      disabled={!isHost}
                      onClick={() => onUpdateSettings({ maxRounds: r })}
                      className={`py-2 rounded-xl font-bold font-mono text-xs border-3 border-black shadow-flat transition-all ${
                        room.settings.maxRounds === r
                          ? 'bg-[#38C8FF] text-white'
                          : 'bg-white text-black hover:bg-black/5'
                      }`}
                    >
                      {r} {r === 1 ? 'RD' : 'RDS'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Turn Time limit */}
              <div>
                <label className="text-[10px] font-bold font-mono text-black tracking-widest block uppercase mb-2">
                  Ink Draw Limit Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 25, 40].map((s) => (
                    <button
                      key={s}
                      disabled={!isHost}
                      onClick={() => onUpdateSettings({ turnDurationSeconds: s })}
                      className={`py-2 rounded-xl font-bold font-mono text-xs border-3 border-black shadow-flat transition-all ${
                        room.settings.turnDurationSeconds === s
                          ? 'bg-[#38C8FF] text-white'
                          : 'bg-white text-black hover:bg-black/5'
                      }`}
                    >
                      {s}S
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="mt-8 pt-6 border-t-3 border-black">
              {isHost ? (
                <button
                  disabled={!canStart}
                  onClick={onStartMatch}
                  className="btn btn-finish-cyan w-full py-4 text-sm font-black flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>START MATCH</span>
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-white border-3 border-black text-center text-xs text-black font-mono">
                  WAITING FOR CHIEF TO LAUNCH...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
