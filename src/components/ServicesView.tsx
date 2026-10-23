import React, { useState } from 'react';
import { Clock, Scissors, Crown, Flame, Smile, ChevronRight, Sparkles } from 'lucide-react';
import { ServiceItem } from '../types';
import { IOSSegmentedControl } from './ios/IOSSegmentedControl';

interface ServicesViewProps {
  services: ServiceItem[];
  onSelectServiceAndBook: (serviceId: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  onSelectServiceAndBook
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'cortes', label: 'Cortes' },
    { id: 'barba', label: 'Barba' },
    { id: 'combos', label: 'Combos' },
    { id: 'tratamientos', label: 'Spa' }
  ];

  const filteredServices = services.filter((service) => {
    if (!service.active) return false;
    if (selectedCategory === 'todos') return true;
    return service.category === selectedCategory;
  });

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'cortes':
        return <Scissors className="w-4 h-4 text-[#c5a059]" />;
      case 'barba':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'combos':
        return <Crown className="w-4 h-4 text-yellow-300" />;
      case 'tratamientos':
        return <Flame className="w-4 h-4 text-rose-400" />;
      default:
        return <Smile className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Category Segmented Control */}
      <div className="sticky top-0 z-20 pt-1 pb-2 bg-[#0a0a0c]/80 backdrop-blur-md">
        <IOSSegmentedControl
          options={categories}
          value={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-[#1c1c1e] rounded-[20px] p-4 border border-white/5 shadow-md flex flex-col justify-between space-y-3 hover:border-white/15 transition group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {getServiceIcon(service.category)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-[16px] font-bold text-white group-hover:text-[#c5a059] transition-colors">
                      {service.name}
                    </h3>
                    {service.popular && (
                      <span className="text-[10px] bg-[#c5a059]/20 text-[#c5a059] font-bold px-2 py-0.5 rounded-full">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-zinc-300 mt-1 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-zinc-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{service.durationMinutes} minutos</span>
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-[16px] font-black text-[#c5a059]">
                  L. {service.price}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelectServiceAndBook(service.id)}
                className="py-2 px-4 bg-gradient-to-r from-[#c5a059] to-[#d8b56f] text-black font-semibold text-[13px] rounded-[12px] shadow-sm flex items-center space-x-1.5 ios-active cursor-pointer"
              >
                <span>Reservar</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
