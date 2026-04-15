import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronRight, Ear, MoonStar, Slash, Type, Volume2, X } from 'lucide-react';

const optionRows = [
  {
    key: 'letterSize',
    title: 'Tamanho do texto',
    options: [
      { value: 'default', label: 'Padrão', icon: Type },
      { value: 'large', label: 'Grande', icon: Type },
    ],
  },
  {
    key: 'calmMode',
    title: 'Ambiente visual',
    options: [
      { value: false, label: 'Normal', icon: MoonStar },
      { value: true, label: 'Modo calmo', icon: MoonStar },
    ],
  },
  {
    key: 'reduceMotion',
    title: 'Animação',
    options: [
      { value: false, label: 'Normal', icon: Slash },
      { value: true, label: 'Reduzida', icon: Slash },
    ],
  },
  {
    key: 'voiceAssistant',
    title: 'Leitura por voz',
    options: [
      { value: false, label: 'Desativada', icon: Volume2 },
      { value: true, label: 'Ativada', icon: Ear },
    ],
  },
];

export default function A11yOnboarding({
  open = true,
  onClose,
  onComplete,
  initialLetterSize = 'default',
  initialVoiceAssistant = false,
  initialCalmMode = true,
  initialReduceMotion = false,
  initialSignSupport = true,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [letterSize, setLetterSize] = useState(initialLetterSize);
  const [voiceAssistant, setVoiceAssistant] = useState(initialVoiceAssistant);
  const [calmMode, setCalmMode] = useState(initialCalmMode);
  const [reduceMotion, setReduceMotion] = useState(initialReduceMotion);
  const [signSupport, setSignSupport] = useState(initialSignSupport);

  useEffect(() => {
    if (!open) return undefined;

    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleContinue = () => {
    onComplete?.({
      letterSize,
      voiceAssistant,
      calmMode,
      reduceMotion,
      signSupport,
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${calmMode ? 'bg-slate-900/80' : 'bg-slate-900/70'} p-4`}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-slate-50 text-slate-900 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
              Perfil de acesso
            </p>
            <h2 id={titleId} className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Como você quer usar a plataforma?
            </h2>
            <p id={descriptionId} className="mt-2 text-base leading-7 text-slate-700">
              Escolha o jeito mais confortável de navegar.
            </p>
          </div>

          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Fechar perfil de acesso"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-5 p-6">
          {optionRows.map((row) => {
            const currentValue =
              row.key === 'letterSize'
                ? letterSize
                : row.key === 'voiceAssistant'
                  ? voiceAssistant
                  : row.key === 'calmMode'
                    ? calmMode
                    : reduceMotion;

            const setValue =
              row.key === 'letterSize'
                ? setLetterSize
                : row.key === 'voiceAssistant'
                  ? setVoiceAssistant
                  : row.key === 'calmMode'
                    ? setCalmMode
                    : setReduceMotion;

            return (
              <section key={row.key} aria-labelledby={`${row.key}-title`} className="space-y-3">
                <h3 id={`${row.key}-title`} className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">
                  {row.title}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {row.options.map((option) => {
                    const isActive = currentValue === option.value;
                    const Icon = option.icon;

                    return (
                      <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => setValue(option.value)}
                        className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${isActive ? 'border-slate-900 bg-slate-900 text-white focus-visible:ring-white focus-visible:ring-offset-slate-900' : 'border-slate-300 bg-white text-slate-900 focus-visible:ring-slate-900 focus-visible:ring-offset-slate-50 hover:bg-slate-100'}`}
                        aria-pressed={isActive}
                      >
                        <span className="flex items-center gap-4">
                          <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${isActive ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`} aria-hidden="true">
                            <Icon className="h-6 w-6" />
                          </span>
                          <span>
                            <span className="block text-base font-semibold">{option.label}</span>
                          </span>
                        </span>
                        {isActive ? <Check className="h-5 w-5" aria-hidden="true" /> : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <section aria-labelledby="libras-title" className="space-y-3">
            <h3 id="libras-title" className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">
              Libras
            </h3>
            <button
              type="button"
              onClick={() => setSignSupport((current) => !current)}
              className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${signSupport ? 'border-slate-900 bg-slate-900 text-white focus-visible:ring-white focus-visible:ring-offset-slate-900' : 'border-slate-300 bg-white text-slate-900 focus-visible:ring-slate-900 focus-visible:ring-offset-slate-50 hover:bg-slate-100'}`}
              aria-pressed={signSupport}
            >
              <span className="flex items-center gap-4">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${signSupport ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`} aria-hidden="true">
                  <Ear className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-base font-semibold">Libras ativa</span>
                  <span className={`block text-sm ${signSupport ? 'text-slate-300' : 'text-slate-700'}`}>
                    Recurso visual para comunicação acessível.
                  </span>
                </span>
              </span>
              {signSupport ? <Check className="h-5 w-5" aria-hidden="true" /> : null}
            </button>
          </section>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-300 bg-white px-6 py-4 font-semibold text-slate-900 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-100"
          >
            Agora não
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 font-semibold text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-800"
          >
            Salvar perfil
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </footer>
      </div>
    </div>
  );
}
