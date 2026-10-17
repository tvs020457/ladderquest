import React from 'react';

export type MascotMood = 'idle' | 'celebrate' | 'tilt' | 'thinking';

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  cosmetic?: 'none' | 'hard_hat' | 'safety_glasses';
}

export const Mascot: React.FC<MascotProps> = ({
  mood = 'idle',
  size = 120,
  cosmetic = 'none',
}) => {
  // Tilt transform for failing/confused states
  const rotation = mood === 'tilt' ? -15 : 0;
  const bounceClass = mood === 'celebrate' ? 'mascot-bounce' : '';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease',
      }}
      className={bounceClass}
      aria-label={`Volt the Relay character (${mood})`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Terminal Prongs at Bottom */}
        <rect x="35" y="85" width="6" height="10" rx="2" fill="#94a3b8" />
        <rect x="59" y="85" width="6" height="10" rx="2" fill="#94a3b8" />

        {/* Clear Industrial Relay Enclosure */}
        <rect
          x="18"
          y="18"
          width="64"
          height="68"
          rx="12"
          fill="#17242a"
          stroke="#65AABB"
          strokeWidth="3"
        />

        {/* Copper / Orchid Coil Windings */}
        <g stroke="#BB65AA" strokeWidth="2.5" strokeLinecap="round">
          <line x1="28" y1="62" x2="72" y2="62" />
          <line x1="28" y1="68" x2="72" y2="68" />
          <line x1="28" y1="74" x2="72" y2="74" />
        </g>

        {/* Electromagnetic Core */}
        <rect x="44" y="58" width="12" height="20" rx="2" fill="#23353e" />

        {/* Armature / Contact Lever */}
        <path
          d={
            mood === 'celebrate'
              ? 'M 28 36 Q 50 24 72 36'
              : mood === 'tilt'
              ? 'M 28 42 Q 50 34 72 40'
              : 'M 28 38 Q 50 32 72 38'
          }
          stroke="#BB65AA"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Eyes (LEDs) */}
        {mood === 'celebrate' ? (
          // Happy squinting curves
          <g stroke="#AABB65" strokeWidth="3" strokeLinecap="round">
            <path d="M 33 46 Q 38 41 43 46" />
            <path d="M 57 46 Q 62 41 67 46" />
          </g>
        ) : mood === 'tilt' ? (
          // Puzzled uneven eyes
          <g fill="#BB65AA">
            <circle cx="38" cy="46" r="4.5" />
            <circle cx="62" cy="44" r="3" />
          </g>
        ) : (
          // Bright friendly circular LED eyes
          <g fill="#65AABB">
            <circle cx="38" cy="46" r="4" />
            <circle cx="62" cy="46" r="4" />
            <circle cx="39.5" cy="44.5" r="1.5" fill="#ffffff" />
            <circle cx="63.5" cy="44.5" r="1.5" fill="#ffffff" />
          </g>
        )}

        {/* Smile */}
        <path
          d={
            mood === 'celebrate'
              ? 'M 42 53 Q 50 61 58 53'
              : mood === 'tilt'
              ? 'M 45 54 Q 50 51 55 54'
              : 'M 44 53 Q 50 58 56 53'
          }
          stroke={mood === 'celebrate' ? '#AABB65' : '#ffffff'}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Cosmetics */}
        {cosmetic === 'hard_hat' && (
          <path
            d="M 22 22 Q 50 4 78 22 L 82 25 L 18 25 Z"
            fill="#AABB65"
            stroke="#6e7c35"
            strokeWidth="2"
          />
        )}
        {cosmetic === 'safety_glasses' && (
          <g stroke="#65AABB" strokeWidth="2" fill="none">
            <rect x="30" y="40" width="16" height="12" rx="3" fill="rgba(101, 170, 187, 0.2)" />
            <rect x="54" y="40" width="16" height="12" rx="3" fill="rgba(101, 170, 187, 0.2)" />
            <line x1="46" y1="46" x2="54" y2="46" />
          </g>
        )}
      </svg>
    </div>
  );
};
