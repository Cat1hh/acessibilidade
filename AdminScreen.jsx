import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BellRing,
  Bot,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  Download,
  Filter,
  LogOut,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react';

const statusOptions = ['Todos', 'Enviado à superintendência', 'Em análise', 'Concluído'];
const categoryOptions = ['Todas', 'Transporte', 'Acessibilidade', 'Sensório/TEA', 'Comunicação/Libras', 'Demanda geral'];

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminScreen({
  user,
  tickets = [],
  onTicketsChange,
  securityAlert,
  onToggleSecurityAlert,
  onLogout,
  onOpenWorkbench,
}) {
  const [localTickets, setLocalTickets] = useState(tickets);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id ?? null);

  useEffect(() => {
    setLocalTickets(tickets);
    if (!selectedTicketId && tickets[0]?.id) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  const stats = useMemo(() => {
    const total = localTickets.length;
    const critical = localTickets.filter((ticket) => ticket.priority === 'Crítica').length;
    const routed = localTickets.filter((ticket) => ticket.status === 'Enviado à superintendência').length;
    const done = localTickets.filter((ticket) => ticket.status === 'Concluído').length;
    const tea = localTickets.filter((ticket) => ticket.category === 'Sensório/TEA').length;

    return { total, critical, routed, done, tea };
  }, [localTickets]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return localTickets.filter((ticket) => {
      const matchesSearch =
        !normalizedSearch ||
        ticket.title.toLowerCase().includes(normalizedSearch) ||
        ticket.route.toLowerCase().includes(normalizedSearch) ||
        ticket.category.toLowerCase().includes(normalizedSearch) ||
        ticket.priority.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'Todos' || ticket.status === statusFilter;
      const matchesCategory = categoryFilter === 'Todas' || ticket.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [localTickets, search, statusFilter, categoryFilter]);

  const selectedTicket = useMemo(
    () => filteredTickets.find((ticket) => ticket.id === selectedTicketId) ?? filteredTickets[0] ?? null,
    [filteredTickets, selectedTicketId],
  );

  const updateTicket = (ticketId, patch) => {
    setLocalTickets((currentTickets) => {
      const updatedTickets = currentTickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...patch } : ticket));
      onTicketsChange?.(updatedTickets);
      return updatedTickets;
    });
  };

  const exportTickets = () => {
    downloadJson('tickets-a11y.json', localTickets);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                Área Administrativa
              </p>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Painel do Admin</h1>
              <p className="max-w-3xl text-base leading-7 text-slate-700">
                {user?.name ? `${user.name} está gerenciando a operação.` : 'Gerencie solicitações, prioridades e encaminhamentos.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onToggleSecurityAlert}
                className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${securityAlert?.active ? 'border-red-300 bg-red-100 text-red-900 focus-visible:ring-red-900 focus-visible:ring-offset-slate-50 hover:bg-red-200' : 'border-amber-300 bg-amber-100 text-amber-900 focus-visible:ring-amber-900 focus-visible:ring-offset-slate-50 hover:bg-amber-200'}`}
              >
                <BellRing className="h-5 w-5" aria-hidden="true" />
                {securityAlert?.active ? 'Desativar alerta de segurança' : 'Ativar alerta de segurança'}
              </button>
              <button
                type="button"
                onClick={onOpenWorkbench}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-base font-semibold text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-800"
              >
                <Bot className="h-5 w-5" aria-hidden="true" />
                Abrir central
              </button>
              <button
                type="button"
                onClick={exportTickets}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-900 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-100"
              >
                <Download className="h-5 w-5" aria-hidden="true" />
                Exportar JSON
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-900 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-100"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                Sair
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-5">
          {[
            { label: 'Total', value: stats.total, icon: ClipboardList },
            { label: 'Críticas', value: stats.critical, icon: BellRing },
            { label: 'Encaminhadas', value: stats.routed, icon: CalendarCheck2 },
            { label: 'Concluídas', value: stats.done, icon: CheckCircle2 },
            { label: 'TEA / sensório', value: stats.tea, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <article key={label} className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">{label}</p>
                  <p className="mt-3 text-4xl font-bold">{value}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white" aria-hidden="true">
                  <Icon className="h-7 w-7" />
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white" aria-hidden="true">
                <BarChart3 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Fila operacional</p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Demandas em tempo real</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              <label className="block space-y-2">
                <span className="text-sm font-semibold">Buscar</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 focus-within:ring-4 focus-within:ring-slate-900 focus-within:ring-offset-2 focus-within:ring-offset-slate-50">
                  <Search className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por texto, área ou prioridade"
                    className="w-full bg-transparent text-base text-slate-900 outline-none"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold">Status</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4">
                  <Filter className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full bg-transparent text-base text-slate-900 outline-none"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold">Categoria</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4">
                  <Filter className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="w-full bg-transparent text-base text-slate-900 outline-none"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>

            <div className="mt-6 space-y-4">
              {filteredTickets.map((ticket) => {
                const active = ticket.id === selectedTicket?.id;

                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full rounded-2xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${active ? 'border-slate-900 bg-slate-900 text-white focus-visible:ring-white focus-visible:ring-offset-slate-900' : 'border-slate-200 bg-slate-50 text-slate-900 focus-visible:ring-slate-900 focus-visible:ring-offset-slate-50 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] opacity-80">{ticket.category}</p>
                        <h3 className="mt-2 text-lg font-semibold leading-7">{ticket.title}</h3>
                        <p className={`mt-1 text-sm ${active ? 'text-slate-300' : 'text-slate-700'}`}>{ticket.route}</p>
                      </div>
                      <span className={`rounded-full px-3 py-2 text-xs font-semibold ${active ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-2 text-xs font-semibold ${active ? 'bg-slate-800 text-white' : 'bg-white text-slate-700'}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </article>

          <aside className="space-y-4">
            <article className="rounded-3xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Detalhes do ticket</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Visão operacional</h2>

              {selectedTicket ? (
                <div className="mt-5 space-y-4 text-base leading-7 text-slate-900">
                  <p><span className="font-semibold">Título:</span> {selectedTicket.title}</p>
                  <p><span className="font-semibold">Categoria:</span> {selectedTicket.category}</p>
                  <p><span className="font-semibold">Área:</span> {selectedTicket.route}</p>
                  <p><span className="font-semibold">Prioridade:</span> {selectedTicket.priority}</p>
                  <p><span className="font-semibold">Status:</span> {selectedTicket.status}</p>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Ação sugerida</p>
                    <p className="mt-2 text-base leading-7 text-slate-900">
                      {selectedTicket.recommendation ?? 'Sem recomendação disponível.'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-base leading-7 text-slate-700">Nenhum ticket encontrado com os filtros atuais.</p>
              )}
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Ações rápidas</p>
              <div className="mt-4 grid gap-3">
                {['Enviado à superintendência', 'Em análise', 'Concluído'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={!selectedTicket}
                    onClick={() => selectedTicket && updateTicket(selectedTicket.id, { status })}
                    className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {status}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={!selectedTicket}
                  onClick={() => selectedTicket && updateTicket(selectedTicket.id, { status: 'Concluído' })}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-base font-semibold text-slate-900 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  Marcar como resolvido
                </button>
              </div>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}
