'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { PlusCircle, LogIn, Sparkles, Eye, ShieldAlert, Palette, Check, User, AlertTriangle } from 'lucide-react';
import { soundEffects } from '@/lib/AudioEffects';

const AVATAR_COLORS = [
  '#00f0ff', // Cyber Cyan
  '#ff0055', // Imposter Pink
  '#ffb700', // Gold Dust
  '#00ff66', // Emerald
  '#bd00ff', // Neon Purple
  '#ffffff'  // Ghost White
];

export default function LandingPage() {
  const router = useRouter();

  // Unified mode selection: 'create' | 'join'
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  // Input states
  const [name, setName] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('#00f0ff');
  const [joinCode, setJoinCode] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTabChange = (tab: 'create' | 'join') => {
    setActiveTab(tab);
    setErrorMessage(null);
    soundEffects.playClick();
  };

  const handleColorSelect = (col: string) => {
    setSelectedColor(col);
    soundEffects.playClick();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMessage(null);
    setLoading(true);
    soundEffects.playClick();

    const finalName = name.trim() || (activeTab === 'create' ? 'Chief Detective' : 'Agent');

    if (activeTab === 'create') {
      try {
        const res = await fetch('/api/room/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostName: finalName,
            hostColor: selectedColor
          })
        });
        const data = await res.json();
        if (data.success && data.code) {
          localStorage.setItem(`kti_player_${data.code}`, data.playerId);
          router.push(`/room/${data.code}`);
        } else {
          setErrorMessage('Failed to create case file. Try again.');
          setLoading(false);
        }
      } catch {
        setErrorMessage('Network error during terminal creation.');
        setLoading(false);
      }
    } else {
      const cleanCode = joinCode.toUpperCase().trim();
      if (!cleanCode) {
        setErrorMessage('Emergency Join Code is required.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/room/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: cleanCode,
            playerName: finalName,
            playerColor: selectedColor
          })
        });
        const data = await res.json();
        if (data.success && data.code) {
          localStorage.setItem(`kti_player_${data.code}`, data.playerId);
          router.push(`/room/${data.code}`);
        } else {
          setErrorMessage(data.error || 'Failed to access active case.');
          setLoading(false);
        }
      } catch {
        setErrorMessage('Unable to connect to security mainframe.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative z-10 flex flex-col justify-center items-center">
        {/* Title */}
        <div className="text-center mb-10 max-w-3xl">
          <h1 className="pixel-title text-4xl sm:text-5xl font-extrabold text-black mb-4">
            KILL THE IMPOSTER
          </h1>
        </div>

        {/* Unified Portal Grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch mb-16">
          {/* Avatar Preview Panel (Left 2 cols) */}
          <div className="lg:col-span-2 glass-panel p-6 flex flex-col justify-between items-center text-center relative overflow-hidden">
            <div className="w-full">
              <span className="text-[10px] text-black font-mono font-bold tracking-widest block uppercase mb-4">
                Dossier Preview
              </span>
              
              {/* Dynamic Interactive Avatar */}
              <div className="relative w-36 h-36 mx-auto my-6 flex items-center justify-center">
                <div 
                  className="absolute inset-0 rounded-full border-3 border-black border-dashed animate-[spin_20s_linear_infinite]"
                  style={{ borderColor: selectedColor }}
                />
                <div 
                  className="absolute inset-2 rounded-full border-3 border-black bg-white flex items-center justify-center shadow-flat transition-all duration-300"
                >
                  <User className="w-16 h-16 transition-colors duration-300" style={{ color: selectedColor }} />
                </div>
              </div>
            </div>

            <div className="w-full bg-[#f0f0f5] border-3 border-black rounded-2xl p-4 mt-4 shadow-flat">
              <span className="text-[10px] text-black block uppercase font-bold tracking-wide">
                Agent Classification
              </span>
              <div 
                className="font-black text-xl tracking-tight truncate max-w-full my-1"
                style={{ color: selectedColor }}
              >
                {(name.trim() || (activeTab === 'create' ? 'CHIEF DETECTIVE' : 'AGENT')).toUpperCase()}
              </div>
              <div className="text-[10px] text-black font-mono">
                COLOR_ID: {selectedColor.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Form Options Switcher Panel (Right 3 cols) */}
          <div className="lg:col-span-3 glass-panel p-6 sm:p-8 flex flex-col justify-between relative">
            <div>
              {/* Sliding Custom Tabs */}
              <div className="grid grid-cols-2 p-1.5 bg-black/5 border-3 border-black rounded-2xl mb-6 shadow-flat">
                <button
                  type="button"
                  onClick={() => handleTabChange('create')}
                  className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-3 ${
                    activeTab === 'create'
                      ? 'bg-white text-black border-black shadow-flat'
                      : 'text-black border-transparent hover:bg-black/5'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-black" />
                  <span>Host Game</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('join')}
                  className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-3 ${
                    activeTab === 'join'
                      ? 'bg-white text-black border-black shadow-flat'
                      : 'text-black border-transparent hover:bg-black/5'
                  }`}
                >
                  <LogIn className="w-4 h-4 text-black" />
                  <span>Join Game</span>
                </button>
              </div>

              {/* Dynamic Action Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'join' && (
                  <div>
                    <label className="text-xs font-bold uppercase text-black tracking-wider block mb-2">
                      Access Invite Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. IMP-482"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="input-field text-center font-mono font-black text-xl uppercase tracking-widest text-black border-3 border-black focus:shadow-flat"
                      maxLength={7}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold uppercase text-black tracking-wider block mb-2">
                    Detective Nickname
                  </label>
                  <input
                    type="text"
                    placeholder="Enter agent alias..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field border-3 border-black"
                    maxLength={16}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-black tracking-wider block mb-2">
                    Suit Color Identity
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {AVATAR_COLORS.map((col) => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => handleColorSelect(col)}
                        className={`w-9 h-9 rounded-xl border-3 border-black transition-all flex items-center justify-center ${
                          selectedColor === col
                            ? 'scale-110 shadow-flat'
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                        style={{ backgroundColor: col }}
                      >
                        {selectedColor === col && <Check className="w-4 h-4 text-black stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-2xl bg-[rgba(255,0,85,0.1)] border-3 border-black text-xs text-black font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-black" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-full py-4 text-sm tracking-widest font-black mt-4"
                >
                  {loading 
                    ? (activeTab === 'create' ? 'CREATING LOBBY...' : 'ACCESSING CASE...')
                    : (activeTab === 'create' ? 'INITIATE NEW CASE' : 'AUTHORIZE INTRUSION')
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
