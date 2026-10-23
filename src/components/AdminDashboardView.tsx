import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  DollarSign,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Plus,
  Scissors,
  Users,
  Search,
  Check,
  Edit,
  Trash2,
  Store,
  Shield,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';
import { Appointment, BarberProfile, Branch, ServiceItem, ShopInfo } from '../types';
import {
  updateAppointmentStatus,
  deleteAppointment,
  saveService,
  toggleServiceActive,
  deleteService,
  saveBarber,
  toggleBarberAvailability,
  deleteBarber,
  saveBranch,
  createAppointment
} from '../services/barberService';
import { IOSAlert } from './ios/IOSAlert';
import { IOSToggle } from './ios/IOSToggle';

interface AdminDashboardViewProps {
  appointments: Appointment[];
  services: ServiceItem[];
  barbers: BarberProfile[];
  branches: Branch[];
  shopInfo: ShopInfo;
  onSwitchToClientApp: () => void;
  onShowWhatsAppToClient: (phone: string, text: string) => void;
  onCallClient: (phone: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  appointments,
  services,
  barbers,
  branches,
  shopInfo,
  onSwitchToClientApp,
  onShowWhatsAppToClient,
  onCallClient
}) => {
  // Navigation tabs inside admin
  const [adminTab, setAdminTab] = useState<'citas' | 'servicios' | 'barberos' | 'locales' | 'walkin'>('citas');

  // Report Period Filter: 'both' | 'daily' | 'weekly'
  const [reportPeriod, setReportPeriod] = useState<'both' | 'daily' | 'weekly'>('both');

  // Filters for appointments
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [branchFilter, setBranchFilter] = useState<string>('todos');
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<'hoy' | 'todas'>('hoy');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Action states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [alertType, setAlertType] = useState<'cancel' | 'delete' | null>(null);

  // Edit Service Modal
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [showAddService, setShowAddService] = useState<boolean>(false);
  const [serviceForm, setServiceForm] = useState<{
    id?: string;
    name: string;
    price: number;
    durationMinutes: number;
    description: string;
    category: 'cortes' | 'barba' | 'combos' | 'tratamientos';
    popular: boolean;
  }>({
    name: '',
    price: 150,
    durationMinutes: 30,
    description: '',
    category: 'cortes',
    popular: false
  });

  // Edit Barber Modal
  const [editingBarber, setEditingBarber] = useState<BarberProfile | null>(null);
  const [showAddBarber, setShowAddBarber] = useState<boolean>(false);
  const [barberForm, setBarberForm] = useState<{
    id?: string;
    name: string;
    role: string;
    specialties: string;
    assignedBranchId: 'all' | 'local-1' | 'local-2';
    avatarUrl: string;
  }>({
    name: '',
    role: 'Barbero Especialista',
    specialties: 'Cortes clásicos, degradados y barba',
    assignedBranchId: 'all',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
  });

  // Edit Branch Modal
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState<{
    id: string;
    name: string;
    address: string;
    phone: string;
    whatsapp: string;
    scheduleWeekdays: string;
  }>({
    id: '',
    name: '',
    address: '',
    phone: '',
    whatsapp: '',
    scheduleWeekdays: ''
  });

  // Walk-in form states
  const [walkinName, setWalkinName] = useState<string>('');
  const [walkinPhone, setWalkinPhone] = useState<string>('');
  const [walkinBranchId, setWalkinBranchId] = useState<string>(branches[0]?.id || 'local-1');
  const [walkinServiceId, setWalkinServiceId] = useState<string>(services[0]?.id || '');
  const [walkinBarberId, setWalkinBarberId] = useState<string>(barbers[0]?.id || '');
  const [walkinTime, setWalkinTime] = useState<string>('15:00');
  const [walkinSuccess, setWalkinSuccess] = useState<boolean>(false);

  const todayIso = new Date().toISOString().split('T')[0];

  // Calculate Start of current week (Monday)
  const getStartOfWeekIso = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  };
  const startOfWeekIso = getStartOfWeekIso();

  // Dashboard Top Stats
  const todayAppointments = appointments.filter((a) => a.date === todayIso && a.status !== 'cancelada');
  const pendingAppointments = appointments.filter((a) => a.status === 'pendiente');
  const todayRevenue = todayAppointments.reduce((sum, a) => sum + (a.servicePrice || 0), 0);
  const activeBarbersCount = barbers.filter((b) => b.available).length;

  // Barber Performance Report Calculations (Daily & Weekly)
  const barberReports = barbers.map((barber) => {
    // All non-cancelled appointments for this barber
    const barberApts = appointments.filter(
      (a) => (a.barberId === barber.id || a.barberName === barber.name) && a.status !== 'cancelada'
    );

    // Daily stats (today)
    const todayApts = barberApts.filter((a) => a.date === todayIso);
    const dailyCuts = todayApts.length;
    const dailyRevenue = todayApts.reduce((sum, a) => sum + (a.servicePrice || 0), 0);

    // Weekly stats (from Monday to today)
    const weeklyApts = barberApts.filter((a) => a.date >= startOfWeekIso && a.date <= todayIso);
    const weeklyCuts = weeklyApts.length;
    const weeklyRevenue = weeklyApts.reduce((sum, a) => sum + (a.servicePrice || 0), 0);

    return {
      barber,
      dailyCuts,
      dailyRevenue,
      weeklyCuts,
      weeklyRevenue,
      todayApts
    };
  });

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (dateFilter === 'hoy' && apt.date !== todayIso) return false;
    if (statusFilter !== 'todos' && apt.status !== statusFilter) return false;
    if (branchFilter !== 'todos' && apt.branchId !== branchFilter) return false;
    if (selectedBarberFilter !== 'todos' && apt.barberId !== selectedBarberFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        apt.clientName.toLowerCase().includes(q) ||
        apt.clientPhone.includes(q) ||
        apt.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Walk-in submit
  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim() || !walkinPhone.trim()) return;

    const chosenService = services.find((s) => s.id === walkinServiceId) || services[0];
    const chosenBarber = barbers.find((b) => b.id === walkinBarberId) || barbers[0];
    const chosenBranch = branches.find((b) => b.id === walkinBranchId) || branches[0];

    try {
      await createAppointment({
        clientName: walkinName.trim(),
        clientPhone: walkinPhone.trim(),
        serviceId: chosenService.id,
        serviceName: chosenService.name,
        servicePrice: chosenService.price,
        barberId: chosenBarber.id,
        barberName: chosenBarber.name,
        branchId: chosenBranch.id,
        branchName: chosenBranch.name,
        date: todayIso,
        time: walkinTime,
        status: 'confirmada',
        notes: `Cliente presencial (${chosenBranch.shortName})`
      });

      setWalkinSuccess(true);
      setWalkinName('');
      setWalkinPhone('');
      setTimeout(() => {
        setWalkinSuccess(false);
        setAdminTab('citas');
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  // Service Save
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) return;

    const serviceId = serviceForm.id || 'service-' + Date.now();
    const servicePayload: ServiceItem = {
      id: serviceId,
      name: serviceForm.name.trim(),
      price: Number(serviceForm.price) || 100,
      durationMinutes: Number(serviceForm.durationMinutes) || 30,
      description: serviceForm.description.trim(),
      category: serviceForm.category,
      popular: serviceForm.popular,
      active: true
    };

    try {
      await saveService(servicePayload);
      setShowAddService(false);
      setEditingService(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Barber Save
  const handleSaveBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberForm.name.trim()) return;

    const barberId = barberForm.id || 'barber-' + Date.now();
    const branchName =
      barberForm.assignedBranchId === 'local-1'
        ? 'Local #1 - Elixir'
        : barberForm.assignedBranchId === 'local-2'
        ? 'Local #2 - Aldea El Esfuerzo'
        : 'Ambos Locales (Sabá)';

    const barberPayload: BarberProfile = {
      id: barberId,
      name: barberForm.name.trim(),
      role: barberForm.role.trim(),
      specialties: barberForm.specialties.trim(),
      rating: 5.0,
      reviewsCount: 50,
      available: true,
      avatarUrl: barberForm.avatarUrl.trim(),
      bio: 'Barbero profesional en Barbería Walin',
      yearsExperience: 5,
      assignedBranchId: barberForm.assignedBranchId,
      assignedBranchName: branchName
    };

    try {
      await saveBarber(barberPayload);
      setShowAddBarber(false);
      setEditingBarber(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Branch Save
  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;

    const updated: Branch = {
      ...editingBranch,
      name: branchForm.name.trim(),
      address: branchForm.address.trim(),
      phone: branchForm.phone.trim(),
      whatsapp: branchForm.whatsapp.trim(),
      scheduleWeekdays: branchForm.scheduleWeekdays.trim()
    };

    try {
      await saveBranch(updated);
      setEditingBranch(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner with Local Info & Switch to Client App */}
      <div className="bg-[#1c1c1e] p-3.5 rounded-[20px] border border-[#c5a059]/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#c5a059]/40 bg-black p-0.5 shadow-md shrink-0">
            <img
              src="/assets/aistudio/logo_87989ac7.png"
              alt="Walin"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-[15px] font-bold text-white font-serif">
                Panel Propietario Walin
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-zinc-400">
              Locales: Elixir & Aldea El Esfuerzo • Sabá, Colón
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToClientApp}
          className="py-1.5 px-3 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-[10px] text-[11px] font-bold flex items-center space-x-1.5 ios-active cursor-pointer"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>App Clientes</span>
        </button>
      </div>

      {/* 4 Main KPI Cards (Matching Image Attachment) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#1c1c1e] p-3.5 rounded-[18px] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">CITAS HOY</span>
            <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{todayAppointments.length}</span>
            <span className="text-[11px] text-emerald-400 font-semibold">turnos</span>
          </div>
        </div>

        <div className="bg-[#1c1c1e] p-3.5 rounded-[18px] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">POR CONFIRMAR</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-400">{pendingAppointments.length}</span>
            <span className="text-[11px] text-zinc-400">pendientes</span>
          </div>
        </div>

        <div className="bg-[#1c1c1e] p-3.5 rounded-[18px] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">INGRESOS HOY (L.)</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#c5a059]">L. {todayRevenue}</span>
            <span className="text-[10px] text-zinc-400">estimados</span>
          </div>
        </div>

        <div className="bg-[#1c1c1e] p-3.5 rounded-[18px] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">BARBEROS EN TURNO</span>
            <Users className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{activeBarbersCount}</span>
            <span className="text-[11px] text-zinc-400">de {barbers.length}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          REPORTE DE CORTES & DINERO POR BARBERO (DIARIO Y SEMANAL)
          Requested directly below the cards in the screenshot!
          ========================================================================= */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-[16px] font-bold text-white flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-[#c5a059]" />
              <span>Reporte de Cortes & Dinero por Barbero</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Rendimiento diario (hoy) y acumulado de esta semana en Lempiras
            </p>
          </div>

          {/* Period selector */}
          <div className="flex bg-[#1c1c1e] p-0.5 rounded-[10px] border border-white/10 text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setReportPeriod('both')}
              className={`px-2 py-1 rounded-[8px] transition-colors ${
                reportPeriod === 'both' ? 'bg-[#c5a059] text-black font-bold' : 'text-zinc-400'
              }`}
            >
              Ambos
            </button>
            <button
              type="button"
              onClick={() => setReportPeriod('daily')}
              className={`px-2 py-1 rounded-[8px] transition-colors ${
                reportPeriod === 'daily' ? 'bg-[#c5a059] text-black font-bold' : 'text-zinc-400'
              }`}
            >
              Diario
            </button>
            <button
              type="button"
              onClick={() => setReportPeriod('weekly')}
              className={`px-2 py-1 rounded-[8px] transition-colors ${
                reportPeriod === 'weekly' ? 'bg-[#c5a059] text-black font-bold' : 'text-zinc-400'
              }`}
            >
              Semanal
            </button>
          </div>
        </div>

        {/* Barber Cards with identical sleek design */}
        <div className="space-y-3">
          {barberReports.map(({ barber, dailyCuts, dailyRevenue, weeklyCuts, weeklyRevenue, todayApts }) => (
            <div
              key={barber.id}
              className="bg-[#1c1c1e] rounded-[20px] p-4 border border-white/5 space-y-3 shadow-lg hover:border-white/10 transition"
            >
              {/* Header: Barber info & status badge */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center space-x-3">
                  <img
                    src={barber.avatarUrl}
                    alt={barber.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#c5a059]/40 shadow-sm"
                  />
                  <div>
                    <h4 className="text-[15px] font-bold text-white leading-tight">
                      {barber.name}
                    </h4>
                    <p className="text-[11px] text-[#c5a059] font-medium">
                      {barber.role}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      📍 {barber.assignedBranchName || 'Sabá, Colón'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      barber.available
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {barber.available ? 'En Turno' : 'De Descanso'}
                  </span>
                </div>
              </div>

              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Daily Card Metric */}
                {(reportPeriod === 'both' || reportPeriod === 'daily') && (
                  <div className="bg-[#242428] p-3 rounded-[14px] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase">
                      <span>Cortes Hoy</span>
                      <Calendar className="w-3 h-3 text-[#c5a059]" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[20px] font-black text-white">{dailyCuts}</span>
                      <span className="text-[15px] font-black text-[#c5a059]">
                        L. {dailyRevenue}
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-500">
                      {dailyCuts === 0 ? 'Sin cortes registrados hoy' : `${dailyCuts} cortes realizados`}
                    </p>
                  </div>
                )}

                {/* Weekly Card Metric */}
                {(reportPeriod === 'both' || reportPeriod === 'weekly') && (
                  <div className="bg-[#242428] p-3 rounded-[14px] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase">
                      <span>Esta Semana</span>
                      <Award className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[20px] font-black text-white">{weeklyCuts}</span>
                      <span className="text-[15px] font-black text-emerald-400">
                        L. {weeklyRevenue}
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-500">
                      {weeklyCuts === 0 ? 'Semana en curso' : `${weeklyCuts} turnos acumulados`}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick list of today's cuts for this barber */}
              {todayApts.length > 0 && (
                <div className="bg-black/30 p-2.5 rounded-[12px] space-y-1 text-xs">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                    Cortes de Hoy ({todayApts.length}):
                  </span>
                  <div className="space-y-1">
                    {todayApts.slice(0, 3).map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-300">
                          {a.time} - {a.clientName} ({a.serviceName})
                        </span>
                        <span className="text-[#c5a059] font-bold">L. {a.servicePrice}</span>
                      </div>
                    ))}
                    {todayApts.length > 3 && (
                      <p className="text-[10px] text-zinc-500 italic">
                        +{todayApts.length - 3} cortes más hoy...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button: Filter Citas by this barber */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBarberFilter(barber.id);
                    setAdminTab('citas');
                  }}
                  className="text-[12px] text-[#c5a059] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <span>Ver todas las citas de {barber.name.split(' ')[0]}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="text-[11px] text-zinc-400">
                  Total Semanal: <span className="text-white font-bold">L. {weeklyRevenue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          ADMIN SUBTABS: CITAS | SERVICIOS | BARBEROS | LOCALES | WALK-IN
          ========================================================================= */}
      <div className="sticky top-0 z-20 pt-2 pb-1 bg-[#0d0d0f]/90 backdrop-blur-md">
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'citas', label: 'Citas', count: appointments.length },
            { id: 'servicios', label: 'Servicios', count: services.length },
            { id: 'barberos', label: 'Barberos', count: barbers.length },
            { id: 'locales', label: 'Locales', count: branches.length },
            { id: 'walkin', label: '+ Presencial' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAdminTab(tab.id as any)}
              className={`py-1.5 px-3 rounded-[12px] text-[12px] font-semibold whitespace-nowrap border transition-colors ios-active cursor-pointer ${
                adminTab === tab.id
                  ? 'bg-[#c5a059] border-[#c5a059] text-black shadow-sm font-bold'
                  : 'bg-[#1c1c1e] border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-1 text-[10px] opacity-80">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* SUBTAB 1: CITAS MANAGER */}
      {adminTab === 'citas' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar cliente, teléfono o código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1c1c1e] border border-white/10 rounded-[12px] pl-9 pr-3 py-2 text-white placeholder-zinc-500 text-[12px] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <button
                type="button"
                onClick={() => setDateFilter(dateFilter === 'hoy' ? 'todas' : 'hoy')}
                className={`px-3 py-2 text-[12px] font-semibold rounded-[12px] border transition-colors ${
                  dateFilter === 'hoy'
                    ? 'bg-[#c5a059] border-[#c5a059] text-black'
                    : 'bg-[#1c1c1e] border-white/10 text-zinc-300'
                }`}
              >
                {dateFilter === 'hoy' ? 'Solo Hoy' : 'Todas'}
              </button>
            </div>

            {/* Filter by Branch */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setBranchFilter('todos')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border shrink-0 ${
                  branchFilter === 'todos'
                    ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059] font-bold'
                    : 'bg-[#1c1c1e] border-white/5 text-zinc-400'
                }`}
              >
                Todos los Locales
              </button>
              {branches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBranchFilter(b.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border shrink-0 ${
                    branchFilter === b.id
                      ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059] font-bold'
                      : 'bg-[#1c1c1e] border-white/5 text-zinc-400'
                  }`}
                >
                  {b.shortName}
                </button>
              ))}

              {selectedBarberFilter !== 'todos' && (
                <button
                  type="button"
                  onClick={() => setSelectedBarberFilter('todos')}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-red-500/20 text-red-300 border border-red-500/30 font-medium shrink-0 flex items-center space-x-1"
                >
                  <span>Quitar filtro barbero</span>
                  <XCircle className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Status Chips */}
            <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'pendiente', label: 'Pendientes' },
                { id: 'confirmada', label: 'Confirmadas' },
                { id: 'completada', label: 'Completadas' },
                { id: 'cancelada', label: 'Canceladas' }
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setStatusFilter(chip.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors shrink-0 ${
                    statusFilter === chip.id
                      ? 'bg-white/20 border-white/30 text-white font-semibold'
                      : 'bg-[#1c1c1e] border-white/5 text-zinc-400'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Appointments */}
          {filteredAppointments.length > 0 ? (
            <div className="space-y-2.5">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-[#1c1c1e] rounded-[18px] p-3.5 border border-white/5 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-bold text-[#c5a059]">
                          {apt.id}
                        </span>
                        <span className="text-[10px] text-zinc-400 bg-white/5 px-1.5 py-0.2 rounded font-medium">
                          📍 {apt.branchName || 'Sabá, Colón'}
                        </span>
                      </div>
                      <h4 className="text-[15px] font-bold text-white mt-0.5">
                        {apt.clientName}
                      </h4>
                      <p className="text-[12px] text-zinc-400">
                        {apt.serviceName} • <span className="text-[#c5a059] font-bold">L. {apt.servicePrice}</span> • Barbero:{' '}
                        <span className="text-zinc-200">{apt.barberName}</span>
                      </p>
                      <p className="text-[11px] text-zinc-300 font-medium mt-0.5">
                        📅 {apt.date} a las {apt.time} hrs • Tel: {apt.clientPhone}
                      </p>
                      {apt.notes && (
                        <p className="text-[11px] text-zinc-400 italic mt-0.5">
                          Nota: "{apt.notes}"
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {apt.status === 'pendiente' && (
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          Pendiente
                        </span>
                      )}
                      {apt.status === 'confirmada' && (
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          Confirmada
                        </span>
                      )}
                      {apt.status === 'completada' && (
                        <span className="text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full">
                          Completada
                        </span>
                      )}
                      {apt.status === 'cancelada' && (
                        <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                          Cancelada
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      {apt.status === 'pendiente' && (
                        <button
                          type="button"
                          onClick={() => updateAppointmentStatus(apt.id, 'confirmada')}
                          className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[10px] text-[11px] font-semibold flex items-center space-x-1 ios-active cursor-pointer"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Confirmar</span>
                        </button>
                      )}

                      {apt.status === 'confirmada' && (
                        <button
                          type="button"
                          onClick={() => updateAppointmentStatus(apt.id, 'completada')}
                          className="py-1 px-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-[10px] text-[11px] font-semibold flex items-center space-x-1 ios-active cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completar</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          onShowWhatsAppToClient(
                            apt.clientPhone,
                            `¡Hola ${apt.clientName}! Te saludamos de Barbería Walin 💈 para confirmar tu cita el día ${apt.date} a las ${apt.time} con ${apt.barberName} en nuestro ${apt.branchName || 'local'}. ¡Te esperamos!`
                          )
                        }
                        className="py-1 px-2.5 bg-white/5 hover:bg-white/10 text-emerald-400 rounded-[10px] text-[11px] font-medium flex items-center space-x-1 border border-white/5 ios-active cursor-pointer"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onCallClient(apt.clientPhone)}
                        className="py-1 px-2 bg-white/5 hover:bg-white/10 text-[#0a84ff] rounded-[10px] text-[11px] font-medium border border-white/5 ios-active cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      {apt.status !== 'cancelada' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setAlertType('cancel');
                          }}
                          className="text-[11px] text-zinc-400 hover:text-red-400 py-1 px-1.5 cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setAlertType('delete');
                        }}
                        className="text-[11px] text-zinc-600 hover:text-red-500 py-1 px-1.5 cursor-pointer"
                        title="Borrar cita"
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1c1c1e] rounded-[18px] p-6 text-center text-zinc-400 text-xs">
              No se encontraron citas con los filtros seleccionados.
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: GESTIÓN DE SERVICIOS */}
      {adminTab === 'servicios' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-[15px] font-bold text-white">Servicios y Tarifas (L.)</h3>
              <p className="text-[11px] text-zinc-400">Modifica precios en Lempiras hondureños</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setServiceForm({
                  name: '',
                  price: 150,
                  durationMinutes: 30,
                  description: '',
                  category: 'cortes',
                  popular: false
                });
                setShowAddService(true);
              }}
              className="py-1.5 px-3 bg-[#c5a059] text-black font-semibold text-[12px] rounded-[10px] flex items-center space-x-1 ios-active cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Nuevo Servicio</span>
            </button>
          </div>

          <div className="space-y-2">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-[#1c1c1e] rounded-[16px] p-3.5 border border-white/5 flex items-center justify-between"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-[14px] font-semibold text-white">
                      {service.name}
                    </h4>
                    {!service.active && (
                      <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-bold">
                        Pausado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                    {service.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1 text-[11px]">
                    <span className="font-black text-[#c5a059] text-[14px]">
                      L. {service.price}
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">{service.durationMinutes} min</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setServiceForm({
                        id: service.id,
                        name: service.name,
                        price: service.price,
                        durationMinutes: service.durationMinutes,
                        description: service.description,
                        category: service.category,
                        popular: !!service.popular
                      });
                      setShowAddService(true);
                    }}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <IOSToggle
                    checked={service.active}
                    onChange={(active) => toggleServiceActive(service.id, active)}
                    color="gold"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Eliminar servicio ${service.name}?`)) {
                        deleteService(service.id);
                      }
                    }}
                    className="p-1.5 text-zinc-600 hover:text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add / Edit Service Modal */}
          {showAddService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-sm bg-[#252528] rounded-[22px] border border-white/10 p-5 space-y-3 shadow-2xl">
                <h4 className="text-[16px] font-bold text-white">
                  {serviceForm.id ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h4>

                <form onSubmit={handleSaveService} className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">Nombre del Servicio *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Corte Fade + Barba"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-zinc-400 block mb-1">Precio (Lempiras L.) *</label>
                      <input
                        type="number"
                        required
                        value={serviceForm.price}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, price: Number(e.target.value) })
                        }
                        className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white font-bold text-[#c5a059]"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Duración (min) *</label>
                      <input
                        type="number"
                        required
                        value={serviceForm.durationMinutes}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            durationMinutes: Number(e.target.value)
                          })
                        }
                        className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Categoría</label>
                    <select
                      value={serviceForm.category}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, category: e.target.value as any })
                      }
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white"
                    >
                      <option value="cortes">Cortes</option>
                      <option value="barba">Barba</option>
                      <option value="combos">Combos VIP</option>
                      <option value="tratamientos">Tratamientos / Spa</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Descripción</label>
                    <textarea
                      rows={2}
                      placeholder="Detalles del servicio..."
                      value={serviceForm.description}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, description: e.target.value })
                      }
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddService(false)}
                      className="py-2 px-3 text-zinc-400 text-[13px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-[#c5a059] text-black font-semibold rounded-[10px] text-[13px]"
                    >
                      Guardar Servicio
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: GESTIÓN DE BARBEROS */}
      {adminTab === 'barberos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-[15px] font-bold text-white">Equipo de Barberos</h3>
              <p className="text-[11px] text-zinc-400">Asigna a Local #1 (Elixir) o Local #2 (El Esfuerzo)</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBarberForm({
                  name: '',
                  role: 'Barbero Especialista',
                  specialties: 'Cortes clásicos, degradados y barba',
                  assignedBranchId: 'all',
                  avatarUrl:
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
                });
                setShowAddBarber(true);
              }}
              className="py-1.5 px-3 bg-[#c5a059] text-black font-semibold text-[12px] rounded-[10px] flex items-center space-x-1 ios-active cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Nuevo Barbero</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="bg-[#1c1c1e] rounded-[18px] p-3.5 border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={barber.avatarUrl}
                    alt={barber.name}
                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <h4 className="text-[14px] font-semibold text-white">
                      {barber.name}
                    </h4>
                    <p className="text-[11px] text-[#c5a059] font-medium">
                      {barber.role}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      📍 {barber.assignedBranchName || 'Ambos locales'}
                    </p>
                    <span
                      className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        barber.available
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {barber.available ? 'En Turno Activo' : 'De Descanso'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <IOSToggle
                    checked={barber.available}
                    onChange={(avail) => toggleBarberAvailability(barber.id, avail)}
                    color="gold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Eliminar barbero ${barber.name}?`)) {
                        deleteBarber(barber.id);
                      }
                    }}
                    className="p-1.5 text-zinc-600 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Barber Modal */}
          {showAddBarber && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-sm bg-[#252528] rounded-[22px] border border-white/10 p-5 space-y-3 shadow-2xl">
                <h4 className="text-[16px] font-bold text-white">Nuevo Barbero</h4>

                <form onSubmit={handleSaveBarber} className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Brayan Martínez"
                      value={barberForm.name}
                      onChange={(e) => setBarberForm({ ...barberForm, name: e.target.value })}
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Cargo / Especialidad</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Especialista en Fade y Cejas"
                      value={barberForm.role}
                      onChange={(e) => setBarberForm({ ...barberForm, role: e.target.value })}
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Asignar a Local en Sabá</label>
                    <select
                      value={barberForm.assignedBranchId}
                      onChange={(e) =>
                        setBarberForm({ ...barberForm, assignedBranchId: e.target.value as any })
                      }
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white"
                    >
                      <option value="all">Ambos Locales (Rotativo)</option>
                      <option value="local-1">Local #1 - Elixir, Sabá, Colón</option>
                      <option value="local-2">Local #2 - Aldea El Esfuerzo, Sabá, Colón</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">URL de Foto (Avatar)</label>
                    <input
                      type="text"
                      value={barberForm.avatarUrl}
                      onChange={(e) =>
                        setBarberForm({ ...barberForm, avatarUrl: e.target.value })
                      }
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBarber(false)}
                      className="py-2 px-3 text-zinc-400 text-[13px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-[#c5a059] text-black font-semibold rounded-[10px] text-[13px]"
                    >
                      Guardar Barbero
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: GESTIÓN DE LOCALES */}
      {adminTab === 'locales' && (
        <div className="space-y-3">
          <div className="px-1">
            <h3 className="text-[15px] font-bold text-white">Configuración de Locales</h3>
            <p className="text-[11px] text-zinc-400">
              Modifica direcciones, teléfonos de WhatsApp y horarios de tus 2 locales en Sabá, Colón.
            </p>
          </div>

          <div className="space-y-3">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="bg-[#1c1c1e] rounded-[18px] p-4 border border-white/5 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#c5a059] uppercase">
                      {branch.shortName}
                    </span>
                    <h4 className="text-[15px] font-bold text-white leading-tight">
                      {branch.name}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingBranch(branch);
                      setBranchForm({
                        id: branch.id,
                        name: branch.name,
                        address: branch.address,
                        phone: branch.phone,
                        whatsapp: branch.whatsapp,
                        scheduleWeekdays: branch.scheduleWeekdays
                      });
                    }}
                    className="py-1 px-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-[10px] text-[11px] font-medium flex items-center space-x-1 border border-white/10 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                </div>

                <div className="text-xs text-zinc-300 space-y-1">
                  <p>📍 <span className="text-zinc-400">Dirección:</span> {branch.address}</p>
                  <p>📞 <span className="text-zinc-400">Teléfono:</span> {branch.phone}</p>
                  <p>💬 <span className="text-zinc-400">WhatsApp:</span> +{branch.whatsapp}</p>
                  <p>⏰ <span className="text-zinc-400">Horario:</span> {branch.scheduleWeekdays}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Branch Modal */}
          {editingBranch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-sm bg-[#252528] rounded-[22px] border border-white/10 p-5 space-y-3 shadow-2xl">
                <h4 className="text-[16px] font-bold text-white">
                  Editar {editingBranch.name}
                </h4>

                <form onSubmit={handleSaveBranch} className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={branchForm.name}
                      onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Dirección Exacta</label>
                    <input
                      type="text"
                      required
                      value={branchForm.address}
                      onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Teléfono Local</label>
                    <input
                      type="text"
                      required
                      value={branchForm.phone}
                      onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">WhatsApp (con 504 ej: 50498765432)</label>
                    <input
                      type="text"
                      required
                      value={branchForm.whatsapp}
                      onChange={(e) => setBranchForm({ ...branchForm, whatsapp: e.target.value })}
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Horario de Atención</label>
                    <input
                      type="text"
                      required
                      value={branchForm.scheduleWeekdays}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, scheduleWeekdays: e.target.value })
                      }
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-[10px] px-3 py-2 text-white"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingBranch(null)}
                      className="py-2 px-3 text-zinc-400 text-[13px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-[#c5a059] text-black font-semibold rounded-[10px] text-[13px]"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 5: WALK-IN / CLIENTE PRESENCIAL EN SABÁ */}
      {adminTab === 'walkin' && (
        <div className="bg-[#1c1c1e] rounded-[20px] p-4 border border-white/5 space-y-3">
          <div>
            <h3 className="text-[15px] font-bold text-white">
              Registrar Cliente en Salón (Walk-in)
            </h3>
            <p className="text-[11px] text-zinc-400">
              Registra directamente a una persona que entra a cortarse en Elixir o Aldea El Esfuerzo.
            </p>
          </div>

          {walkinSuccess && (
            <div className="bg-emerald-500/20 text-emerald-300 p-2.5 rounded-[12px] text-xs font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>¡Cita presencial registrada con éxito!</span>
            </div>
          )}

          <form onSubmit={handleCreateWalkin} className="space-y-3 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1 font-semibold">
                Local de Atención *
              </label>
              <select
                value={walkinBranchId}
                onChange={(e) => setWalkinBranchId(e.target.value)}
                className="w-full bg-[#252528] border border-white/10 rounded-[12px] px-3.5 py-2.5 text-white text-[13px]"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.villageOrSector})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1 font-semibold">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                required
                placeholder="Nombre"
                value={walkinName}
                onChange={(e) => setWalkinName(e.target.value)}
                className="w-full bg-[#252528] border border-white/10 rounded-[12px] px-3.5 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1 font-semibold">
                Teléfono / WhatsApp *
              </label>
              <input
                type="tel"
                required
                placeholder="Ej: 9876-5432"
                value={walkinPhone}
                onChange={(e) => setWalkinPhone(e.target.value)}
                className="w-full bg-[#252528] border border-white/10 rounded-[12px] px-3.5 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-zinc-400 block mb-1 font-semibold">
                  Servicio
                </label>
                <select
                  value={walkinServiceId}
                  onChange={(e) => setWalkinServiceId(e.target.value)}
                  className="w-full bg-[#252528] border border-white/10 rounded-[12px] px-3 py-2 text-white text-[12px]"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (L. {s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-semibold">
                  Barbero
                </label>
                <select
                  value={walkinBarberId}
                  onChange={(e) => setWalkinBarberId(e.target.value)}
                  className="w-full bg-[#252528] border border-white/10 rounded-[12px] px-3 py-2 text-white text-[12px]"
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1 font-semibold">
                Hora del Turno
              </label>
              <input
                type="time"
                value={walkinTime}
                onChange={(e) => setWalkinTime(e.target.value)}
                className="w-full bg-[#252528] border border-white/10 rounded-[12px] px-3 py-2 text-white text-[12px]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#c5a059] text-black font-bold text-[14px] rounded-[14px] shadow-md ios-active cursor-pointer"
            >
              Registrar Turno Presencial
            </button>
          </form>
        </div>
      )}

      {/* Confirmation Alerts */}
      <IOSAlert
        isOpen={alertType === 'cancel'}
        title="¿Cancelar Cita?"
        message={`¿Deseas marcar la cita ${selectedAppointment?.id} como cancelada?`}
        actions={[
          {
            text: 'Volver',
            style: 'cancel',
            onClick: () => setAlertType(null)
          },
          {
            text: 'Sí, Cancelar',
            style: 'destructive',
            onClick: () => {
              if (selectedAppointment) {
                updateAppointmentStatus(selectedAppointment.id, 'cancelada');
              }
              setAlertType(null);
            }
          }
        ]}
        onClose={() => setAlertType(null)}
      />

      <IOSAlert
        isOpen={alertType === 'delete'}
        title="¿Eliminar Cita?"
        message={`Esta acción removerá el registro ${selectedAppointment?.id} permanentemente.`}
        actions={[
          {
            text: 'Cancelar',
            style: 'cancel',
            onClick: () => setAlertType(null)
          },
          {
            text: 'Eliminar Cita',
            style: 'destructive',
            onClick: () => {
              if (selectedAppointment) {
                deleteAppointment(selectedAppointment.id);
              }
              setAlertType(null);
            }
          }
        ]}
        onClose={() => setAlertType(null)}
      />
    </div>
  );
};
