import { useEffect, useMemo, useState } from 'react';
import {
  BellRing,
  Bot,
  CheckCircle2,
  ClipboardPlus,
  EarOff,
  Focus,
  LogOut,
  MoonStar,
  Send,
  ShieldCheck,
  Slash,
  Ticket,
  TriangleAlert,
  Type,
  VolumeX,
  X,
} from 'lucide-react';
import A11yOnboarding from './A11yOnboarding';
import EmergencyAlert from './EmergencyAlert';

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    text: 'Digite sua solicitação. Eu vou classificar, priorizar e encaminhar.',
  },
];

const quickActions = [
  'Solicitar transporte adaptado',
  'Reportar barreira de acessibilidade',
  'Pedir abafadores de ruído',
  'Ambiente com menos estímulo',
  'Problema com Libras ou legenda',
];

const mascot = {
  name: 'Lumi',
  // Quando voce adicionar a foto, troque para algo como '/images/mascote-lumi.jpg'
  imageSrc: '',
  imageAlt: 'Mascote de apoio da plataforma',
};

const statusOptions = ['Enviado à superintendência', 'Em análise', 'Concluído'];

const defaultPreferences = {
  calmMode: true,
  reduceMotion: false,
  largeText: false,
  soundOn: false,
  voiceReadback: false,
  libras: true,
};

const baseKnowledge = {
  Transporte: {
    route: 'Mobilidade + Superintendência',
    priority: 'Alta',
    recommendation: 'Encaminhar transporte adaptado e registrar janela de horário.',
  },
  Acessibilidade: {
    route: 'Acessibilidade + Superintendência',
    priority: 'Alta',
    recommendation: 'Corrigir a barreira e registrar a causa raiz.',
  },
  'Sensorio/TEA': {
    route: 'Ergonomia + Saude + Superintendencia',
    priority: 'Alta',
    recommendation: 'Reduzir ruido, organizar um ambiente calmo e solicitar abafadores de ruido.',
  },
  'Comunicacao/Libras': {
    route: 'Comunicacao + Superintendencia',
    priority: 'Alta',
    recommendation: 'Responder em texto claro, com Libras e legenda quando houver conteudo audiovisual.',
  },
  'Demanda geral': {
    route: 'Superintendencia',
    priority: 'Media',
    recommendation: 'Classificar a solicitacao e definir responsavel unico.',
  },
};

function classifyDemand(text) {
  const normalized = text.toLowerCase();

  if (
    normalized.includes('transporte') ||
    normalized.includes('van') ||
    normalized.includes('onibus') ||
    normalized.includes('ônibus') ||
    normalized.includes('carro')
  ) {
    return {
      category: 'Transporte',
      ...baseKnowledge.Transporte,
    };
  }

  if (
    normalized.includes('barulho') ||
    normalized.includes('ruido') ||
    normalized.includes('ruído') ||
    normalized.includes('abafador') ||
    normalized.includes('estímulo') ||
    normalized.includes('estimulo') ||
    normalized.includes('autista') ||
    normalized.includes('tea') ||
    normalized.includes('calmo')
  ) {
    return {
      category: 'Sensorio/TEA',
      ...baseKnowledge['Sensorio/TEA'],
    };
  }

  if (
    normalized.includes('libras') ||
    normalized.includes('legenda') ||
    normalized.includes('audio') ||
    normalized.includes('áudio') ||
    normalized.includes('comunicacao') ||
    normalized.includes('comunicação')
  ) {
    return {
      category: 'Comunicacao/Libras',
      ...baseKnowledge['Comunicacao/Libras'],
    };
  }

  if (
    normalized.includes('elevador') ||
    normalized.includes('rampa') ||
    normalized.includes('banheiro') ||
    normalized.includes('cadeirante') ||
    normalized.includes('acessibilidade') ||
    normalized.includes('sinalizacao') ||
    normalized.includes('sinalização')
  ) {
    return {
      category: 'Acessibilidade',
      ...baseKnowledge.Acessibilidade,
    };
  }

  return {
    category: 'Demanda geral',
    ...baseKnowledge['Demanda geral'],
  };
}

