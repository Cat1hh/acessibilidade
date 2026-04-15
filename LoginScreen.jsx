import { useState } from 'react';
import { LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (normalizedEmail === 'admin@petrobras.com' && normalizedPassword === 'A11y@2026') {
      setError('');
      onLogin?.({
        name: 'Admin Acessibilidade',
        email: normalizedEmail,
        role: 'admin',
      });
      return;
    }

    if (normalizedEmail === 'pcd@petrobras.com' && normalizedPassword === 'A11yPCD@2026') {
      setError('');
      onLogin?.({
        name: 'Usuário PCD',
        email: normalizedEmail,
        role: 'pcd',
      });
      return;
    }

    if (normalizedEmail === 'pcd2@petrobras.com' && normalizedPassword === 'A11yPCD2@2026') {
      setError('');
      onLogin?.({
        name: 'Usuário PCD 2',
        email: normalizedEmail,
        role: 'pcd',
      });
      return;
    }

    setError('Credenciais inválidas. Use admin@petrobras.com / A11y@2026, pcd@petrobras.com / A11yPCD@2026 ou pcd2@petrobras.com / A11yPCD2@2026.');
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-md flex-col justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white" aria-hidden="true">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Acesso seguro</p>
              <h1 className="mt-1 text-3xl font-bold">Entrar na plataforma</h1>
            </div>
          </div>

          <p className="mt-4 text-base leading-7 text-slate-700">
            A plataforma unifica solicitações, prioridades e encaminhamentos. Selecione seu perfil pelo e-mail.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold">E-mail</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 focus-within:ring-4 focus-within:ring-slate-900 focus-within:ring-offset-2 focus-within:ring-offset-slate-50">
                <UserRound className="h-5 w-5 text-slate-500" aria-hidden="true" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500"
                  placeholder="admin@petrobras.com ou pcd@petrobras.com"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold">Senha</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 focus-within:ring-4 focus-within:ring-slate-900 focus-within:ring-offset-2 focus-within:ring-offset-slate-50">
                <LockKeyhole className="h-5 w-5 text-slate-500" aria-hidden="true" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500"
                  placeholder="A11y@2026 ou A11yPCD@2026"
                  autoComplete="current-password"
                />
              </div>
            </label>

            <button
              type="submit"
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-base font-semibold text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-800"
            >
              Entrar
            </button>
          </form>

          {error ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
            Admin: <span className="font-semibold">admin@petrobras.com</span> / <span className="font-semibold">A11y@2026</span><br />
            PCD 1: <span className="font-semibold">pcd@petrobras.com</span> / <span className="font-semibold">A11yPCD@2026</span><br />
            PCD 2: <span className="font-semibold">pcd2@petrobras.com</span> / <span className="font-semibold">A11yPCD2@2026</span>
          </div>
        </div>
      </section>
    </main>
  );
}
