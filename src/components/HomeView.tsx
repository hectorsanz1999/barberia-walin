import React from 'react';
import {
  Scissors,
  Calendar,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Shield,
  Coffee,
  Award,
  Store
} from 'lucide-react';
import { BarberProfile, Branch, ServiceItem, ShopInfo } from '../types';

interface HomeViewProps {
  services: ServiceItem[];
  barbers: BarberProfile[];
  branches: Branch[];
  shopInfo: ShopInfo;
  onSelectServiceAndBook: (serviceId: string) => void;
  onNavigateToTab: (tab: 'services' | 'book' | 'my-appointments') => void;
  onSelectBranchAndBook: (branchId: string) => void;
  onShowWhatsApp: (phone?: string, text?: string) => void;
  onCall: (phone?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  services,
  barbers,
  branches,
  shopInfo,
  onSelectServiceAndBook,
  onNavigateToTab,
  onSelectBranchAndBook,
  onShowWhatsApp,
  onCall
}) => {
  const popularServices = services.filter((s) => s.popular || s.category === 'combos').slice(0, 4);

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#18181b] via-[#121214] to-[#09090b] p-6 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Status Pill */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>2 Locales en Sabá, Colón • Abierto Hoy</span>
            </span>

            <span className="inline-flex items-center space-x-1 text-amber-400 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>4.9 (500+ reseñas)</span>
            </span>
          </div>

          {/* Logo & Headline */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#c5a059]/40 shadow-xl bg-black shrink-0 p-0.5">
                <img
                  src="/assets/aistudio/logo_87989ac7.png"
                  alt="Barbería Walin"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
                  Barbería Walin
                </h1>
                <p className="text-[11px] text-[#c5a059] uppercase tracking-widest font-bold">
                  Sabá, Colón • Honduras 🇭🇳
                </p>
              </div>
            </div>

            <p className="text-[13px] text-zinc-300 leading-relaxed pt-1">
              La máxima experiencia de barbería tradicional y moderna en Colón. Cortes con estilo, degradados milimétricos y cuidado de barba en nuestros locales de Elixir y Aldea El Esfuerzo.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={() => onNavigateToTab('book')}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#c5a059] to-[#d8b56f] text-black font-semibold text-[15px] rounded-[14px] shadow-lg shadow-[#c5a059]/20 flex items-center justify-center space-x-2 ios-active cursor-pointer"
            >
              <Calendar className="w-4 h-4 stroke-[2.5]" />
              <span>Reservar Mi Cita</span>
            </button>

            <button
              type="button"
              onClick={() => onShowWhatsApp()}
              className="py-3 px-3.5 bg-white/10 hover:bg-white/15 text-white rounded-[14px] border border-white/10 flex items-center justify-center ios-active cursor-pointer"
              title="Escribir por WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Nuestros 2 Locales en Sabá, Colón (Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[17px] font-bold text-white tracking-tight flex items-center space-x-1.5">
            <Store className="w-4 h-4 text-[#c5a059]" />
            <span>Nuestros 2 Locales</span>
          </h2>
          <span className="text-[12px] text-zinc-400 font-medium">Sabá, Colón</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-[#1c1c1e] rounded-[20px] p-4 border border-white/5 space-y-3 hover:border-[#c5a059]/30 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded-full">
                    {branch.shortName}
                  </span>
                  <h3 className="text-[15px] font-bold text-white mt-1 leading-snug">
                    {branch.name}
                  </h3>
                  <p className="text-[12px] text-zinc-400 mt-0.5">
                    {branch.address}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-zinc-400 border-t border-white/5 pt-2">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{branch.scheduleWeekdays}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-zinc-300">
                  <Phone className="w-3.5 h-3.5 text-[#0a84ff]" />
                  <span>{branch.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectBranchAndBook(branch.id)}
                  className="py-2 bg-[#c5a059] text-black font-bold text-[12px] rounded-[10px] ios-active text-center cursor-pointer"
                >
                  Cita Aquí
                </button>
                <button
                  type="button"
                  onClick={() => onShowWhatsApp(branch.phone, `¡Hola Barbería Walin! Quisiera agendar cita para ${branch.name}.`)}
                  className="py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 text-[12px] font-semibold rounded-[10px] flex items-center justify-center space-x-1 ios-active cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Servicios Más Solicitados con Precios en Lempiras */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[17px] font-bold text-white tracking-tight flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-[#c5a059]" />
            <span>Servicios & Precios (Lempiras)</span>
          </h2>
          <button
            type="button"
            onClick={() => onNavigateToTab('services')}
            className="text-[13px] font-semibold text-[#c5a059] flex items-center hover:underline cursor-pointer"
          >
            <span>Ver menú</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {popularServices.map((service) => (
            <div
              key={service.id}
              className="bg-[#1c1c1e] hover:bg-[#252528] transition-colors p-3.5 rounded-[18px] border border-white/5 flex items-center justify-between group"
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center space-x-2">
                  <h3 className="text-[15px] font-semibold text-white group-hover:text-[#c5a059] transition-colors">
                    {service.name}
                  </h3>
                  {service.popular && (
                    <span className="text-[10px] bg-[#c5a059]/20 text-[#c5a059] font-bold px-1.5 py-0.5 rounded-md">
                      TOP
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-zinc-400 line-clamp-1 mt-0.5">
                  {service.description}
                </p>
                <div className="flex items-center space-x-3 mt-1 text-[11px] text-zinc-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{service.durationMinutes} min</span>
                  </span>
                  <span className="font-extrabold text-[15px] text-[#c5a059]">
                    L. {service.price}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectServiceAndBook(service.id)}
                className="py-2 px-3.5 bg-white/10 hover:bg-[#c5a059] hover:text-black text-white text-[13px] font-semibold rounded-[12px] border border-white/10 transition-all ios-active shrink-0 cursor-pointer"
              >
                Elegir
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Barberos Expertos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[17px] font-bold text-white tracking-tight">
            Nuestro Equipo de Barberos
          </h2>
          <span className="text-[12px] text-zinc-400 font-medium">Atención en Sabá</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="bg-[#1c1c1e] rounded-[18px] overflow-hidden border border-white/5 p-3 flex flex-col justify-between"
            >
              <div className="relative">
                <img
                  src={barber.avatarUrl}
                  alt={barber.name}
                  className="w-full h-28 object-cover rounded-[14px] shadow-sm"
                  loading="lazy"
                />
                <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-full text-[10px] font-bold text-amber-400 flex items-center space-x-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  <span>{barber.rating.toFixed(1)}</span>
                </span>
              </div>

              <div className="pt-2.5 space-y-1">
                <h3 className="text-[14px] font-semibold text-white leading-tight">
                  {barber.name}
                </h3>
                <p className="text-[11px] text-[#c5a059] font-medium leading-tight line-clamp-1">
                  {barber.role}
                </p>
                {barber.assignedBranchName && (
                  <p className="text-[10px] text-zinc-400 line-clamp-1">
                    📍 {barber.assignedBranchName}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onNavigateToTab('book')}
                className="mt-3 w-full py-1.5 bg-white/5 hover:bg-white/10 text-[12px] font-medium text-zinc-200 rounded-[10px] border border-white/10 ios-active text-center cursor-pointer"
              >
                Cita con {barber.name.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer (100% Client Focused, no admin links) */}
      <div className="pt-6 border-t border-white/5 text-center space-y-1">
        <p className="text-[11px] text-zinc-500 font-medium">
          Barbería Walin • Sabá, Colón, Honduras
        </p>
        <p className="text-[10px] text-zinc-600">
          Local #1: Elixir | Local #2: Aldea El Esfuerzo
        </p>
      </div>
    </div>
  );
};
