import { useEffect, useRef, useState } from 'react';
import { Mic, Send } from 'lucide-react';

const initialMessages = [
  {
    id: 1,
    role: 'user',
    text: 'O elevador do bloco B está quebrado, impossibilitando o acesso de cadeirantes',
  },
  {
    id: 2,
    role: 'assistant',
    text: 'Chamado prioritário aberto. A equipe responsável foi acionada para verificar o elevador do bloco B imediatamente.',
  },
];

export default function A11yChatbot({
  messages = initialMessages,
  onSend,
  onVoiceRecord,
  embedded = false,
}) {
  const [draftMessage, setDraftMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError('');
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join('')
        .trim();

      setDraftMessage(transcript);
    };

    recognition.onerror = (event) => {
      setSpeechError(
        event.error === 'not-allowed'
          ? 'Permissão de microfone negada.'
          : 'Não foi possível captar o áudio.',
      );
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const handleVoiceClick = () => {
    setSpeechError('');

    const recognition = recognitionRef.current;

    if (!recognition) {
      setSpeechError('Reconhecimento de voz não suportado neste navegador.');
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    onVoiceRecord?.();

    try {
      recognition.start();
    } catch {
      setSpeechError('Não foi possível iniciar a gravação de áudio.');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    onSend?.(trimmedMessage);
    setDraftMessage('');
  };

  return (
    <section className={`${embedded ? 'flex flex-col' : 'flex min-h-screen flex-col'} bg-slate-50 text-slate-900`} aria-labelledby="chatbot-title">
      <header className="border-b border-slate-200 px-4 py-5 sm:px-6">
        <h1 id="chatbot-title" className="text-3xl font-bold leading-tight text-slate-900">
          Assistente de IA
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-700">
          Converse com o assistente para registrar incidentes, pedir orientação ou acompanhar solicitações.
        </p>
      </header>

      <main className={`flex-1 ${embedded ? 'px-0 py-4' : 'px-4 py-6 sm:px-6 lg:px-8'}`}>
        <section
          aria-label="Histórico de mensagens"
          className={`mx-auto flex w-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 ${embedded ? '' : 'max-w-4xl'}`}
        >
          <ul className="flex flex-col gap-4" role="log" aria-live="polite" aria-relevant="additions text">
            {messages.map((message) => {
              const isUser = message.role === 'user';

              return (
                <li
                  key={message.id}
                  className={`max-w-[85%] rounded-3xl border p-4 text-base leading-7 sm:p-5 ${
                    isUser
                      ? 'ml-auto border-slate-900 bg-slate-900 text-white'
                      : 'mr-auto border-slate-300 bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                    {isUser ? 'Você' : 'IA'}
                  </p>
                  <p className="text-base leading-7">{message.text}</p>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
        <form onSubmit={handleSubmit} className={`mx-auto flex w-full flex-col gap-3 sm:flex-row sm:items-end ${embedded ? '' : 'max-w-4xl'}`}>
          <label className="sr-only" htmlFor="chat-input">
            Digite sua mensagem
          </label>
          <textarea
            id="chat-input"
            name="message"
            rows={3}
            placeholder="Digite sua mensagem"
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
            className="min-h-16 flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
          />

          <button
            type="button"
            onClick={handleVoiceClick}
            className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-5 py-4 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 ${
              isListening
                ? 'border-red-700 bg-red-600 text-white hover:bg-red-700'
                : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Gravar áudio"
            aria-pressed={isListening}
          >
            <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} aria-hidden="true" />
            {isListening ? 'Ouvindo...' : 'Microfone'}
          </button>

          <button
            type="submit"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-base font-semibold text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-800"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
            Enviar
          </button>
        </form>

        {speechError ? (
          <p className={`mx-auto mt-3 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 ${embedded ? '' : 'max-w-4xl'}`} role="status" aria-live="polite">
            {speechError}
          </p>
        ) : null}
      </footer>
    </section>
  );
}
