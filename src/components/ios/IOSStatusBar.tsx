import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

interface IOSStatusBarProps {
  dark?: boolean;
}

export const IOSStatusBar: React.FC<IOSStatusBarProps> = () => {
  const [time, setTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-7 pt-3 pb-1 text-white text-xs font-semibold tracking-tight select-none z-50 pointer-events-none">
      {/* Time */}
      <span className="text-[14px] font-semibold tracking-normal">{time}</span>

      {/* Sensor / Speaker notch gap */}
      <div className="w-20" />

      {/* Icons: Cell, Wifi, Battery */}
      <div className="flex items-center space-x-2">
        <div className="flex items-end space-x-[2px] h-3">
          <div className="w-[3px] h-1.5 bg-white rounded-[0.5px]"></div>
          <div className="w-[3px] h-2 bg-white rounded-[0.5px]"></div>
          <div className="w-[3px] h-2.5 bg-white rounded-[0.5px]"></div>
          <div className="w-[3px] h-3 bg-white rounded-[0.5px]"></div>
        </div>
        <span className="text-[11px] font-bold">5G</span>
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center space-x-[1px]">
          <div className="w-5 h-2.5 border border-white/80 rounded-[3px] p-[1px] flex items-center">
            <div className="h-full w-4 bg-white rounded-[1.5px]" />
          </div>
          <div className="w-[2px] h-1 bg-white/80 rounded-r-sm" />
        </div>
      </div>
    </div>
  );
};
