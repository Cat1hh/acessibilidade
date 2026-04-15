import { useMemo, useState } from 'react';
import { CalendarDays, CheckSquare, Circle, Focus } from 'lucide-react';

const tasks = [
  {
    id: 1,
    title: 'Tomar água',
    icon: Circle,
  },
  {
    id: 2,
    title: 'Revisar agenda do dia',
    icon: CalendarDays,
  },
  {
    id: 3,
    title: 'Fazer uma pausa guiada',
    icon: CheckSquare,
  },
];

export default function RoutineDashboard({
  date = new Date(),
  completedTasks,
  onToggleTask,
  embedded = false,
}) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [internalCompletedTasks, setInternalCompletedTasks] = useState([]);

  const activeCompletedTasks = completedTasks ?? internalCompletedTasks;

  const dayLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  const currentTask = useMemo(
    () => tasks.find((task) => !activeCompletedTasks.includes(task.id)) ?? tasks[tasks.length - 1],
    [activeCompletedTasks],
  );

  const handleToggleTask = (taskId) => {
    if (onToggleTask) {
      onToggleTask(taskId);
      return;
    }

    setInternalCompletedTasks((currentTasks) =>
      currentTasks.includes(taskId)
        ? currentTasks.filter((currentTaskId) => currentTaskId !== taskId)
        : [...currentTasks, taskId],
    );
  };

  return (
    <section
      className={`${embedded ? '' : 'min-h-screen px-4 py-6 sm:px-6 lg:px-8'} ${
        isFocusMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <section className={`mx-auto w-full ${embedded ? '' : 'max-w-3xl'}`} aria-labelledby="today-title">
        <header className={`flex items-start justify-between gap-4 border-b pb-6 ${isFocusMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${isFocusMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Hoje
            </p>
            <h1 id="today-title" className={`mt-3 text-4xl font-bold leading-tight sm:text-5xl ${isFocusMode ? 'text-white' : 'text-slate-900'}`}>
              {dayLabel}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setIsFocusMode((current) => !current)}
            className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${
              isFocusMode
                ? 'border-slate-600 bg-slate-800 text-white focus-visible:ring-white focus-visible:ring-offset-slate-900 hover:bg-slate-700'
                : 'border-slate-300 bg-white text-slate-900 focus-visible:ring-slate-900 focus-visible:ring-offset-slate-50 hover:bg-slate-100'
            }`}
            aria-pressed={isFocusMode}
            aria-label={isFocusMode ? 'Desativar Modo Foco' : 'Ativar Modo Foco'}
          >
            <Focus className="h-5 w-5" aria-hidden="true" />
            Modo Foco
          </button>
        </header>

        {isFocusMode ? (
          <section
            className="mt-10 rounded-3xl border border-slate-700 bg-slate-950 px-6 py-10 text-white"
            aria-labelledby="focus-task-title"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Tarefa atual
            </p>
            <h2 id="focus-task-title" className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              {currentTask.title}
            </h2>

            <div className="mt-8 flex justify-start">
              <button
                type="button"
                onClick={() => handleToggleTask(currentTask.id)}
                className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-white px-6 py-4 text-base font-semibold text-slate-900 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 hover:bg-slate-100"
                aria-label={`Concluir tarefa: ${currentTask.title}`}
              >
                Concluir
              </button>
            </div>
          </section>
        ) : (
          <section aria-labelledby="tasks-title" className="pt-8">
            <h2 id="tasks-title" className="sr-only">
              Tarefas de hoje
            </h2>

            <ul className="space-y-6 sm:space-y-8">
              {tasks.map(({ id, title, icon: Icon }) => {
                const isChecked = activeCompletedTasks.includes(id);

                return (
                  <li key={id} className="rounded-3xl border border-slate-200 bg-white px-5 py-6 sm:px-6 sm:py-7">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-300 bg-slate-900 text-white"
                          aria-hidden="true"
                        >
                          <Icon className="h-7 w-7" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-2xl font-semibold leading-tight text-slate-900">
                            {title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-700">
                            Toque para marcar como concluída.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleTask(id)}
                        className={`inline-flex min-h-14 min-w-14 shrink-0 items-center justify-center rounded-2xl border px-4 py-4 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 ${
                          isChecked
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-400 bg-white text-slate-900 hover:bg-slate-100'
                        }`}
                        aria-pressed={isChecked}
                        aria-label={`${isChecked ? 'Desmarcar' : 'Marcar'} tarefa: ${title}`}
                      >
                        <span className="sr-only">{isChecked ? 'Concluída' : 'Não concluída'}</span>
                        <CheckSquare className="h-7 w-7" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </section>
    </section>
  );
}
