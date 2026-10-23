import React, { useState } from 'react';
import {
  Download,
  Share2,
  Smartphone,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetApp?: 'client' | 'admin';
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  targetApp = 'client'
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [selectedApp, setSelectedApp] = useState<'client' | 'admin'>(targetApp);

  if (!isOpen) return null;

  const appTitle = selectedApp === 'client' ? 'Barbería Walin' : 'Walin Manager';
  const appSubtitle =
    selectedApp === 'client'
      ? 'App Oficial de Clientes & Citas'
      : 'App de Administración & Reportes';

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      await install();
    }
  };

  // Helper to download web package with manifests and icons
  const handleDownloadAppBundle = () => {
    const data = {
      appName: appTitle,
      version: '1.0.0',
      iconUrl: window.location.origin + '/assets/aistudio/logo_87989ac7.png',
      appUrl: window.location.origin + (selectedApp === 'admin' ? '/?app=admin' : '/'),
      platform: 'PWA WebAPK / iOS Web Clip',
      instructions: {
        ios: 'Abre este enlace en Safari en tu iPhone, presiona el botón Compartir y pulsa "Añadir a la pantalla de inicio". Tendrá el icono dorado de Barbería Walin.',
        android: 'Abre este enlace en Google Chrome en tu celular Android, pulsa el botón de menú (3 puntos) y elige "Instalar aplicación" o "Añadir a la pantalla principal".',
        apkGooglePlay: 'Para generar un archivo .apk firmado directo para la Play Store, ingresa la URL de esta app en https://www.pwabuilder.com y descarga el paquete APK listo.'
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `walin-${selectedApp}-app-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#1c1c1e] border border-[#c5a059]/40 rounded-[28px] p-5 shadow-2xl space-y-4 text-center overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Golden Logo Preview */}
        <div className="pt-2 flex flex-col items-center">
          <div className="relative w-20 h-20 rounded-[22px] overflow-hidden shadow-2xl border-2 border-[#c5a059] p-0.5 bg-black">
            <img
              src="/assets/aistudio/logo_87989ac7.png"
              alt="Barbería Walin"
              className="w-full h-full object-cover rounded-[18px]"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-4 h-4 border-2 border-black flex items-center justify-center">
              <CheckCircle2 className="w-2.5 h-2.5 text-black stroke-[3]" />
            </span>
          </div>

          <h3 className="text-[18px] font-bold text-white font-serif mt-2.5">
            {appTitle}
          </h3>
          <p className="text-[11px] text-[#c5a059] font-medium">
            {appSubtitle}
          </p>
        </div>

        {/* App Switcher for installation */}
        <div className="bg-[#242428] p-1 rounded-[12px] flex items-center border border-white/5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedApp('client')}
            className={`flex-1 py-1.5 rounded-[9px] transition-colors ${
              selectedApp === 'client'
                ? 'bg-[#c5a059] text-black font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            App Clientes
          </button>
          <button
            type="button"
            onClick={() => setSelectedApp('admin')}
            className={`flex-1 py-1.5 rounded-[9px] transition-colors ${
              selectedApp === 'admin'
                ? 'bg-[#c5a059] text-black font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            App Administración
          </button>
        </div>

        {/* Platform Guides */}
        <div className="space-y-2.5 text-left text-xs bg-[#242428] p-3.5 rounded-[18px] border border-white/5">
          {/* iOS Instructions */}
          <div className="space-y-1 border-b border-white/5 pb-2.5">
            <div className="flex items-center space-x-1.5 text-white font-bold">
              <Smartphone className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Instalar en iPhone / iPad (iOS):</span>
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              1. Abre esta web en <strong className="text-white">Safari</strong>.<br />
              2. Toca el botón <strong className="text-white">Compartir</strong> (cuadrado con flecha hacia arriba).<br />
              3. Selecciona <strong className="text-[#c5a059]">"Añadir a la pantalla de inicio"</strong>.<br />
              Se instalará con este icono dorado en tu pantalla como app nativa.
            </p>
          </div>

          {/* Android Instructions */}
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-white font-bold">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instalar en Android (.APK / PWA):</span>
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              En <strong className="text-white">Google Chrome</strong>, pulsa el botón de abajo o el menú (3 puntos) y elige <strong className="text-emerald-400">"Instalar aplicación"</strong>.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {isInstallable ? (
            <button
              type="button"
              onClick={handleTriggerInstall}
              className="w-full py-3 bg-gradient-to-r from-[#c5a059] to-[#dfc07f] text-black font-bold text-[14px] rounded-[14px] shadow-lg shadow-[#c5a059]/20 flex items-center justify-center space-x-2 ios-active cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Instalar {appTitle} en este Celular</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDownloadAppBundle}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-[13px] rounded-[14px] border border-white/10 flex items-center justify-center space-x-2 ios-active cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#c5a059]" />
              <span>Descargar Ficha Técnica & Enlace APK</span>
            </button>
          )}

          <a
            href="https://www.pwabuilder.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-zinc-400 hover:text-zinc-200 inline-flex items-center space-x-1"
          >
            <span>Generar .APK para Google Play Store con PWABuilder</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
