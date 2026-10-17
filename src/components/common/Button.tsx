import React from 'react';
import { haptics } from '../../utils/haptics';
import { sound } from '../../utils/sound';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  style = {},
  onClick,
  ...props
}) => {
  const variantClass = `pressable-btn-${variant}`;
  const widthStyle = fullWidth ? { width: '100%' } : {};
  const sizeStyle =
    size === 'sm'
      ? { padding: '8px 14px', fontSize: '0.85rem' }
      : size === 'lg'
      ? { padding: '15px 26px', fontSize: '1.1rem' }
      : { padding: '12px 20px', fontSize: '0.96rem' };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    haptics.tap();
    sound.playTap();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`pressable-btn ${variantClass} ${className}`}
      style={{ ...widthStyle, ...sizeStyle, ...style }}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
