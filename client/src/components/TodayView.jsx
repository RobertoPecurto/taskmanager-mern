import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

function TodayView({ session }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchTodayTasks();
  }, []);

  const fetchTodayTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("due_date", today)
      .order("created_at", { ascending: true });

    if (error) console.error("Error al cargar tareas de hoy:", error);
    else setTasks(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("tasks")
      .insert({ title, due_date: today, created_by: session.user.id })
      .select()
      .single();

    if (error) {
      console.error("Error al crear tarea:", error);
    } else {
      setTasks([...tasks, data]);
      setTitle("");
    }
  };

  const toggleComplete = async (task) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id)
      .select()
      .single();

    if (error) console.error("Error al actualizar tarea:", error);
    else setTasks(tasks.map((t) => (t.id === data.id ? data : t)));
  };

  return (
    <div>
      <h1>Hoy</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea para hoy..."
        />
        <button type="submit">Añadir</button>
      </form>

      {tasks.length === 0 ? (
        <p>No tienes tareas para hoy 🎉</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <span
                onClick={() => toggleComplete(task)}
                style={{
                  textDecoration: task.completed ? "line-through" : "none",
                  cursor: "pointer",
                }}
              >
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodayView;
