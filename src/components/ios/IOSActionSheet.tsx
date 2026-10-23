import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface ActionSheetOption {
  text: string;
  subtext?: string;
  icon?: React.ReactNode;
  style?: 'default' | 'destructive';
  onClick: () => void;
}

interface IOSActionSheetProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelText?: string;
  onClose: () => void;
}

export const IOSActionSheet: React.FC<IOSActionSheetProps> = ({
  isOpen,
  title,
  message,
  options,
  cancelText = 'Cancelar',
  onClose
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end p-3 pb-8">
          {/* Dimmed backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Action Sheet Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative z-10 w-full max-w-md mx-auto space-y-2 select-none"
          >
            {/* Options Group Box */}
            <div className="bg-[#2c2c2e]/90 backdrop-blur-2xl rounded-[16px] overflow-hidden border border-white/10 shadow-2xl">
              {(title || message) && (
                <div className="px-4 py-3 text-center border-b border-white/10">
                  {title && (
                    <h4 className="text-[13px] font-semibold text-zinc-400 uppercase tracking-wider">
                      {title}
                    </h4>
                  )}
                  {message && (
                    <p className="text-[12px] text-zinc-400 mt-0.5 leading-snug">
                      {message}
                    </p>
                  )}
                </div>
              )}

              {options.map((opt, idx) => {
                const isDestructive = opt.style === 'destructive';
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      opt.onClick();
                      onClose();
                    }}
                    className={`w-full px-4 py-3.5 flex items-center justify-center space-x-2 text-[17px] font-normal transition active:bg-white/15 ${
                      idx > 0 ? 'border-t border-white/10' : ''
                    } ${isDestructive ? 'text-[#ff453a]' : 'text-[#0a84ff]'}`}
                  >
                    {opt.icon && <span className="mr-1">{opt.icon}</span>}
                    <div className="text-center">
                      <div>{opt.text}</div>
                      {opt.subtext && (
                        <div className="text-[11px] text-zinc-400 font-normal">{opt.subtext}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Cancel Button (Separated pill, classic iOS) */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 bg-[#2c2c2e]/95 backdrop-blur-2xl rounded-[16px] text-[#0a84ff] font-semibold text-[17px] border border-white/10 shadow-xl active:bg-white/15 transition text-center"
            >
              {cancelText}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
