'use client';

import React from 'react';

interface WordBannerProps {
  role?: 'IMPOSTER' | 'ARTIST';
  secretWord?: string;
  category?: string;
}

export const WordBanner: React.FC<WordBannerProps> = ({ role, secretWord }) => {
  const isImposter = role === 'IMPOSTER';

  return (
    <div className="w-full flex justify-center mb-6">
      <div 
        className="peach-pill-badge rounded-text"
        style={isImposter ? { color: '#ff0055', borderColor: '#ff0055' } : {}}
      >
        {isImposter ? (
          <span className="font-extrabold uppercase" style={{ color: '#ff0055' }}>YOU ARE AN IMPOSTER</span>
        ) : (
          <span>word: {secretWord?.toLowerCase() || 'chair'}</span>
        )}
      </div>
    </div>
  );
};
