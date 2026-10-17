import React from 'react';

export type FrostedIconName =
  | 'path'
  | 'quests'
  | 'profile'
  | 'flame'
  | 'bolt'
  | 'target'
  | 'sound-on'
  | 'sound-off'
  | 'cloud'
  | 'lock'
  | 'star'
  | 'gift'
  | 'hat'
  | 'glasses'
  | 'user'
  | 'trophy'
  | 'crown'
  | 'snowflake'
  | 'hint'
  | 'back'
  | 'reset';

interface FrostedIconProps {
  name?: FrostedIconName;
  size?: number; // width/height in px, default 34
  iconSize?: number; // inner symbol size, default 18
  glow?: boolean;
  active?: boolean;
  yellow?: boolean;
  variant?: 'yellow' | 'amber' | 'emerald' | 'cyan' | 'neutral';
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const FrostedIcon: React.FC<FrostedIconProps> = ({
  name,
  size = 36,
  iconSize = 18,
  glow = false,
  active = false,
  yellow,
  variant: propVariant = 'yellow',
  style,
  children,
}) => {
  const variant = yellow !== undefined ? (yellow ? 'yellow' : 'neutral') : propVariant;
  // Color presets for frosted glass inner tints and specular reflections
  const themeColors = {
    yellow: {
      border: active ? 'rgba(250, 204, 21, 0.7)' : 'rgba(250, 204, 21, 0.35)',
      bg: active
        ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.28) 0%, rgba(245, 158, 11, 0.12) 100%)'
        : 'linear-gradient(135deg, rgba(250, 204, 21, 0.15) 0%, rgba(28, 28, 32, 0.5) 100%)',
      glow: active
        ? '0 0 16px rgba(250, 204, 21, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
        : '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
      svgFill: '#FEF08A',
      svgStroke: '#FACC15',
    },
    amber: {
      border: active ? 'rgba(245, 158, 11, 0.7)' : 'rgba(245, 158, 11, 0.35)',
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(180, 83, 9, 0.12) 100%)',
      glow: active
        ? '0 0 14px rgba(245, 158, 11, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
        : '0 4px 10px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
      svgFill: '#FDE68A',
      svgStroke: '#F59E0B',
    },
    emerald: {
      border: active ? 'rgba(16, 185, 129, 0.7)' : 'rgba(16, 185, 129, 0.35)',
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(4, 120, 87, 0.12) 100%)',
      glow: '0 0 12px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
      svgFill: '#A7F3D0',
      svgStroke: '#10B981',
    },
    cyan: {
      border: 'rgba(56, 189, 248, 0.4)',
      bg: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(28, 28, 32, 0.5) 100%)',
      glow: '0 0 12px rgba(56, 189, 248, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
      svgFill: '#BAE6FD',
      svgStroke: '#38BDF8',
    },
    neutral: {
      border: 'rgba(255, 255, 255, 0.14)',
      bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(28, 28, 32, 0.5) 100%)',
      glow: '0 4px 10px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
      svgFill: '#F8FAFC',
      svgStroke: '#94A3B8',
    },
  }[variant];

  // Precision Vector Glass Icons
  const renderSvg = () => {
    switch (name) {
      case 'path':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6L9 3L15 6L21 3V18L15 21L9 18L3 21V6Z"
              stroke={themeColors.svgStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 3V18M15 6V21"
              stroke={themeColors.svgFill}
              strokeWidth="1.75"
              strokeDasharray="2 2"
            />
          </svg>
        );
      case 'quests':
      case 'target':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={themeColors.svgStroke} strokeWidth="2" />
            <circle cx="12" cy="12" r="5" stroke={themeColors.svgFill} strokeWidth="1.75" />
            <circle cx="12" cy="12" r="2" fill={themeColors.svgStroke} />
          </svg>
        );
      case 'profile':
      case 'user':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4.5" stroke={themeColors.svgStroke} strokeWidth="2" fill="rgba(255,255,255,0.08)" />
            <path
              d="M5 20C5 16.5 8.1 14 12 14C15.9 14 19 16.5 19 20"
              stroke={themeColors.svgFill}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );
      case 'flame':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C12 2 15 5.5 15 8C15 9.5 14.2 10.8 13 11.5C13 8 10 7 10 7C10 10.5 7.5 12.5 7.5 15C7.5 18 9.5 20.5 12 20.5C15.5 20.5 18.5 18 18.5 14C18.5 9 14.5 5 12 2Z"
              fill={themeColors.svgFill}
              stroke={themeColors.svgStroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'bolt':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
              fill={themeColors.svgFill}
              stroke={themeColors.svgStroke}
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'sound-on':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path
              d="M11 5L6 9H2V15H6L11 19V5Z"
              fill={themeColors.svgFill}
              stroke={themeColors.svgStroke}
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path
              d="M15.5 8.5C16.8 9.8 17.5 11.5 17.5 12C17.5 12.5 16.8 14.2 15.5 15.5M18.5 5.5C20.6 7.6 21.5 9.8 21.5 12C21.5 14.2 20.6 16.4 18.5 18.5"
              stroke={themeColors.svgStroke}
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        );
      case 'sound-off':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path
              d="M11 5L6 9H2V15H6L11 19V5Z"
              stroke="#64748B"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <line x1="23" y1="9" x2="17" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            <line x1="17" y1="9" x2="23" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'cloud':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path
              d="M18 10H17.2C16.7 7.1 14.2 5 11.2 5C8.8 5 6.7 6.4 5.8 8.6C3.6 9 2 10.9 2 13.2C2 15.9 4.1 18 6.8 18H18C20.2 18 22 16.2 22 14C22 11.8 20.2 10 18 10Z"
              fill="rgba(56, 189, 248, 0.2)"
              stroke={themeColors.svgStroke}
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'lock':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <rect
              x="5"
              y="10"
              width="14"
              height="11"
              rx="3"
              fill="rgba(255, 255, 255, 0.1)"
              stroke={themeColors.svgStroke}
              strokeWidth="1.75"
            />
            <path
              d="M8 10V6.5C8 4.6 9.8 3 12 3C14.2 3 16 4.6 16 6.5V10"
              stroke={themeColors.svgFill}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="15.5" r="1.5" fill={themeColors.svgStroke} />
          </svg>
        );
      case 'star':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L15.1 8.3L22 9.3L17 14.1L18.2 21L12 17.8L5.8 21L7 14.1L2 9.3L8.9 8.3L12 2Z"
              fill={themeColors.svgFill}
              stroke={themeColors.svgStroke}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'gift':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="10" width="18" height="11" rx="2" fill="rgba(250, 204, 21, 0.15)" stroke={themeColors.svgStroke} strokeWidth="1.75" />
            <path d="M12 10V21" stroke={themeColors.svgFill} strokeWidth="2" />
            <rect x="2" y="6" width="20" height="4" rx="1.5" fill={themeColors.svgStroke} />
            <path d="M12 6C12 6 9 3 7 4.5C5 6 8 8 12 6ZM12 6C12 6 15 3 17 4.5C19 6 16 8 12 6Z" stroke={themeColors.svgFill} strokeWidth="1.5" />
          </svg>
        );
      case 'snowflake':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="2" x2="12" y2="22" stroke={themeColors.svgStroke} strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="12" x2="22" y2="12" stroke={themeColors.svgStroke} strokeWidth="2" strokeLinecap="round" />
            <line x1="4.9" y1="4.9" x2="19.1" y2="19.1" stroke={themeColors.svgStroke} strokeWidth="2" strokeLinecap="round" />
            <line x1="19.1" y1="4.9" x2="4.9" y2="19.1" stroke={themeColors.svgStroke} strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'trophy':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path d="M6 3H18V9C18 12.3 15.3 15 12 15C8.7 15 6 12.3 6 9V3Z" fill="rgba(250, 204, 21, 0.2)" stroke={themeColors.svgStroke} strokeWidth="1.75" />
            <path d="M6 5H3C2.4 5 2 5.4 2 6V7C2 9.2 3.8 11 6 11V11" stroke={themeColors.svgFill} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18 5H21C21.6 5 22 5.4 22 6V7C22 9.2 20.2 11 18 11V11" stroke={themeColors.svgFill} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 15V19M8 21H16" stroke={themeColors.svgStroke} strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'crown':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path
              d="M3 18L5 8L9.5 13L12 4L14.5 13L19 8L21 18H3Z"
              fill={themeColors.svgFill}
              stroke={themeColors.svgStroke}
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="4" r="1.2" fill="#FFFFFF" />
            <circle cx="5" cy="8" r="1.2" fill="#FFFFFF" />
            <circle cx="19" cy="8" r="1.2" fill="#FFFFFF" />
          </svg>
        );
      case 'hat':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path d="M4 17C4 17 5 12 12 12C19 12 20 17 20 17" fill="rgba(250, 204, 21, 0.25)" stroke={themeColors.svgStroke} strokeWidth="2" strokeLinecap="round" />
            <path d="M2 18H22" stroke={themeColors.svgFill} strokeWidth="2" strokeLinecap="round" />
            <path d="M12 7V12" stroke={themeColors.svgStroke} strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'glasses':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <circle cx="7" cy="13" r="4" fill="rgba(56, 189, 248, 0.25)" stroke={themeColors.svgStroke} strokeWidth="2" />
            <circle cx="17" cy="13" r="4" fill="rgba(56, 189, 248, 0.25)" stroke={themeColors.svgStroke} strokeWidth="2" />
            <path d="M11 13H13" stroke={themeColors.svgFill} strokeWidth="2" />
            <path d="M3 12L2 9M21 12L22 9" stroke={themeColors.svgStroke} strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'hint':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C8.1 2 5 5.1 5 9C5 11.4 6.2 13.5 8 14.7V17C8 17.6 8.4 18 9 18H15C15.6 18 16 17.6 16 17V14.7C17.8 13.5 19 11.4 19 9C19 5.1 15.9 2 12 2Z"
              fill={themeColors.svgFill}
              stroke={themeColors.svgStroke}
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <line x1="10" y1="21" x2="14" y2="21" stroke={themeColors.svgStroke} strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'back':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={themeColors.svgStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'reset':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            <path d="M3 12C3 7 7 3 12 3C16.4 3 20 6.6 20.8 11M21 12C21 17 17 21 12 21C7.6 21 4 17.4 3.2 13" stroke={themeColors.svgStroke} strokeWidth="2" strokeLinecap="round" />
            <polyline points="21 7 21 12 16 12" stroke={themeColors.svgFill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return children;
    }
  };

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: size <= 40 ? '12px' : '16px',
        background: themeColors.bg,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1.25px solid ${themeColors.border}`,
        boxShadow: themeColors.glow,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Specular curved gloss highlight across top edge of glass */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '46%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.02) 100%)',
          borderTopLeftRadius: 'inherit',
          borderTopRightRadius: 'inherit',
          pointerEvents: 'none',
        }}
      />
      {/* Inner Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          filter: glow ? `drop-shadow(0 0 6px ${themeColors.svgStroke})` : 'none',
        }}
      >
        {renderSvg()}
      </div>
    </div>
  );
};
