import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Auth from './components/Auth';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <TaskList session={session} />
    </div>
  );
}

export default App;