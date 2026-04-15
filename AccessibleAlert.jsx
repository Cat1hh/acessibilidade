import React, { useEffect } from 'react';
import { Clock, AlertTriangle, OctagonAlert } from 'lucide-react';

export default function AccessibleAlert({ type, message, onClose }) {
  // Configurações de cada tipo de alerta
  const alertConfig = {
    green: {
      color: 'bg-green-50 border-green-500 text-green-900',
      icon: <Clock className="h-6 w-6 text-green-600" aria-hidden="true" />,
      title: 'Horário Marcado',
      role: 'status', // 'status' para informações que não exigem interrupção imediata
      ariaLive: 'polite',
      vibrationPattern: [200], // Vibração curta (200ms)
      soundFile: '/sounds/success.mp3' // Substitua pelo caminho do seu arquivo de áudio
    },
    orange: {
      color: 'bg-orange-50 border-orange-500 text-orange-900',
      icon: <AlertTriangle className="h-6 w-6 text-orange-600" aria-hidden="true" />,
      title: 'Risco Moderado',
      role: 'alert',
      ariaLive: 'polite',
      vibrationPattern: [200, 100, 200], // Dupla vibração (vibra, pausa, vibra)
      soundFile: '/sounds/warning.mp3'
    },
    red: {
      color: 'bg-red-50 border-red-500 text-red-900',
      icon: <OctagonAlert className="h-8 w-8 text-red-600 animate-pulse" aria-hidden="true" />,
      title: 'PERIGO',
      role: 'alert', // 'alert' interrompe o leitor de tela imediatamente
      ariaLive: 'assertive',
      vibrationPattern: [500, 200, 500, 200, 500], // Vibração de emergência (padrão SOS longo)
      soundFile: '/sounds/danger.mp3'
    }
  };

  const config = alertConfig[type];

  useEffect(() => {
    if (!config) return;

    // 1. Aciona a vibração tátil (funciona em celulares/tablets Android)
    if ('vibrate' in navigator) {
      navigator.vibrate(config.vibrationPattern);
    }

    // 2. Aciona o som (Descomente quando tiver os arquivos de áudio na pasta public)
    /*
    try {
      const audio = new Audio(config.soundFile);
      audio.play().catch((err) => console.log('Autoplay de áudio bloqueado pelo navegador', err));
    } catch (error) {
      console.error('Erro ao tocar áudio', error);
    }
    */

  }, [type, config]);

  if (!config) return null;

  return (
    <div
      role={config.role}
      aria-live={config.ariaLive}
      className={`relative flex items-start gap-4 rounded-2xl border-2 p-5 shadow-lg transition-all ${config.color}`}
    >
      <div className="flex-shrink-0 pt-1">{config.icon}</div>
      <div className="flex-1">
        <h3 className="text-xl font-extrabold uppercase tracking-wide">{config.title}</h3>
        <p className="mt-1 text-base font-medium">{message}</p>
      </div>
      
      {/* Botão opcional para fechar o alerta */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Fechar alerta"
          className="absolute right-4 top-4 rounded-lg p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2"
        >
          <span aria-hidden="true" className="text-xl font-bold">&times;</span>
        </button>
      )}
    </div>
  );
}