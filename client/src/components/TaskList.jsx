import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

function TaskList({ session }) {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error al cargar tareas:', error);
        else setTasks(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { data, error } = await supabase
            .from('tasks')
            .insert({ title, created_by: session.user.id })
            .select()
            .single();

        if (error) {
            console.error('Error al crear tarea:', error);
        } else {
            setTasks([data, ...tasks]);
            setTitle('');
        }
    };

    return (
        <div>
            <h1>Mis tareas</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nueva tarea..."
                />
                <button type="submit">Añadir</button>
            </form>

            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>{task.title}</li>
                ))}
            </ul>
        </div>
    );
}

export default TaskList;