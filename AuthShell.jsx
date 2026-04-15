import A11yCommandCenter from './A11yCommandCenter';
import AdminScreen from './AdminScreen';
import LoginScreen from './LoginScreen';

export default function AuthShell({
  currentUser,
  onLogin,
  onLogout,
  view,
  setView,
  tickets = [],
  onTicketsChange,
  securityAlert,
  onToggleSecurityAlert,
}) {
  if (!currentUser) {
    return <LoginScreen onLogin={onLogin} />;
  }

  if (currentUser.role === 'admin' && view === 'admin') {
    return (
      <AdminScreen
        user={currentUser}
        tickets={tickets}
        onTicketsChange={onTicketsChange}
        securityAlert={securityAlert}
        onToggleSecurityAlert={onToggleSecurityAlert}
        onLogout={onLogout}
        onOpenWorkbench={() => setView('workbench')}
      />
    );
  }

  return (
    <A11yCommandCenter
      user={currentUser}
      tickets={tickets}
      onTicketsChange={onTicketsChange}
      securityAlert={securityAlert}
      onLogout={onLogout}
    />
  );
}
