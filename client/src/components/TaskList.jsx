import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AssignUser from './AssignUser';

function TaskList({ session }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

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

  const toggleComplete = async (task) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar tarea:', error);
    } else {
      setTasks(tasks.map((t) => (t.id === data.id ? data : t)));
    }
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) console.error('Error al borrar tarea:', error);
    else setTasks(tasks.filter((t) => t.id !== id));
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ title: editTitle, description: editDescription })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al editar tarea:', error);
    } else {
      setTasks(tasks.map((t) => (t.id === data.id ? data : t)));
      setEditingId(null);
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
          <li key={task.id}>
            {editingId === task.id ? (
              <div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Descripción..."
                />
                <button onClick={() => saveEdit(task.id)}>Guardar</button>
                <button onClick={cancelEditing}>Cancelar</button>
              </div>
            ) : (
              <>
                <span
                  onClick={() => toggleComplete(task)}
                  style={{ textDecoration: task.completed ? 'line-through' : 'none', cursor: 'pointer' }}
                >
                  {task.title}
                </span>
                {task.description && <p>{task.description}</p>}
                <button onClick={() => startEditing(task)}>✏️</button>
                {task.created_by === session.user.id && (
                  <>
                    <button onClick={() => deleteTask(task.id)}>🗑️</button>
                    <AssignUser taskId={task.id} />
                  </>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;