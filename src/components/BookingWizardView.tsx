import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Calendar as CalendarIcon,
  Phone,
  Mail,
  Sparkles,
  Scissors,
  MessageCircle,
  AlertCircle,
  Store,
  MapPin
} from 'lucide-react';
import { Appointment, BarberProfile, Branch, ServiceItem } from '../types';
import { createAppointment } from '../services/barberService';

interface BookingWizardViewProps {
  services: ServiceItem[];
  barbers: BarberProfile[];
  branches: Branch[];
  preselectedServiceId?: string | null;
  preselectedBranchId?: string | null;
  existingAppointments: Appointment[];
  onBookingSuccess: (appointmentId: string) => void;
  onCancel: () => void;
}

export const BookingWizardView: React.FC<BookingWizardViewProps> = ({
  services,
  barbers,
  branches,
  preselectedServiceId,
  preselectedBranchId,
  existingAppointments,
  onBookingSuccess,
  onCancel
}) => {
  // Wizard steps: 1: Branch & Service, 2: Barber, 3: DateTime, 4: ClientInfo, 5: Confirmed
  const [step, setStep] = useState<number>(1);

  // Selections
  const [selectedBranch, setSelectedBranch] = useState<Branch>(
    branches.find((b) => b.id === preselectedBranchId) || branches[0] || {
      id: 'local-1',
      name: 'Local #1 - Elixir',
      shortName: 'Local #1 (Elixir)',
      address: 'Carretera principal, Elixir',
      villageOrSector: 'Elixir',
      municipality: 'Sabá',
      department: 'Colón',
      phone: '+504 9876-5432',
      whatsapp: '50498765432',
      scheduleWeekdays: '8:00 AM - 7:30 PM',
      scheduleWeekend: '9:00 AM - 2:00 PM',
      active: true,
      mapQuery: 'Elixir, Saba, Colon'
    }
  );

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberProfile | null>(null);
  const [anyBarber, setAnyBarber] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Form Fields
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Preselections
  useEffect(() => {
    if (preselectedServiceId) {
      const found = services.find((s) => s.id === preselectedServiceId);
      if (found) setSelectedService(found);
    }
    if (preselectedBranchId) {
      const foundBranch = branches.find((b) => b.id === preselectedBranchId);
      if (foundBranch) setSelectedBranch(foundBranch);
    }
  }, [preselectedServiceId, preselectedBranchId, services, branches]);

  // Generate next 14 days
  const availableDates = React.useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('es-ES', { month: 'short' });
      list.push({
        iso,
        dayName: dayName.toUpperCase(),
        dayNum,
        monthName,
        isSunday: d.getDay() === 0
      });
    }
    return list;
  }, []);

  // Set default date on mount
  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0].iso);
    }
  }, [availableDates, selectedDate]);

  // Daily time slots
  const allTimeSlots = [
    '08:30',
    '09:15',
    '10:00',
    '10:45',
    '11:30',
    '12:15',
    '13:30',
    '14:15',
    '15:00',
    '15:45',
    '16:30',
    '17:15',
    '18:00',
    '18:45'
  ];

  // Calculate available slots based on existing bookings
  const isSlotOccupied = (time: string) => {
    if (!selectedDate) return false;
    return existingAppointments.some((apt) => {
      if (apt.date !== selectedDate || apt.time !== time) return false;
      if (apt.status === 'cancelada') return false;
      if (apt.branchId && apt.branchId !== selectedBranch.id) return false;
      if (selectedBarber && apt.barberId === selectedBarber.id) return true;
      return false;
    });
  };

  // Filter barbers available for this branch
  const availableBarbers = barbers.filter(
    (b) => !b.assignedBranchId || b.assignedBranchId === 'all' || b.assignedBranchId === selectedBranch.id
  );

  const handleNextStep = () => {
    setValidationError(null);

    if (step === 1) {
      if (!selectedService) {
        setValidationError('Por favor selecciona un servicio');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedBarber && !anyBarber) {
        setValidationError('Selecciona un barbero o la opción de cualquier disponible');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedDate || !selectedTime) {
        setValidationError('Selecciona fecha y hora para tu turno');
        return;
      }
      setStep(4);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!clientName.trim() || clientName.trim().length < 2) {
      setValidationError('Por favor ingresa tu nombre completo');
      return;
    }
    if (!clientPhone.trim() || clientPhone.trim().length < 7) {
      setValidationError('Ingresa un teléfono o WhatsApp hondureño válido');
      return;
    }

    if (!selectedService) return;

    // Determine chosen barber
    const barberToAssign = selectedBarber || (availableBarbers.find((b) => b.available) || barbers[0]);

    setIsSubmitting(true);
    try {
      const newBookingId = await createAppointment({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim() || undefined,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        barberId: barberToAssign.id,
        barberName: barberToAssign.name,
        branchId: selectedBranch.id,
        branchName: selectedBranch.name,
        date: selectedDate,
        time: selectedTime,
        status: 'pendiente',
        notes: clientNotes.trim() || undefined
      });

      // Save to localStorage for quick client retrieval
      try {
        const stored = JSON.parse(localStorage.getItem('walin_my_appointments') || '[]');
        stored.push(newBookingId);
        localStorage.setItem('walin_my_appointments', JSON.stringify(stored));
      } catch (err) {
        console.warn('Storage note:', err);
      }

      setConfirmedBookingId(newBookingId);
      setStep(5);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }

      onBookingSuccess(newBookingId);
    } catch (error) {
      console.error(error);
      setValidationError('No se pudo procesar la cita. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendWhatsAppConfirmation = () => {
    if (!selectedService || !confirmedBookingId) return;
    const assignedBarberName = selectedBarber ? selectedBarber.name : 'Barbero asignado';
    const text = encodeURIComponent(
      `¡Hola Barbería Walin! 💈 Acabo de reservar mi cita en la app:\n\n*Código:* ${confirmedBookingId}\n*Local:* ${selectedBranch.name} (${selectedBranch.address})\n*Cliente:* ${clientName}\n*Tel:* ${clientPhone}\n*Servicio:* ${selectedService.name} (L. ${selectedService.price})\n*Barbero:* ${assignedBarberName}\n*Fecha:* ${selectedDate} a las ${selectedTime}\n\n¡Espero su confirmación, gracias!`
    );
    const targetPhone = selectedBranch.whatsapp || '50498765432';
    window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Step Indicator */}
      {step < 5 && (
        <div className="bg-[#1c1c1e] p-3 rounded-[18px] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-white">
              Paso {step} de 4:{' '}
              {step === 1 && 'Local & Servicio'}
              {step === 2 && 'Barbero'}
              {step === 3 && 'Fecha y Hora'}
              {step === 4 && 'Tus Datos'}
            </span>
            <span className="text-[#c5a059] font-medium">{step * 25}%</span>
          </div>

          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#c5a059] to-[#dfc07f] h-full transition-all duration-300 rounded-full"
              style={{ width: `${step * 25}%` }}
            />
          </div>
        </div>
      )}

      {/* Error alert banner */}
      {validationError && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-200 px-3.5 py-2.5 rounded-[14px] text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* STEP 1: SELECT BRANCH & SERVICE */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Branch Selector */}
          <div className="space-y-2">
            <h2 className="text-[15px] font-bold text-white px-1 flex items-center space-x-1.5">
              <Store className="w-4 h-4 text-[#c5a059]" />
              <span>1. Elige el Local en Sabá, Colón</span>
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {branches.map((b) => {
                const isSelected = selectedBranch.id === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBranch(b)}
                    className={`p-3 rounded-[16px] text-left border transition-all ios-active cursor-pointer ${
                      isSelected
                        ? 'bg-[#c5a059]/20 border-[#c5a059] text-white shadow-md'
                        : 'bg-[#1c1c1e] border-white/5 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-[#c5a059] uppercase block">
                      {b.shortName}
                    </span>
                    <p className="text-[13px] font-bold text-white leading-tight mt-0.5">
                      {b.villageOrSector}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {b.address}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Services list */}
          <div className="space-y-2.5">
            <h2 className="text-[15px] font-bold text-white px-1 flex items-center space-x-1.5">
              <Scissors className="w-4 h-4 text-[#c5a059]" />
              <span>2. Selecciona el Servicio</span>
            </h2>

            <div className="space-y-2">
              {services
                .filter((s) => s.active)
                .map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`p-3.5 rounded-[18px] border cursor-pointer transition-all ios-active flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#c5a059]/15 border-[#c5a059] shadow-lg shadow-[#c5a059]/10'
                          : 'bg-[#1c1c1e] border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center space-x-2">
                          <h4
                            className={`text-[15px] font-semibold ${
                              isSelected ? 'text-[#c5a059]' : 'text-white'
                            }`}
                          >
                            {service.name}
                          </h4>
                        </div>
                        <p className="text-[12px] text-zinc-400 mt-0.5 line-clamp-1">
                          {service.description}
                        </p>
                        <div className="flex items-center space-x-3 mt-1 text-[11px] text-zinc-400">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span>{service.durationMinutes} min</span>
                          </span>
                          <span className="text-[#c5a059] font-black text-[14px]">
                            L. {service.price}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-[#c5a059] border-[#c5a059] text-black'
                            : 'border-white/20 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="py-3 px-4 text-zinc-400 text-[14px] font-medium hover:text-white"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="py-3 px-6 bg-[#c5a059] text-black font-semibold text-[15px] rounded-[14px] flex items-center space-x-1.5 shadow-md ios-active cursor-pointer"
            >
              <span>Continuar</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT BARBER */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="px-1">
            <h2 className="text-[17px] font-bold text-white">
              ¿Quién prefieres que te atienda?
            </h2>
            <p className="text-[12px] text-zinc-400">
              Mostrando barberos para {selectedBranch.name}
            </p>
          </div>

          {/* Any Barber Option */}
          <div
            onClick={() => {
              setAnyBarber(true);
              setSelectedBarber(null);
            }}
            className={`p-3.5 rounded-[18px] border cursor-pointer transition-all ios-active flex items-center justify-between ${
              anyBarber
                ? 'bg-[#c5a059]/15 border-[#c5a059]'
                : 'bg-[#1c1c1e] border-white/5 hover:border-white/15'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#c5a059] to-amber-200 flex items-center justify-center text-black font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-white">
                  Cualquier Barbero Disponible
                </h4>
                <p className="text-[12px] text-zinc-400">
                  Te atenderá el primer profesional disponible en {selectedBranch.villageOrSector}.
                </p>
              </div>
            </div>

            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                anyBarber
                  ? 'bg-[#c5a059] border-[#c5a059] text-black'
                  : 'border-white/20 text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          {/* Barbers list */}
          <div className="space-y-2.5 pt-1">
            {availableBarbers.map((barber) => {
              const isSelected = !anyBarber && selectedBarber?.id === barber.id;
              return (
                <div
                  key={barber.id}
                  onClick={() => {
                    setAnyBarber(false);
                    setSelectedBarber(barber);
                  }}
                  className={`p-3 rounded-[18px] border cursor-pointer transition-all ios-active flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#c5a059]/15 border-[#c5a059]'
                      : 'bg-[#1c1c1e] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={barber.avatarUrl}
                      alt={barber.name}
                      className="w-12 h-12 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <h4 className="text-[15px] font-semibold text-white">
                        {barber.name}
                      </h4>
                      <p className="text-[12px] text-[#c5a059] font-medium">
                        {barber.role}
                      </p>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">
                        {barber.specialties}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 ${
                      isSelected
                        ? 'bg-[#c5a059] border-[#c5a059] text-black'
                        : 'border-white/20 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-3 px-4 text-zinc-400 text-[14px] font-medium hover:text-white flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="py-3 px-6 bg-[#c5a059] text-black font-semibold text-[15px] rounded-[14px] flex items-center space-x-1.5 shadow-md ios-active cursor-pointer"
            >
              <span>Continuar</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DATE & TIME */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-[17px] font-bold text-white px-1">
              Selecciona Día y Hora
            </h2>
            <p className="text-[12px] text-zinc-400 px-1 mt-0.5">
              Local: {selectedBranch.name} • {selectedBranch.scheduleWeekdays}
            </p>
          </div>

          {/* Horizontal iOS Date Picker */}
          <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
            {availableDates.map((item) => {
              const isSelected = selectedDate === item.iso;
              return (
                <button
                  key={item.iso}
                  type="button"
                  onClick={() => {
                    setSelectedDate(item.iso);
                    setSelectedTime('');
                  }}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-[16px] min-w-[62px] border transition-all ios-active cursor-pointer ${
                    isSelected
                      ? 'bg-[#c5a059] border-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20'
                      : 'bg-[#1c1c1e] border-white/5 text-zinc-300 hover:border-white/20'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold ${
                      isSelected ? 'text-black/80' : 'text-zinc-500'
                    }`}
                  >
                    {item.dayName}
                  </span>
                  <span className="text-[18px] font-black leading-tight mt-0.5">
                    {item.dayNum}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-medium ${
                      isSelected ? 'text-black/80' : 'text-zinc-400'
                    }`}
                  >
                    {item.monthName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time Slots Grid */}
          <div className="space-y-2">
            <h3 className="text-[14px] font-semibold text-zinc-300 px-1">
              Turnos disponibles:
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {allTimeSlots.map((time) => {
                const occupied = isSlotOccupied(time);
                const isSelected = selectedTime === time;

                return (
                  <button
                    key={time}
                    type="button"
                    disabled={occupied}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 rounded-[12px] text-[13px] font-semibold border transition-all ios-active ${
                      occupied
                        ? 'bg-zinc-900/40 border-transparent text-zinc-600 line-through cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#c5a059] border-[#c5a059] text-black shadow-md'
                        : 'bg-[#1c1c1e] border-white/10 text-white hover:border-[#c5a059]/40 cursor-pointer'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-3 px-4 text-zinc-400 text-[14px] font-medium hover:text-white flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="py-3 px-6 bg-[#c5a059] text-black font-semibold text-[15px] rounded-[14px] flex items-center space-x-1.5 shadow-md ios-active cursor-pointer"
            >
              <span>Continuar</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CLIENT INFO & CONFIRM */}
      {step === 4 && (
        <form onSubmit={handleConfirmBooking} className="space-y-4">
          <div>
            <h2 className="text-[17px] font-bold text-white px-1">
              Tus Datos de Contacto
            </h2>
            <p className="text-[12px] text-zinc-400 px-1 mt-0.5">
              Te confirmaremos el turno por WhatsApp para {selectedBranch.name}.
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="bg-[#1c1c1e] p-3.5 rounded-[18px] border border-[#c5a059]/30 bg-gradient-to-br from-[#1c1c1e] to-[#252528] space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-white/5 pb-2">
              <span className="flex items-center space-x-1">
                <Store className="w-3.5 h-3.5 text-[#c5a059]" />
                <span className="font-semibold text-white">{selectedBranch.name}</span>
              </span>
              <span className="text-[#c5a059] font-bold">{selectedBranch.municipality}, Colón</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-bold text-white">
                  {selectedService?.name}
                </p>
                <p className="text-[12px] text-zinc-400">
                  Con:{' '}
                  <span className="text-[#c5a059]">
                    {selectedBarber ? selectedBarber.name : 'Barbero asignado'}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[17px] font-black text-[#c5a059]">
                  L. {selectedService?.price}
                </span>
                <p className="text-[11px] text-zinc-400">
                  {selectedService?.durationMinutes} min
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1 text-xs text-zinc-300">
              <CalendarIcon className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="font-medium">
                {selectedDate} a las {selectedTime} hrs
              </span>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 px-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Ej: David Martínez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-white/10 rounded-[14px] pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 text-[14px] focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 px-1">
                Teléfono / WhatsApp Hondureño (+504) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="tel"
                  required
                  placeholder="Ej: 9876-5432 o +504 98765432"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-white/10 rounded-[14px] pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 text-[14px] focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 px-1">
                Correo Electrónico (Opcional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  placeholder="tuemail@ejemplo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-white/10 rounded-[14px] pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 text-[14px] focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 px-1">
                Notas especiales o estilo deseado
              </label>
              <textarea
                rows={2}
                placeholder="Ej: Quiero degradado alto y perfilado de barba."
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                className="w-full bg-[#1c1c1e] border border-white/10 rounded-[14px] px-3.5 py-2.5 text-white placeholder-zinc-500 text-[13px] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep(3)}
              className="py-3 px-4 text-zinc-400 text-[14px] font-medium hover:text-white flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3.5 px-6 bg-gradient-to-r from-[#c5a059] to-[#d8b56f] text-black font-bold text-[15px] rounded-[14px] flex items-center space-x-2 shadow-lg shadow-[#c5a059]/20 ios-active cursor-pointer"
            >
              {isSubmitting ? (
                <span>Guardando en Firestore...</span>
              ) : (
                <>
                  <span>Confirmar Reserva</span>
                  <Check className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: APPLE WALLET PASS CONFIRMATION */}
      {step === 5 && (
        <div className="space-y-4 pt-1">
          <div className="relative overflow-hidden bg-gradient-to-b from-[#1c1c1e] to-[#121214] border border-[#c5a059]/40 rounded-[24px] shadow-2xl p-5 space-y-4">
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#0a0a0c] rounded-full border-r border-[#c5a059]/40" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#0a0a0c] rounded-full border-l border-[#c5a059]/40" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center text-black">
                  <Scissors className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white font-serif">
                    Barbería Walin
                  </h3>
                  <span className="text-[10px] text-[#c5a059] uppercase tracking-wider font-semibold">
                    {selectedBranch.shortName} • Sabá, Colón
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-zinc-400">Código Cita</span>
                <p className="text-[14px] font-mono font-bold text-white tracking-widest">
                  {confirmedBookingId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-1 text-xs">
              <div>
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">
                  Cliente
                </span>
                <p className="font-semibold text-white text-[14px]">{clientName}</p>
                <p className="text-zinc-400 text-[11px]">{clientPhone}</p>
              </div>

              <div>
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">
                  Barbero
                </span>
                <p className="font-semibold text-[#c5a059] text-[14px]">
                  {selectedBarber ? selectedBarber.name : 'Asignado en local'}
                </p>
              </div>

              <div>
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">
                  Fecha & Hora
                </span>
                <p className="font-semibold text-white text-[13px]">{selectedDate}</p>
                <p className="font-bold text-[#c5a059] text-[13px]">{selectedTime} hrs</p>
              </div>

              <div>
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">
                  Servicio & Monto
                </span>
                <p className="font-semibold text-white text-[13px]">
                  {selectedService?.name}
                </p>
                <p className="text-[15px] font-black text-[#c5a059]">
                  L. {selectedService?.price}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-[11px] text-zinc-400 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
              <span className="truncate">Local: {selectedBranch.address}</span>
            </div>

            <div className="pt-3 border-t border-dashed border-white/15 text-center space-y-1.5">
              <div className="flex items-center justify-center space-x-1 opacity-70">
                <div className="w-1 h-8 bg-white" />
                <div className="w-2 h-8 bg-white" />
                <div className="w-1 h-8 bg-white" />
                <div className="w-3 h-8 bg-white" />
                <div className="w-1 h-8 bg-white" />
                <div className="w-2 h-8 bg-white" />
                <div className="w-1.5 h-8 bg-white" />
                <div className="w-1 h-8 bg-white" />
                <div className="w-2.5 h-8 bg-white" />
                <div className="w-1 h-8 bg-white" />
                <div className="w-3 h-8 bg-white" />
                <div className="w-1 h-8 bg-white" />
              </div>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest">
                TICKET GUARDADO EN BASE DE DATOS FIRESTORE
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={sendWhatsAppConfirmation}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[15px] rounded-[16px] flex items-center justify-center space-x-2 shadow-lg ios-active cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Enviar WhatsApp de Confirmación a Walin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSelectedService(null);
                setSelectedBarber(null);
                setConfirmedBookingId(null);
                onCancel();
              }}
              className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-medium text-[14px] rounded-[14px] border border-white/10 ios-active cursor-pointer"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
