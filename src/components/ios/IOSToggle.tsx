import React from 'react';
import { motion } from 'motion/react';

interface IOSToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  color?: 'green' | 'gold' | 'blue';
}

export const IOSToggle: React.FC<IOSToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  color = 'gold'
}) => {
  const activeBg =
    color === 'gold' ? 'bg-[#c5a059]' : color === 'blue' ? 'bg-[#0a84ff]' : 'bg-[#34c759]';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? activeBg : 'bg-[#39393d]'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`pointer-events-none inline-block h-[27px] w-[27px] rounded-full bg-white shadow-md transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};
