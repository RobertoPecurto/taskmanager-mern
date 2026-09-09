import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Auth from './components/Auth';
import TaskList from './components/TaskList';
import TodayView from './components/TodayView';
import UpcomingView from './components/UpcomingView';
import CalendarView from './components/CalendarView';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('today');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <p>Cargando...</p>;

  if (!session) return <Auth />;

  return (
    <div>
      <p>Sesión iniciada como: {session.user.email}</p>
      <button onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>

      <nav>
        <button onClick={() => setView('today')}>Hoy</button>
        <button onClick={() => setView('upcoming')}>Próximo</button>
        <button onClick={() => setView('calendar')}>Calendario</button>
        <button onClick={() => setView('all')}>Todas</button>
      </nav>

      {view === 'today' && <TodayView session={session} />}
      {view === 'upcoming' && <UpcomingView session={session} />}
      {view === 'calendar' && <CalendarView session={session} />}
      {view === 'all' && <TaskList session={session} />}
    </div>
  );
}

export default App;