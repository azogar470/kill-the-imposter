'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, X } from 'lucide-react';
import { soundEffects } from '@/lib/AudioEffects';

interface NavbarProps {
  roomCode?: string;
  playerName?: string;
  onLeaveRoom?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ roomCode, playerName, onLeaveRoom }) => {
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [showRules, setShowRules] = useState<boolean>(false);

  const toggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    soundEffects.setEnabled(nextState);
    if (nextState) {
      soundEffects.playClick();
    }
  };

  return (
    <>
      <header className="w-full py-4 px-6 border-b-3 border-black bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Actions */}
          <div className="flex items-center gap-3">
            {roomCode && (
              <div className="neo-sticker-btn py-1.5 px-3.5 select-none hover:transform-none">
                ROOM: {roomCode}
              </div>
            )}
          </div>

          {/* Centered Retro Pixel Title */}
          <h1 className="pixel-title text-2xl sm:text-3xl font-extrabold text-black tracking-tight text-center">
            KILL THE IMPOSTER
          </h1>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRules(true)}
              className="neo-sticker-btn py-2 px-3 text-[10px]"
              title="How to Play"
            >
              <HelpCircle className="w-4 h-4 mr-1 inline" />
              RULES
            </button>

            <button
              onClick={toggleSound}
              className="neo-sticker-btn py-2 px-3 text-[10px]"
            >
              {soundOn ? <Volume2 className="w-4 h-4 inline text-black" /> : <VolumeX className="w-4 h-4 inline text-black" />}
            </button>

            {onLeaveRoom && (
              <button
                onClick={onLeaveRoom}
                className="neo-sticker-btn py-2 px-3.5 text-[10px] bg-red-400 hover:bg-red-500"
              >
                LEAVE
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-slide-in">
          <div className="neo-box max-w-lg w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 text-black hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="pixel-title text-lg font-bold">CASE PROTOCOLS</h2>
            </div>
            <div className="space-y-4 text-sm text-black leading-relaxed font-mono">
              <div className="p-3.5 rounded-xl border-2 border-black bg-[#FADCC8]">
                <h4 className="font-bold mb-1">1. Secret Word vs Imposter</h4>
                <p>
                  Artists receive a secret word. The Imposter only receives the word category and must draw convincingly to blend in.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border-2 border-black bg-[#FCE1A8]">
                <h4 className="font-bold mb-1">2. Ink Draw Limit</h4>
                <p>
                  Every investigator gets a limited amount of ink per turn. Keep drawing simple to avoid exposing the word.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border-2 border-black bg-[#A1F2EC]">
                <h4 className="font-bold mb-1">3. Identify & Vote</h4>
                <p>
                  Vote on the suspect you believe is the Imposter. Guess right to win; guess wrong and the Imposter wins!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
