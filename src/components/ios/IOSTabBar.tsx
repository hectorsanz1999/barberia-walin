import React from 'react';
import { Home, Scissors, CalendarPlus, Clock, ShieldCheck } from 'lucide-react';

export type TabKey = 'home' | 'services' | 'book' | 'my-appointments' | 'admin';

interface IOSTabBarProps {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  pendingCount?: number;
  showAdminTab?: boolean;
}

export const IOSTabBar: React.FC<IOSTabBarProps> = ({
  currentTab,
  onTabChange,
  pendingCount = 0,
  showAdminTab = false
}) => {
  interface TabItem {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    isAction?: boolean;
  }

  // Base client tabs
  const baseTabs: TabItem[] = [
    { key: 'home', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { key: 'services', label: 'Servicios', icon: <Scissors className="w-5 h-5" /> },
    {
      key: 'book',
      label: 'Reservar',
      icon: <CalendarPlus className="w-5 h-5" />,
      isAction: true
    },
    { key: 'my-appointments', label: 'Mis Citas', icon: <Clock className="w-5 h-5" /> }
  ];

  // Only append Admin tab if admin mode is unlocked by staff
  const tabs: TabItem[] = showAdminTab
    ? [
        ...baseTabs,
        {
          key: 'admin',
          label: 'Admin',
          icon: <ShieldCheck className="w-5 h-5" />
        }
      ]
    : baseTabs;

  return (
    <nav aria-label="Navegación principal" className="w-full bg-[#121214]/90 backdrop-blur-2xl border-t border-white/10 select-none pb-safe pt-2 z-40">
      <div className="flex items-center justify-around px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;

          if (tab.isAction) {
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className="flex flex-col items-center -mt-4 group ios-active"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                    isActive
                      ? 'bg-gradient-to-tr from-[#c5a059] to-[#dfc07f] text-black ring-2 ring-[#c5a059]/40'
                      : 'bg-[#c5a059] text-black group-hover:scale-105'
                  }`}
                >
                  <CalendarPlus className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'text-[#c5a059]' : 'text-zinc-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className="relative flex flex-col items-center py-1 px-3 min-w-[56px] ios-active"
            >
              <div className="relative">
                <div
                  className={`transition-colors duration-150 ${
                    isActive ? 'text-[#c5a059] scale-105' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab.icon}
                </div>

                {/* Badge for admin pending appointments */}
                {tab.key === 'admin' && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#ff453a] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center ring-2 ring-[#121214]">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 font-medium transition-colors ${
                  isActive ? 'text-[#c5a059] font-semibold' : 'text-zinc-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* iOS Home Indicator */}
      <div className="w-32 h-[4px] bg-white/30 rounded-full mx-auto mt-2.5 mb-1" />
    </nav>
  );
};
