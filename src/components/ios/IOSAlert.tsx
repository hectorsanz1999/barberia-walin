import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface AlertAction {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onClick: () => void;
}

export interface IOSAlertProps {
  isOpen: boolean;
  title: string;
  message?: string;
  actions: AlertAction[];
  onClose?: () => void;
}

export const IOSAlert: React.FC<IOSAlertProps> = ({
  isOpen,
  title,
  message,
  actions,
  onClose
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dimmed backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* iOS Alert Box */}
          <motion.div
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="relative w-full max-w-[280px] bg-[#252529]/90 backdrop-blur-2xl text-white rounded-[19px] overflow-hidden shadow-2xl border border-white/10 text-center"
          >
            {/* Header Content */}
            <div className="px-5 pt-5 pb-4">
              <h3 className="text-[17px] font-semibold text-white tracking-tight leading-snug">
                {title}
              </h3>
              {message && (
                <p className="mt-1 text-[13px] text-zinc-300 leading-normal font-normal">
                  {message}
                </p>
              )}
            </div>

            {/* Actions Grid */}
            <div
              className={`border-t border-white/15 grid ${
                actions.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {actions.map((action, idx) => {
                const isDestructive = action.style === 'destructive';
                const isCancel = action.style === 'cancel';
                const isLeftOfTwo = actions.length === 2 && idx === 0;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      action.onClick();
                      if (onClose) onClose();
                    }}
                    className={`py-3 text-[16px] transition-colors active:bg-white/10 ${
                      isLeftOfTwo ? 'border-r border-white/15' : ''
                    } ${idx > 0 && actions.length !== 2 ? 'border-t border-white/15' : ''} ${
                      isDestructive
                        ? 'text-[#ff453a] font-medium'
                        : isCancel
                        ? 'text-[#0a84ff] font-semibold'
                        : 'text-[#0a84ff] font-normal hover:text-white'
                    }`}
                  >
                    {action.text}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
