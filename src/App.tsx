import React, { useState, useEffect, useRef } from 'react';
import {
  Scissors,
  Phone,
  MessageCircle,
  Smartphone,
  Monitor,
  Calendar,
  Lock,
  Unlock,
  Store,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Download
} from 'lucide-react';
import {
  testFirestoreConnection
} from './firebase/config';
import {
  seedInitialDataIfEmpty,
  subscribeToAppointments,
  subscribeToBarbers,
  subscribeToServices,
  subscribeToBranches,
  subscribeToSettings,
  INITIAL_SERVICES,
  INITIAL_BARBERS,
  INITIAL_BRANCHES,
  INITIAL_SHOP_INFO
} from './services/barberService';
import { Appointment, BarberProfile, Branch, ServiceItem, ShopInfo } from './types';
import { IOSStatusBar } from './components/ios/IOSStatusBar';
import { IOSDynamicIsland, DynamicIslandNotification } from './components/ios/IOSDynamicIsland';
import { IOSTabBar, TabKey } from './components/ios/IOSTabBar';
import { IOSActionSheet, ActionSheetOption } from './components/ios/IOSActionSheet';
import { HomeView } from './components/HomeView';
import { ServicesView } from './components/ServicesView';
import { BookingWizardView } from './components/BookingWizardView';
import { MyAppointmentsView } from './components/MyAppointmentsView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { InstallAppModal } from './components/InstallAppModal';

