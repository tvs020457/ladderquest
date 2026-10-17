import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'secondary';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  style = {},
  ...props
}) => {
  const variantClass = `pressable-btn-${variant}`;
  const widthStyle = fullWidth ? { width: '100%' } : {};
  const sizeStyle = size === 'lg' ? { padding: '14px 24px', fontSize: '1.1rem' } : {};

  return (
    <button
      className={`pressable-btn ${variantClass} ${className}`}
      style={{ ...widthStyle, ...sizeStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  );
};
