import React from 'react';
import { motion } from 'motion/react';

interface SegmentOption<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface IOSSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}

export function IOSSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = ''
}: IOSSegmentedControlProps<T>) {
  return (
    <div
      className={`relative p-1 bg-[#1c1c1e] rounded-[10px] flex items-center border border-white/10 select-none ${className}`}
    >
      {options.map((option) => {
        const isSelected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className="relative flex-1 py-1.5 px-3 text-[13px] font-medium text-center z-10 transition-colors duration-150 flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            {isSelected && (
              <motion.div
                layoutId="ios-segmented-pill"
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="absolute inset-0 bg-[#3a3a3c] rounded-[7px] shadow-sm -z-10"
              />
            )}
            {option.icon && <span className="opacity-90">{option.icon}</span>}
            <span
              className={`${
                isSelected ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {option.label}
            </span>
            {option.count !== undefined && option.count > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-zinc-400'
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
