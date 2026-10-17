import React, { useState } from 'react';
import { LearnCard } from '../../levels/types';
import { Button } from '../common/Button';
import { Mascot } from '../common/Mascot';

interface LearnStepProps {
  cards: LearnCard[];
  levelTitle: string;
  concept: string;
  onComplete: () => void;
}

export const LearnStep: React.FC<LearnStepProps> = ({
  cards,
  levelTitle,
  concept,
  onComplete,
}) => {
  const [cardIndex, setCardIndex] = useState(0);

  // If level doesn't define custom cards, provide a default concept card
  const displayCards: LearnCard[] = cards.length > 0
    ? cards
    : [
        {
          title: 'Core Concept',
          text: concept,
        },
      ];

  const currentCard = displayCards[cardIndex];
  const isLastCard = cardIndex >= displayCards.length - 1;

  const handleNext = () => {
    if (isLastCard) {
      onComplete();
    } else {
      setCardIndex((prev) => prev + 1);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '440px',
        minHeight: '440px',
        padding: '16px 12px',
        gap: '20px',
      }}
    >
      <div style={{ textAlign: 'center', width: '100%' }}>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'var(--color-2)',
            textTransform: 'uppercase',
          }}
        >
          Step 1: Learn the Concept
        </span>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
          {levelTitle}
        </h2>
      </div>

      {/* Mascot Presentation */}
      <Mascot mood="idle" size={90} />

      {/* Interactive Frosted Glass Concept Card */}
      <div
        className="glass-card-yellow"
        style={{
          width: '100%',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-1)' }}>
            {currentCard.title}
          </h3>
          {displayCards.length > 1 && (
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
              {cardIndex + 1} / {displayCards.length}
            </span>
          )}
        </div>

        <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5' }}>
          {currentCard.text}
        </p>

        {/* Animated Visual Diagram for Concept */}
        <div
          style={{
            width: '100%',
            height: '75px',
            backgroundColor: 'var(--color-bg-canvas)',
            borderRadius: '12px',
            border: '1px solid var(--color-bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '6px',
            padding: '4px',
          }}
        >
          <svg width="240" height="50" viewBox="0 0 240 50">
            {/* Left Rail */}
            <line x1="20" y1="5" x2="20" y2="45" stroke="#65AABB" strokeWidth="3" />
            {/* Contact */}
            <line x1="20" y1="25" x2="90" y2="25" stroke="#BB65AA" strokeWidth="2.5" />
            <line x1="90" y1="15" x2="90" y2="35" stroke="#BB65AA" strokeWidth="3" />
            <line x1="110" y1="15" x2="110" y2="35" stroke="#BB65AA" strokeWidth="3" />
            {/* Load */}
            <line x1="110" y1="25" x2="170" y2="25" stroke="#BB65AA" strokeWidth="2.5" />
            <circle cx="185" cy="25" r="12" fill="#17242a" stroke="#AABB65" strokeWidth="2.5" />
            <text x="185" y="29" fill="#AABB65" fontSize="10" fontWeight="900" textAnchor="middle">
              ⚡
            </text>
            {/* Right Rail */}
            <line x1="200" y1="25" x2="220" y2="25" stroke="#64748b" strokeWidth="2.5" />
            <line x1="220" y1="5" x2="220" y2="45" stroke="#64748b" strokeWidth="3" />
          </svg>
        </div>
      </div>

      <div style={{ width: '100%' }}>
        <Button variant="primary" fullWidth size="lg" onClick={handleNext}>
          {isLastCard ? 'Guided Try →' : 'Next Card →'}
        </Button>
      </div>
    </div>
  );
};
