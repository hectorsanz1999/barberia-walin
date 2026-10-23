import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Scissors,
  User,
  Search,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Trash2,
  Store,
  MapPin
} from 'lucide-react';
import { Appointment } from '../types';
import { updateAppointmentStatus } from '../services/barberService';
import { IOSAlert } from './ios/IOSAlert';

interface MyAppointmentsViewProps {
  appointments: Appointment[];
  onNavigateToBook: () => void;
  onShowWhatsApp: (phone?: string, text?: string) => void;
}

export const MyAppointmentsView: React.FC<MyAppointmentsViewProps> = ({
  appointments,
  onNavigateToBook,
  onShowWhatsApp
}) => {
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [selectedAppointmentToCancel, setSelectedAppointmentToCancel] = useState<Appointment | null>(null);
  const [showAlertCancel, setShowAlertCancel] = useState<boolean>(false);

  // Get local saved appointment IDs from localStorage
  const savedIds: string[] = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('walin_my_appointments') || '[]');
    } catch {
      return [];
    }
  }, []);

  // Filter appointments: either in savedIds or matching search phone
  const displayedAppointments = appointments.filter((apt) => {
    if (searchPhone.trim()) {
      return (
        apt.clientPhone.includes(searchPhone.trim()) ||
        apt.id.toLowerCase().includes(searchPhone.trim().toLowerCase())
      );
    }
    return savedIds.includes(apt.id);
  });

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmada':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmada</span>
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Pendiente de Confirmación</span>
          </span>
        );
      case 'completada':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completada</span>
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            <span>Cancelada</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointmentToCancel) return;
    try {
      await updateAppointmentStatus(selectedAppointmentToCancel.id, 'cancelada');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-[17px] font-bold text-white px-1">
          Seguimiento de Mis Citas
        </h2>
        <p className="text-[12px] text-zinc-400 px-1 mt-0.5">
          Consulta en tiempo real el estado de tus citas en Barbería Walin (Elixir & El Esfuerzo).
        </p>
      </div>

      {/* Search Bar (iOS Style) */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar por teléfono o código (WLN-...)"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
          className="w-full bg-[#1c1c1e] border border-white/10 rounded-[14px] pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 text-[13px] focus:outline-none focus:border-[#c5a059]"
        />
        {searchPhone && (
          <button
            type="button"
            onClick={() => setSearchPhone('')}
            className="absolute right-3 top-2.5 text-zinc-400 text-xs bg-white/10 px-2 py-0.5 rounded-full"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* List of Appointments */}
      {displayedAppointments.length > 0 ? (
        <div className="space-y-3">
          {displayedAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-[#1c1c1e] rounded-[20px] p-4 border border-white/5 shadow-md space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/5 pb-2.5">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-mono font-bold text-[#c5a059]">
                      {apt.id}
                    </span>
                    {apt.branchName && (
                      <span className="text-[10px] text-zinc-400 bg-white/5 px-1.5 py-0.2 rounded">
                        📍 {apt.branchName}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[15px] font-bold text-white leading-tight mt-0.5">
                    {apt.serviceName}
                  </h3>
                </div>
                <div>{getStatusBadge(apt.status)}</div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span className="text-white font-medium">{apt.date}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span className="text-white font-medium">{apt.time} hrs</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-zinc-400">
                    <User className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span className="text-zinc-200 truncate">{apt.barberName}</span>
                  </div>
                  <div className="text-[15px] font-black text-[#c5a059]">
                    L. {apt.servicePrice}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {apt.status !== 'cancelada' && apt.status !== 'completada' && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAppointmentToCancel(apt);
                      setShowAlertCancel(true);
                    }}
                    className="text-[12px] text-red-400 hover:text-red-300 font-medium flex items-center space-x-1 py-1 px-2 rounded-lg hover:bg-red-500/10 ios-active"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancelar Cita</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onShowWhatsApp('50498765432', `¡Hola Barbería Walin! Quisiera consultar sobre mi cita código ${apt.id} programada para el ${apt.date}.`)}
                    className="text-[12px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1 py-1 px-2 rounded-lg hover:bg-emerald-500/10 ios-active"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Walin</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#1c1c1e] rounded-[22px] p-6 text-center border border-white/5 space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 mx-auto">
            <Scissors className="w-6 h-6 text-zinc-500" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-white">
              No tienes citas activas
            </h3>
            <p className="text-[12px] text-zinc-400 mt-1 max-w-xs mx-auto">
              Ingresa tu número de teléfono arriba para buscar citas o reserva un nuevo turno en Elixir o Aldea El Esfuerzo.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToBook}
            className="py-2.5 px-5 bg-gradient-to-r from-[#c5a059] to-[#d8b56f] text-black font-semibold text-[13px] rounded-[12px] shadow-md ios-active cursor-pointer"
          >
            Reservar Cita Ahora
          </button>
        </div>
      )}

      {/* iOS Native Alert for Cancellation */}
      <IOSAlert
        isOpen={showAlertCancel}
        title="¿Cancelar Cita?"
        message={`¿Estás seguro de que deseas cancelar tu cita ${selectedAppointmentToCancel?.id} para el ${selectedAppointmentToCancel?.date}?`}
        actions={[
          {
            text: 'Volver',
            style: 'cancel',
            onClick: () => setShowAlertCancel(false)
          },
          {
            text: 'Cancelar Cita',
            style: 'destructive',
            onClick: () => {
              handleConfirmCancel();
              setShowAlertCancel(false);
            }
          }
        ]}
        onClose={() => setShowAlertCancel(false)}
      />
    </div>
  );
};
