import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function EmergencyAlert({
  message = 'Atenção: Evacuação no Bloco B',
  onSafe,
  onLocationCaptured,
  onLocationError,
}) {
  const [isConfirmingSafe, setIsConfirmingSafe] = useState(false);

  useEffect(() => {
    const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;
    const canUseGeolocation = typeof navigator !== 'undefined' && 'geolocation' in navigator;

    if (canVibrate) {
      navigator.vibrate([1000, 500, 1000, 500, 1000, 500]);
    }

    if (!canUseGeolocation) {
      onLocationError?.(new Error('Geolocalização não disponível neste dispositivo.'));
      return undefined;
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

    return () => {
      if (canVibrate) {
        navigator.vibrate(0);
      }
    };
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
      className="fixed top-0 inset-x-0 z-50 border-b border-amber-300 bg-amber-100 text-amber-900 shadow-lg"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400 bg-amber-200 text-amber-900"
          aria-hidden="true"
        >
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
            Alerta de emergência
          </p>
          <p className="mt-1 text-xl font-bold leading-snug text-amber-900 sm:text-2xl">
            {message}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-800 sm:text-base">
            Siga as rotas de saída e confirme sua segurança apenas quando estiver em local protegido.
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2">
          <button
            type="button"
            onClick={handleSafeClick}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-amber-400 bg-white px-5 py-4 text-base font-semibold text-amber-900 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-900 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-100 hover:bg-amber-50"
            aria-label="Estou seguro"
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Estou Seguro
          </button>

          {isConfirmingSafe ? (
            <div className="space-y-2" role="status" aria-live="assertive">
              <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                Confirme se voce ja esta em local seguro.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConfirmSafe}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-900 px-4 py-3 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-900 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-100 hover:bg-amber-800"
                >
                  Confirmar seguranca
                </button>
                <button
                  type="button"
                  onClick={handleCancelSafe}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-amber-400 bg-white px-4 py-3 text-sm font-semibold text-amber-900 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-900 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-100 hover:bg-amber-50"
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