export default function A11yCommandCenter({ user, tickets = [], onTicketsChange, securityAlert, onLogout }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dismissedSecurityAlert, setDismissedSecurityAlert] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutText, setLogoutText] = useState('');
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const [mascotImageFailed, setMascotImageFailed] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  useEffect(() => {
    if (securityAlert?.active) {
      setDismissedSecurityAlert(false);
    }
  }, [securityAlert?.active]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const stored = window.localStorage.getItem('a11y-access-profile');
    if (!stored) {
      return undefined;
    }

    try {
      setPreferences((current) => ({
        ...current,
        ...JSON.parse(stored),
      }));
    } catch {
      window.localStorage.removeItem('a11y-access-profile');
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('a11y-access-profile', JSON.stringify(preferences));
  }, [preferences]);

  const visibleTickets = useMemo(() => {
    if (user?.role === 'admin') {
      return tickets;
    }

    return tickets.filter((ticket) => ticket.ownerEmail === user?.email);
  }, [tickets, user]);

  useEffect(() => {
    if (!visibleTickets.length) {
      setSelectedTicketId(null);
      return;
    }

    if (!selectedTicketId || !visibleTickets.some((ticket) => ticket.id === selectedTicketId)) {
      setSelectedTicketId(visibleTickets[0].id);
    }
  }, [visibleTickets, selectedTicketId]);

  const currentTicket = useMemo(
    () => visibleTickets.find((ticket) => ticket.id === selectedTicketId) ?? null,
    [visibleTickets, selectedTicketId],
  );

  const stats = useMemo(() => {
    const routed = visibleTickets.filter((ticket) => ticket.status === 'Enviado à superintendência').length;
    const urgent = visibleTickets.filter((ticket) => ticket.priority === 'Alta' || ticket.priority === 'Crítica').length;
    const done = visibleTickets.filter((ticket) => ticket.status === 'Concluído').length;

    return { routed, urgent, done };
  }, [visibleTickets]);

  const surfaceClass = preferences.calmMode ? 'border-slate-700 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900';
  const pageClass = preferences.calmMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900';
  const textClass = preferences.calmMode ? 'text-slate-300' : 'text-slate-700';

  const updatePreference = (key) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleQuickAction = (text) => {
    setDraft(text);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const text = draft.trim();
    if (!text) {
      return;
    }

    const classification = classifyDemand(text);
    const nextId = tickets.length ? Math.max(...tickets.map((ticket) => ticket.id)) + 1 : 1;

    const newTicket = {
      id: nextId,
      ownerEmail: user?.email,
      ownerName: user?.name,
      title: text,
      status: 'Enviado à superintendência',
      ...classification,
    };

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: 'user', text },
      {
        id: Date.now() + 1,
        role: 'assistant',
        text: `${newTicket.category} registrado. Encaminhado para ${newTicket.route}. Prioridade ${newTicket.priority}.`,
      },
    ]);

    onTicketsChange?.([newTicket, ...tickets]);
    setSelectedTicketId(newTicket.id);
    setDraft('');
  };

  const updateStatus = (ticketId, status) => {
    const updated = tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket));
    onTicketsChange?.(updated);
  };

  const needsLogoutConfirmation = user?.role === 'pcd';

  const handleLogoutClick = () => {
    if (needsLogoutConfirmation) {
      setShowLogoutConfirm(true);
      setLogoutText('');
      return;
    }

    onLogout?.();
  };

  const confirmLogout = () => {
    if (logoutText.trim().toUpperCase() !== 'SAIR') {
      return;
    }

    setShowLogoutConfirm(false);
    setLogoutText('');
    onLogout?.();
  };

  return (
    <div className={`min-h-screen ${pageClass}`}>
      {securityAlert?.active && !dismissedSecurityAlert ? (
        <EmergencyAlert
          message={securityAlert.message}
          onSafe={() => setDismissedSecurityAlert(true)}
        />
      ) : null}

      {showOnboarding ? (
        <A11yOnboarding
          open={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          initialLetterSize={preferences.largeText ? 'large' : 'default'}
          initialVoiceAssistant={preferences.voiceReadback}
          initialCalmMode={preferences.calmMode}
          initialReduceMotion={preferences.reduceMotion}
          initialSignSupport={preferences.libras}
          onComplete={(profile) => {
            if (profile) {
              setPreferences((current) => ({
                ...current,
                largeText: profile.letterSize === 'large',
                calmMode: profile.calmMode,
                reduceMotion: profile.reduceMotion,
                voiceReadback: profile.voiceAssistant,
                libras: profile.signSupport,
              }));
            }
            setShowOnboarding(false);
          }}
        />
      ) : null}

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-900 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Confirmacao</p>
                <h2 id="logout-title" className="mt-2 text-2xl font-bold">Deseja realmente sair?</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                aria-label="Fechar confirmação de saída"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-900 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-100"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <p id="logout-description" className="mt-4 text-base leading-7 text-slate-700">
              Para evitar saida acidental, digite <span className="font-semibold">SAIR</span> no campo abaixo.
            </p>

            <label className="mt-4 block space-y-2">
              <span className="text-sm font-semibold">Digite SAIR</span>
              <input
                value={logoutText}
                onChange={(event) => setLogoutText(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                placeholder="SAIR"
              />
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-2xl border border-slate-300 bg-white px-6 py-4 font-semibold text-slate-900 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                disabled={logoutText.trim().toUpperCase() !== 'SAIR'}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 font-semibold text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar saida
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <section className="mx-auto w-full max-w-7xl space-y-6">
          <header className={`rounded-3xl border p-6 sm:p-8 ${surfaceClass}`}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <p className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${preferences.calmMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'}`}>
                  <Bot className="h-4 w-4" aria-hidden="true" />
                  Central unificada de solicitacoes
                </p>
                <h1 className={`text-4xl font-bold leading-tight sm:text-5xl ${preferences.largeText ? 'sm:text-6xl' : ''}`}>
                  Transporte, acessibilidade, ruido e demandas gerais em um unico chat.
                </h1>
                <p className={textClass}>
                  A IA classifica e encaminha para a superintendencia com prioridade e contexto.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowOnboarding(true)}
                  className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-5 py-4 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${preferences.calmMode ? 'border-slate-600 bg-slate-800 text-white focus-visible:ring-white focus-visible:ring-offset-slate-900 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-900 focus-visible:ring-slate-900 focus-visible:ring-offset-slate-50 hover:bg-slate-100'}`}
                >
                  <ClipboardPlus className="h-5 w-5" aria-hidden="true" />
                  Perfil de acesso
                </button>
                <button
                  type="button"
                  onClick={() => updatePreference('calmMode')}
                  className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-5 py-4 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${preferences.calmMode ? 'border-white bg-white text-slate-900 focus-visible:ring-white focus-visible:ring-offset-slate-900 hover:bg-slate-100' : 'border-slate-300 bg-white text-slate-900 focus-visible:ring-slate-900 focus-visible:ring-offset-slate-50 hover:bg-slate-100'}`}
                  aria-pressed={preferences.calmMode}
                >
                  <Focus className="h-5 w-5" aria-hidden="true" />
                  Modo calmo
                </button>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-5 py-4 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${preferences.calmMode ? 'border-slate-600 bg-slate-800 text-white focus-visible:ring-white focus-visible:ring-offset-slate-900 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-900 focus-visible:ring-slate-900 focus-visible:ring-offset-slate-50 hover:bg-slate-100'}`}
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  Sair
                </button>
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Encaminhadas', value: stats.routed, icon: Ticket },
              { label: 'Urgentes', value: stats.urgent, icon: BellRing },
              { label: 'Concluidas', value: stats.done, icon: CheckCircle2 },
            ].map(({ label, value, icon: Icon }) => (
              <article key={label} className={`rounded-3xl border p-6 ${surfaceClass}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${preferences.calmMode ? 'text-slate-400' : 'text-slate-600'}`}>{label}</p>
                    <p className="mt-3 text-4xl font-bold">{value}</p>
                  </div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${preferences.calmMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'}`} aria-hidden="true">
                    <Icon className="h-7 w-7" />
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className={`rounded-3xl border p-6 sm:p-8 ${surfaceClass}`} aria-labelledby="access-profile-title">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${preferences.calmMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'}`} aria-hidden="true">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <p id="access-profile-title" className={`text-sm font-semibold uppercase tracking-[0.18em] ${preferences.calmMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Perfil sensorial e de acesso
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Baixa estimulacao, menos ruido, mais autonomia</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                { key: 'calmMode', label: 'Modo calmo', icon: MoonStar, description: 'Reduz estimulos e deixa a tela mais limpa.' },
                { key: 'reduceMotion', label: 'Sem animacao', icon: Slash, description: 'Evita movimentos que podem incomodar.' },
                { key: 'soundOn', label: 'Sem som', icon: VolumeX, description: 'Nao depende de audio para funcionar.' },
                { key: 'largeText', label: 'Texto maior', icon: Type, description: 'Aumenta leitura para qualquer perfil visual.' },
              ].map(({ key, label, icon: Icon, description }) => {
                const enabled = preferences[key];

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updatePreference(key)}
                    className={`rounded-3xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${enabled ? 'border-slate-900 bg-slate-900 text-white focus-visible:ring-white focus-visible:ring-offset-slate-900' : 'border-slate-300 bg-white text-slate-900 focus-visible:ring-slate-900 focus-visible:ring-offset-slate-50 hover:bg-slate-100'}`}
                    aria-pressed={enabled}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                      <div>
                        <h3 className="text-base font-semibold">{label}</h3>
                        <p className={`mt-1 text-sm leading-6 ${enabled ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

              {securityAlert?.active ? (
                <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${preferences.calmMode ? 'border-amber-300 bg-amber-100 text-amber-900' : 'border-amber-300 bg-amber-100 text-amber-900'}`} role="status" aria-live="polite">
                  Alerta de seguranca ativo pela administracao.
                </p>
              ) : null}

            <div className={`mt-4 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${preferences.calmMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <EarOff className="h-4 w-4" aria-hidden="true" />
              Visualizacao de chamados isolada por usuario.
            </div>
          </section>

          <section className={`rounded-3xl border p-6 sm:p-8 ${surfaceClass}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${preferences.calmMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Chat de solicitacoes
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Um canal para todos os pedidos</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className={`rounded-3xl border p-4 sm:p-6 ${preferences.calmMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
                <div className={`mb-4 rounded-3xl border p-4 ${preferences.calmMode ? 'border-slate-600 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900'}`} role="status" aria-live="polite">
                  <div className="flex items-start gap-3">
                    {mascot.imageSrc && !mascotImageFailed ? (
                      <img
                        src={mascot.imageSrc}
                        alt={mascot.imageAlt}
                        onError={() => setMascotImageFailed(true)}
                        className="h-12 w-12 shrink-0 rounded-2xl border border-slate-300 object-cover"
                      />
                    ) : (
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${preferences.calmMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'}`} aria-hidden="true">
                        <Bot className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] opacity-80">Mascote de apoio {mascot.name}</p>
                      <p className="mt-1 text-base leading-7">Oi, eu fico aqui para ajudar voce a registrar o chamado com calma e clareza.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4" aria-live="polite" role="log" aria-relevant="additions text">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[92%] rounded-3xl border p-4 text-base leading-7 ${message.role === 'user' ? 'ml-auto border-slate-900 bg-slate-900 text-white' : 'mr-auto border-slate-300 bg-white text-slate-900'}`}
                    >
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                        {message.role === 'user' ? 'Voce' : 'IA'}
                      </p>
                      <p>{message.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold">Escreva sua solicitacao</span>
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      rows={4}
                      className={`w-full rounded-2xl border bg-white px-4 py-4 text-base text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${preferences.largeText ? 'text-lg' : ''} border-slate-300 focus-visible:ring-slate-900 focus-visible:ring-offset-slate-50`}
                      placeholder="Ex.: solicito transporte adaptado para reuniao no Bloco C"
                    />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => handleQuickAction(action)}
                        className={`inline-flex min-h-12 items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${preferences.calmMode ? 'border-slate-600 bg-slate-800 text-white focus-visible:ring-white focus-visible:ring-offset-slate-900 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-900 focus-visible:ring-slate-900 focus-visible:ring-offset-slate-50 hover:bg-slate-100'}`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-base font-semibold text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-800"
                  >
                    <Send className="h-5 w-5" aria-hidden="true" />
                    Enviar para IA
                  </button>
                </form>
              </div>

              <aside className="space-y-4">
                <article className={`rounded-3xl border p-5 ${preferences.calmMode ? 'border-slate-700 bg-slate-900' : 'border-slate-50 bg-slate-50'}`}>
                  <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${preferences.calmMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Ticket atual
                  </p>

                  {currentTicket ? (
                    <>
                      <h3 className="mt-2 text-2xl font-bold">{currentTicket.title}</h3>
                      <div className="mt-4 space-y-3 text-base leading-7">
                        <p><span className="font-semibold">Categoria:</span> {currentTicket.category}</p>
                        <p><span className="font-semibold">Area:</span> {currentTicket.route}</p>
                        <p><span className="font-semibold">Prioridade:</span> {currentTicket.priority}</p>
                        <p><span className="font-semibold">Status:</span> {currentTicket.status}</p>
                      </div>
                      <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-6 ${preferences.calmMode ? 'border-slate-700 bg-slate-950 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>
                        {currentTicket.recommendation}
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-base leading-7">Voce ainda nao possui chamados.</p>
                  )}
                </article>

                <article className={`rounded-3xl border p-5 ${preferences.calmMode ? 'border-slate-700 bg-slate-900' : 'border-slate-50 bg-slate-50'}`}>
                  <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${preferences.calmMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Seus chamados
                  </p>
                  <div className="mt-4 space-y-3">
                    {visibleTickets.map((ticket) => {
                      const active = ticket.id === selectedTicketId;

                      return (
                        <button
                          key={ticket.id}
                          type="button"
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className={`w-full rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${active ? 'border-slate-900 bg-slate-900 text-white focus-visible:ring-white focus-visible:ring-offset-slate-900' : 'border-slate-200 bg-white text-slate-900 focus-visible:ring-slate-900 focus-visible:ring-offset-slate-50 hover:bg-slate-100'}`}
                        >
                          <p className="text-sm font-semibold uppercase tracking-[0.16em]">{ticket.category}</p>
                          <p className="mt-2 text-base font-semibold leading-7">{ticket.title}</p>
                          <p className={`mt-1 text-sm ${active ? 'text-slate-300' : 'text-slate-600'}`}>
                            {ticket.route} · {ticket.priority}
                          </p>
                        </button>
                      );
                    })}
                    {!visibleTickets.length ? <p className="text-sm">Nenhum chamado encontrado.</p> : null}
                  </div>
                </article>

                {user?.role === 'admin' ? (
                  <article className={`rounded-3xl border p-5 ${preferences.calmMode ? 'border-slate-700 bg-slate-900' : 'border-slate-50 bg-slate-50'}`}>
                    <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${preferences.calmMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Atualizar status
                    </p>
                    <div className="mt-4 grid gap-3">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={!currentTicket}
                          onClick={() => currentTicket && updateStatus(currentTicket.id, status)}
                          className={`inline-flex min-h-14 items-center justify-center rounded-2xl border px-5 py-4 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${preferences.calmMode ? 'border-slate-600 bg-slate-800 text-white focus-visible:ring-white focus-visible:ring-offset-slate-900 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-900 focus-visible:ring-slate-900 focus-visible:ring-offset-slate-50 hover:bg-slate-100'} disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </article>
                ) : null}
              </aside>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
