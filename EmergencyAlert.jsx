import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function EmergencyAlert({
  message = 'Atenção: Evacuação no Bloco B',
  onSafe,
  onLocationCaptured,
  onLocationError,
}) {
  const [isConfirmingSafe, setIsConfirmingSafe] = useState(false);

  // Efeito 1: Lógica de Vibração Contínua e Intensa
  useEffect(() => {
    const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;
    let intervalId;

    if (canVibrate) {
      // Padrão de emergência intenso: Vibra 800ms, pausa 200ms
      const dangerPattern = [800, 200, 800, 200, 800];
      
      // Dispara a primeira vez assim que o alerta aparece
      navigator.vibrate(dangerPattern);
      
      // Repete o ciclo a cada 3 segundos (tempo do padrão + respiro)
      intervalId = setInterval(() => {
        navigator.vibrate(dangerPattern);
      }, 3000);
    }

    // Função de limpeza vital para desligar o motor quando fechar o alerta
    return () => {
      if (canVibrate) {
        clearInterval(intervalId);
        navigator.vibrate(0);
      }
    };
  }, []);

  // Efeito 2: Captura de Geolocalização
  useEffect(() => {
    const canUseGeolocation = typeof navigator !== 'undefined' && 'geolocation' in navigator;

    if (!canUseGeolocation) {
      onLocationError?.(new Error('Geolocalização não disponível neste dispositivo.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        console.info('Enviando localização para a equipe de resgate:', location);
        onLocationCaptured?.(location);
      },
      (error) => {
        console.warn('Não foi possível capturar a localização:', error.message);
        onLocationError?.(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [onLocationCaptured, onLocationError]);

  const handleSafeClick = () => {
    setIsConfirmingSafe(true);
  };

  const handleConfirmSafe = () => {
    setIsConfirmingSafe(false);
    onSafe?.();
  };

  const handleCancelSafe = () => {
    setIsConfirmingSafe(false);
  };

  return (
    <section
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="fixed top-0 inset-x-0 z-50 border-b-2 border-red-600 bg-red-100 text-red-900 shadow-xl animate-in slide-in-from-top duration-300"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-red-500 bg-red-200 text-red-900 animate-pulse"
          aria-hidden="true"
        >
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-800">
            Alerta de Perigo
          </p>
          <p className="mt-1 text-xl font-extrabold leading-snug text-red-900 sm:text-2xl">
            {message}
          </p>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-red-800 sm:text-base">
            Siga as rotas de saída e confirme sua segurança apenas quando estiver em local protegido.
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2">
          <button
            type="button"
            onClick={handleSafeClick}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-red-500 bg-white px-5 py-4 text-base font-bold text-red-900 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-900 focus-visible:ring-offset-2 focus-visible:ring-offset-red-100 hover:bg-red-50"
            aria-label="Estou seguro"
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Estou Seguro
          </button>

          {isConfirmingSafe ? (
            <div className="space-y-2 mt-2" role="status" aria-live="assertive">
              <p className="rounded-xl border border-red-400 bg-red-50 px-3 py-2 text-sm font-bold text-red-900">
                Confirme se você já está em local seguro.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConfirmSafe}
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-900 focus-visible:ring-offset-2 focus-visible:ring-offset-red-100 hover:bg-red-800"
                >
                  Confirmar segurança
                </button>
                <button
                  type="button"
                  onClick={handleCancelSafe}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-red-400 bg-white px-4 py-3 text-sm font-bold text-red-900 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-900 focus-visible:ring-offset-2 focus-visible:ring-offset-red-100 hover:bg-red-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}