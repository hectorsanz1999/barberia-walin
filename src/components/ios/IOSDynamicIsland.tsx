import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Clock, Sparkles, Scissors, Info } from 'lucide-react';

export interface DynamicIslandNotification {
  id: string;
  title: string;
  subtitle?: string;
  icon?: 'success' | 'booking' | 'time' | 'info';
  duration?: number;
}

interface IOSDynamicIslandProps {
  notification: DynamicIslandNotification | null;
  onDismiss?: () => void;
}

export const IOSDynamicIsland: React.FC<IOSDynamicIslandProps> = ({ notification }) => {
  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <AnimatePresence mode="wait">
        {notification ? (
          <motion.div
            key={notification.id}
            initial={{ width: 120, height: 32, borderRadius: 20 }}
            animate={{ width: 280, height: 48, borderRadius: 24 }}
            exit={{ width: 120, height: 32, borderRadius: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="bg-black text-white px-3.5 py-1.5 shadow-2xl flex items-center justify-between border border-white/10 overflow-hidden cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-[#c5a059]/20 flex items-center justify-center text-[#c5a059] shrink-0">
                {notification.icon === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {notification.icon === 'booking' && <Scissors className="w-4 h-4 text-[#c5a059]" />}
                {notification.icon === 'time' && <Clock className="w-4 h-4 text-amber-400" />}
                {(!notification.icon || notification.icon === 'info') && <Sparkles className="w-4 h-4 text-sky-400" />}
              </div>
              <div className="leading-tight">
                <p className="text-[12px] font-semibold text-white tracking-tight truncate max-w-[170px]">
                  {notification.title}
                </p>
                {notification.subtitle && (
                  <p className="text-[10px] text-zinc-400 truncate max-w-[170px]">
                    {notification.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Pulsing indicator */}
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
          </motion.div>
        ) : (
          <motion.div
            layout
            initial={false}
            animate={{ width: 110, height: 28, borderRadius: 20 }}
            className="bg-black border border-white/5 shadow-md flex items-center justify-center space-x-3 px-2"
          >
            {/* Small hardware notch representation */}
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#0a1826]/80 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-500/60" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
