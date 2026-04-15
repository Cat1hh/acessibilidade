import { useEffect, useState } from 'react';
import AuthShell from './AuthShell';

const initialTickets = [
  {
    id: 1,
    ownerEmail: 'pcd@petrobras.com',
    ownerName: 'Usuário PCD',
    category: 'Transporte',
    title: 'Solicitação de transporte adaptado para reunião externa',
    route: 'Mobilidade + Superintendência',
    priority: 'Alta',
    status: 'Enviado à superintendência',
    recommendation: 'Encaminhar transporte adaptado e registrar janela de horário.',
  },
  {
    id: 2,
    ownerEmail: 'pcd2@petrobras.com',
    ownerName: 'Usuário PCD 2',
    category: 'Acessibilidade',
    title: 'Elevador do bloco B sem funcionamento',
    route: 'Acessibilidade + Superintendência',
    priority: 'Crítica',
    status: 'Em análise',
    recommendation: 'Corrigir a barreira e registrar a causa raiz.',
  },
  {
    id: 3,
    ownerEmail: 'pcd@petrobras.com',
    ownerName: 'Usuário PCD',
    category: 'Sensório/TEA',
    title: 'Ambiente ruidoso com necessidade de abafadores',
    route: 'Ergonomia + Saúde + Superintendência',
    priority: 'Alta',
    status: 'Concluído',
    recommendation: 'Reduzir ruído, organizar um ambiente calmo e solicitar abafadores de ruído.',
  },
  {
    id: 4,
    ownerEmail: 'pcd2@petrobras.com',
    ownerName: 'Usuário PCD 2',
    category: 'Comunicação/Libras',
    title: 'Vídeo sem Libras e legenda acessível',
    route: 'Comunicação + Superintendência',
    priority: 'Alta',
    status: 'Enviado à superintendência',
    recommendation: 'Responder em texto claro, com Libras e legenda quando houver conteúdo audiovisual.',
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('admin');
  const [allTickets, setAllTickets] = useState(initialTickets);
  const [securityAlert, setSecurityAlert] = useState({
    active: false,
    message: 'Atenção: Alerta de segurança ativo. Siga as instruções da equipe.',
    activatedBy: null,
    activatedAt: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const storedUser = window.localStorage.getItem('a11y-session-user');
    const storedView = window.localStorage.getItem('a11y-session-view');
    const storedTickets = window.localStorage.getItem('a11y-tickets');
    const storedSecurityAlert = window.localStorage.getItem('a11y-security-alert');

    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        window.localStorage.removeItem('a11y-session-user');
      }
    }

    if (storedView === 'workbench' || storedView === 'admin') {
      setView(storedView);
    }

    if (storedTickets) {
      try {
        setAllTickets(JSON.parse(storedTickets));
      } catch {
        window.localStorage.removeItem('a11y-tickets');
      }
    }

    if (storedSecurityAlert) {
      try {
        setSecurityAlert(JSON.parse(storedSecurityAlert));
      } catch {
        window.localStorage.removeItem('a11y-security-alert');
      }
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (currentUser) {
      window.localStorage.setItem('a11y-session-user', JSON.stringify(currentUser));
      window.localStorage.setItem('a11y-session-view', view);
      return;
    }

    window.localStorage.removeItem('a11y-session-user');
    window.localStorage.removeItem('a11y-session-view');
  }, [currentUser, view]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('a11y-tickets', JSON.stringify(allTickets));
  }, [allTickets]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('a11y-security-alert', JSON.stringify(securityAlert));
  }, [securityAlert]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleStorage = (event) => {
      if (event.key === 'a11y-security-alert' && event.newValue) {
        try {
          setSecurityAlert(JSON.parse(event.newValue));
        } catch {
          // Ignore malformed external updates
        }
      }

      if (event.key === 'a11y-tickets' && event.newValue) {
        try {
          setAllTickets(JSON.parse(event.newValue));
        } catch {
          // Ignore malformed external updates
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleSecurityAlert = () => {
    setSecurityAlert((currentAlert) => {
      if (currentAlert.active) {
        return {
          ...currentAlert,
          active: false,
        };
      }

      return {
        ...currentAlert,
        active: true,
        activatedBy: currentUser?.email ?? 'admin@petrobras.com',
        activatedAt: new Date().toISOString(),
      };
    });
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setView(user.role === 'admin' ? 'admin' : 'workbench');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('admin');
  };

  return (
    <AuthShell
      currentUser={currentUser}
      onLogin={handleLogin}
      onLogout={handleLogout}
      view={view}
      setView={setView}
      tickets={allTickets}
      onTicketsChange={setAllTickets}
      securityAlert={securityAlert}
      onToggleSecurityAlert={toggleSecurityAlert}
    />
  );
}
