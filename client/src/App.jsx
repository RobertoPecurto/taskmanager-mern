import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error('Error al cargar tareas:', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
      .then((res) => res.json())
      .then((newTask) => {
        setTasks([newTask, ...tasks]);
        setTitle('');
      })
      .catch((err) => console.error('Error al crear tarea:', err));
  };

  const toggleComplete = (task) => {
    fetch(`${API_URL}/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })
      .then((res) => res.json())
      .then((updatedTask) => {
        setTasks(tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
      })
      .catch((err) => console.error('Error al actualizar tarea:', err));
  };

  const deleteTask = (id) => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(() => {
        setTasks(tasks.filter((t) => t._id !== id));
      })
      .catch((err) => console.error('Error al borrar tarea:', err));
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
          <li key={task._id}>
            <span
              onClick={() => toggleComplete(task)}
              style={{ textDecoration: task.completed ? 'line-through' : 'none', cursor: 'pointer' }}
            >
              {task.title}
            </span>
            <button onClick={() => deleteTask(task._id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;