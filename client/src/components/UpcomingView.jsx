import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

function UpcomingView() {
  const [tasksByDate, setTasksByDate] = useState({});
  const [days, setDays] = useState([]);

  useEffect(() => {
    fetchUpcomingTasks();
  }, []);

  const fetchUpcomingTasks = async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .gte("due_date", today)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error al cargar tareas próximas:", error);
      return;
    }

    // Generar los próximos 7 días
    const nextDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      nextDays.push(d.toISOString().split("T")[0]);
    }
    setDays(nextDays);

    // Agrupar las tareas por su due_date
    const grouped = {};
    data.forEach((task) => {
      if (!grouped[task.due_date]) grouped[task.due_date] = [];
      grouped[task.due_date].push(task);
    });
    setTasksByDate(grouped);
  };

  const formatDay = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div>
      <h1>Próximo</h1>
      <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
        {days.map((day) => (
          <div key={day} style={{ minWidth: "220px" }}>
            <h3>{formatDay(day)}</h3>
            <ul>
              {(tasksByDate[day] || []).map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
              {(!tasksByDate[day] || tasksByDate[day].length === 0) && (
                <li style={{ color: "#999", listStyle: "none" }}>Sin tareas</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UpcomingView;