export default function App() {
  // App Separator: 'client' (App para Cliente Final) vs 'admin' (App Propietario & Barberos)
  const [activeApp, setActiveApp] = useState<'client' | 'admin'>('client');

  // Navigation State inside Client App
  const [clientTab, setClientTab] = useState<TabKey>('home');
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);
  const [preselectedBranchId, setPreselectedBranchId] = useState<string | null>(null);

  // Admin Login Security (Protects Owner App)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [adminPasscode, setAdminPasscode] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<boolean>(false);

  // App Installation Modal (PWA / iOS / Android)
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  // Device view mode: 'phone' (iPhone 16 Pro frame) vs 'full' (fullscreen web)
  const [viewMode, setViewMode] = useState<'phone' | 'full'>('phone');

  // Firestore Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [barbers, setBarbers] = useState<BarberProfile[]>(INITIAL_BARBERS);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [shopInfo, setShopInfo] = useState<ShopInfo>(INITIAL_SHOP_INFO);

  // Dynamic Island Alert state
  const [dynamicIslandAlert, setDynamicIslandAlert] = useState<DynamicIslandNotification | null>(null);

  // Action Sheet state (Quick Contact / WhatsApp)
  const [showContactSheet, setShowContactSheet] = useState<boolean>(false);
  const [contactSheetTitle, setContactSheetTitle] = useState<string>('Barbería Walin');
  const [contactSheetMessage, setContactSheetMessage] = useState<string>('¿Cómo deseas comunicarte?');
  const [customContactOptions, setCustomContactOptions] = useState<ActionSheetOption[] | null>(null);

  // Scroll ref for large title collapse
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Initialize Firebase connection and real-time listeners
  useEffect(() => {
    async function boot() {
      await testFirestoreConnection();
      await seedInitialDataIfEmpty();
    }
    boot();

    const unsubAppointments = subscribeToAppointments((data) => setAppointments(data));
    const unsubServices = subscribeToServices((data) => setServices(data));
    const unsubBarbers = subscribeToBarbers((data) => setBarbers(data));
    const unsubBranches = subscribeToBranches((data) => setBranches(data));
    const unsubSettings = subscribeToSettings((data) => setShopInfo(data));

    return () => {
      unsubAppointments();
      unsubServices();
      unsubBarbers();
      unsubBranches();
      unsubSettings();
    };
  }, []);

  // Dynamic Island trigger helper
  const triggerIslandNotification = (
    title: string,
    subtitle?: string,
    icon: 'success' | 'booking' | 'time' | 'info' = 'success',
    duration = 4500
  ) => {
    setDynamicIslandAlert({
      id: String(Date.now()),
      title,
      subtitle,
      icon,
      duration
    });

    setTimeout(() => {
      setDynamicIslandAlert(null);
    }, duration);
  };

  // Preselection handlers
  const handleSelectServiceAndBook = (serviceId: string) => {
    setPreselectedServiceId(serviceId);
    setClientTab('book');
    triggerIslandNotification('Servicio Seleccionado', 'Configura tu turno', 'booking', 3000);
  };

  const handleSelectBranchAndBook = (branchId: string) => {
    setPreselectedBranchId(branchId);
    setClientTab('book');
    const branchObj = branches.find((b) => b.id === branchId);
    triggerIslandNotification('Local Seleccionado', branchObj ? branchObj.shortName : 'Sabá', 'info', 3000);
  };

  // Scroll handler for iOS Large Navigation Bar
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    if (top > 35 && !isScrolled) {
      setIsScrolled(true);
    } else if (top <= 35 && isScrolled) {
      setIsScrolled(false);
    }
  };

  // WhatsApp & Phone handlers for Honduras
  const openWhatsAppDirect = (phone = '50498765432', text = '¡Hola Barbería Walin! Me gustaría consultar citas.') => {
    const clean = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${clean}?text=${encoded}`, '_blank');
  };

  const openCallDirect = (phone = '+50498765432') => {
    window.location.href = `tel:${phone}`;
  };

  const openClientWhatsAppFromAdmin = (clientPhone: string, text: string) => {
    let clean = clientPhone.replace(/[^0-9]/g, '');
    if (!clean.startsWith('504') && clean.length === 8) {
      clean = '504' + clean;
    }
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${clean}?text=${encoded}`, '_blank');
    triggerIslandNotification('WhatsApp Abierto', 'Mensaje listo para el cliente', 'success', 3000);
  };

  // Contact Action Sheet
  const openGeneralContactSheet = () => {
    setContactSheetTitle('Barbería Walin • Sabá, Colón');
    setContactSheetMessage('Atención en Local #1 (Elixir) y Local #2 (El Esfuerzo)');
    setCustomContactOptions(null);
    setShowContactSheet(true);
  };

  // Switch to Admin App
  const handleRequestSwitchToAdmin = () => {
    if (isAdminUnlocked) {
      setActiveApp('admin');
      triggerIslandNotification('App Propietario', 'Reportes y Citas', 'success', 3000);
    } else {
      setShowAdminLoginModal(true);
    }
  };

  const handleVerifyAdminPasscode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPasscode === '1234' || adminPasscode.toLowerCase() === 'walin') {
      setIsAdminUnlocked(true);
      setShowAdminLoginModal(false);
      setAdminPasscode('');
      setPasscodeError(false);
      setActiveApp('admin');
      triggerIslandNotification('App Propietario Abierta', 'Bienvenido Walin', 'success', 3500);
    } else {
      setPasscodeError(true);
    }
  };

  const handleQuickAdminLogin = () => {
    setIsAdminUnlocked(true);
    setShowAdminLoginModal(false);
    setAdminPasscode('');
    setPasscodeError(false);
    setActiveApp('admin');
    triggerIslandNotification('App Propietario Abierta', 'Acceso Propietario', 'success', 3500);
  };

  const handleSwitchToClientApp = () => {
    setActiveApp('client');
    triggerIslandNotification('App Clientes', 'Vista para clientes', 'info', 2500);
  };

  // Contact options
  const defaultContactOptions: ActionSheetOption[] = [
    {
      text: 'Local #1 - Elixir (WhatsApp)',
      subtext: '+504 9876-5432 • Sabá, Colón',
      icon: <MessageCircle className="w-5 h-5 text-emerald-400" />,
      onClick: () => openWhatsAppDirect('50498765432', '¡Hola! Quisiera consultar turno para Local #1 en Elixir.')
    },
    {
      text: 'Local #2 - Aldea El Esfuerzo (WhatsApp)',
      subtext: '+504 9555-1234 • Sabá, Colón',
      icon: <MessageCircle className="w-5 h-5 text-emerald-400" />,
      onClick: () => openWhatsAppDirect('50495551234', '¡Hola! Quisiera consultar turno para Local #2 en Aldea El Esfuerzo.')
    },
    {
      text: 'Llamar a Barbería Walin',
      subtext: 'Línea telefónica directa',
      icon: <Phone className="w-5 h-5 text-[#0a84ff]" />,
      onClick: () => openCallDirect('+50498765432')
    }
  ];

  const getClientTabTitle = () => {
    switch (clientTab) {
      case 'home':
        return 'Barbería Walin';
      case 'services':
        return 'Servicios & Tarifas';
      case 'book':
        return 'Reservar Cita';
      case 'my-appointments':
        return 'Mis Citas';
      default:
        return 'Barbería Walin';
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#f2f2f7] flex flex-col items-center justify-center relative font-sans overflow-x-hidden selection:bg-[#c5a059]/30">
      {/* Top Floating App & Device Selector */}
      <header className="fixed top-3 z-50 flex items-center space-x-1.5 bg-black/85 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full shadow-2xl text-xs">
        {/* App Switcher: App Clientes vs App Propietario */}
        <div className="flex items-center space-x-1 pr-2 border-r border-white/10">
          <button
            type="button"
            onClick={handleSwitchToClientApp}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              activeApp === 'client'
                ? 'bg-gradient-to-r from-[#c5a059] to-[#dfc07f] text-black font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3 h-3" />
            <span>App Clientes</span>
          </button>

          <button
            type="button"
            onClick={handleRequestSwitchToAdmin}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
              activeApp === 'admin'
                ? 'bg-[#c5a059] text-black font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>App Propietario</span>
          </button>
        </div>

        {/* Viewport Frame Mode */}
        <div className="flex items-center space-x-1 pl-1">
          <button
            type="button"
            onClick={() => setViewMode('phone')}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'phone' ? 'text-[#c5a059]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Vista iPhone"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setViewMode('full')}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'full' ? 'text-[#c5a059]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Pantalla Completa"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* In-App Installation Button for iOS / Android */}
        <div className="pl-1 border-l border-white/10">
          <button
            type="button"
            onClick={() => setShowInstallModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer font-bold text-[11px]"
            title="Instalar App en Celular (iOS / Android)"
          >
            <Download className="w-3 h-3" />
            <span>Instalar App</span>
          </button>
        </div>
      </header>

      {/* Main Container - Switches between iPhone Frame and Full Responsive Layout */}
      <div
        className={`transition-all duration-300 w-full ${
          viewMode === 'phone'
            ? 'max-w-[412px] h-[870px] my-10 rounded-[50px] shadow-[0_0_60px_rgba(0,0,0,0.85),0_0_0_12px_#1c1c1e,0_0_0_14px_#38383a] border-4 border-black/80 relative overflow-hidden flex flex-col'
            : 'max-w-2xl min-h-screen my-0 rounded-none shadow-none border-none relative flex flex-col'
        } bg-[#0d0d0f]`}
      >
        {/* iOS Native Status Bar */}
        <IOSStatusBar />

        {/* Apple Dynamic Island */}
        <IOSDynamicIsland
          notification={dynamicIslandAlert}
          onDismiss={() => setDynamicIslandAlert(null)}
        />

        {/* =========================================================================
            APP 1: BARBERÍA WALIN - CLIENTES (100% PURE CLIENT EXPERIENCE)
            ========================================================================= */}
        {activeApp === 'client' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* iOS Navigation Bar */}
            <div
              className={`sticky top-0 z-30 transition-all duration-200 border-b ${
                isScrolled
                  ? 'bg-[#121214]/90 backdrop-blur-xl border-white/10 shadow-md py-2.5 px-4'
                  : 'bg-transparent border-transparent pt-3 pb-1 px-5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="transition-all">
                  {isScrolled ? (
                    <h2 className="text-[16px] font-bold text-white tracking-tight font-serif truncate text-center">
                      {getClientTabTitle()}
                    </h2>
                  ) : (
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-[#c5a059] font-bold">
                        Barbería Walin • Sabá, Colón
                      </span>
                      <h1 className="text-[24px] font-black tracking-tight text-white font-serif leading-tight">
                        {getClientTabTitle()}
                      </h1>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setShowInstallModal(true)}
                    className="w-8 h-8 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 flex items-center justify-center text-emerald-400 border border-emerald-500/20 ios-active shrink-0 cursor-pointer"
                    title="Instalar App en tu Celular"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={openGeneralContactSheet}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-white border border-white/10 ios-active shrink-0 cursor-pointer"
                    title="Contacto"
                  >
                    <Phone className="w-4 h-4 text-[#c5a059]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable View Content */}
            <main
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 pt-2 no-scrollbar"
            >
              {clientTab === 'home' && (
                <HomeView
                  services={services}
                  barbers={barbers}
                  branches={branches}
                  shopInfo={shopInfo}
                  onSelectServiceAndBook={handleSelectServiceAndBook}
                  onSelectBranchAndBook={handleSelectBranchAndBook}
                  onNavigateToTab={(tab) => setClientTab(tab)}
                  onShowWhatsApp={openWhatsAppDirect}
                  onCall={openCallDirect}
                />
              )}

              {clientTab === 'services' && (
                <ServicesView
                  services={services}
                  onSelectServiceAndBook={handleSelectServiceAndBook}
                />
              )}

              {clientTab === 'book' && (
                <BookingWizardView
                  services={services}
                  barbers={barbers}
                  branches={branches}
                  preselectedServiceId={preselectedServiceId}
                  preselectedBranchId={preselectedBranchId}
                  existingAppointments={appointments}
                  onBookingSuccess={(aptId) => {
                    triggerIslandNotification('¡Cita Confirmada!', `Código: ${aptId}`, 'booking', 5000);
                  }}
                  onCancel={() => {
                    setPreselectedServiceId(null);
                    setPreselectedBranchId(null);
                    setClientTab('home');
                  }}
                />
              )}

              {clientTab === 'my-appointments' && (
                <MyAppointmentsView
                  appointments={appointments}
                  onNavigateToBook={() => setClientTab('book')}
                  onShowWhatsApp={openWhatsAppDirect}
                />
              )}
            </main>

            {/* iOS Native Tab Bar for Clients (Zero Admin items) */}
            <IOSTabBar
              currentTab={clientTab}
              onTabChange={(tab) => {
                setClientTab(tab);
                if (tab !== 'book') {
                  setPreselectedServiceId(null);
                  setPreselectedBranchId(null);
                }
              }}
              showAdminTab={false}
            />
          </div>
        )}

        {/* =========================================================================
            APP 2: WALIN MANAGER - PROPIETARIO & REPORTES (ADMIN APP)
            ========================================================================= */}
        {activeApp === 'admin' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#121214]/90 backdrop-blur-xl border-b border-white/10 py-2.5 px-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-bold">
                  App de Gestión
                </span>
                <h1 className="text-[18px] font-bold text-white font-serif leading-tight">
                  Panel Propietario
                </h1>
              </div>

              <button
                type="button"
                onClick={handleSwitchToClientApp}
                className="py-1 px-2.5 bg-white/10 hover:bg-white/15 text-white rounded-[10px] text-[11px] font-semibold border border-white/10 ios-active"
              >
                Volver a Clientes
              </button>
            </div>

            <main className="flex-1 overflow-y-auto px-4 pt-3 no-scrollbar">
              <AdminDashboardView
                appointments={appointments}
                services={services}
                barbers={barbers}
                branches={branches}
                shopInfo={shopInfo}
                onSwitchToClientApp={handleSwitchToClientApp}
                onShowWhatsAppToClient={openClientWhatsAppFromAdmin}
                onCallClient={(phone) => openCallDirect(phone)}
              />
            </main>
          </div>
        )}
      </div>

      {/* iOS Action Sheet for Contact */}
      <IOSActionSheet
        isOpen={showContactSheet}
        title={contactSheetTitle}
        message={contactSheetMessage}
        options={customContactOptions || defaultContactOptions}
        cancelText="Cerrar"
        onClose={() => setShowContactSheet(false)}
      />

      {/* Admin Passcode Modal (Protects Owner App) */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-xs bg-[#252528] rounded-[24px] border border-white/10 p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/15 text-[#c5a059] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-[17px] font-bold text-white font-serif">
                Acceso a la App de Propietario
              </h3>
              <p className="text-[12px] text-zinc-400 mt-0.5">
                Ingresa el PIN de seguridad de Barbería Walin
              </p>
            </div>

            <form onSubmit={handleVerifyAdminPasscode} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                placeholder="PIN (1234)"
                value={adminPasscode}
                onChange={(e) => {
                  setAdminPasscode(e.target.value);
                  setPasscodeError(false);
                }}
                className={`w-full text-center tracking-widest text-[20px] font-bold bg-[#1c1c1e] border rounded-[14px] py-2.5 text-white focus:outline-none ${
                  passcodeError ? 'border-red-500' : 'border-white/10 focus:border-[#c5a059]'
                }`}
              />

              {passcodeError && (
                <p className="text-red-400 text-xs font-medium">PIN incorrecto.</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold text-[14px] rounded-[12px] shadow-md ios-active cursor-pointer"
              >
                Abrir App Propietario
              </button>
            </form>

            <div className="pt-1 space-y-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-[#c5a059] text-[12px] font-semibold rounded-[10px] flex items-center justify-center space-x-1.5 ios-active"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Acceso Rápido Walin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAdminLoginModal(false);
                  setPasscodeError(false);
                  setAdminPasscode('');
                }}
                className="w-full text-zinc-400 text-xs hover:text-white py-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Installation Modal for iOS and Android */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        targetApp={activeApp}
      />
    </div>
  );
}
