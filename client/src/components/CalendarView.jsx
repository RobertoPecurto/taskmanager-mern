import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasksByDate, setTasksByDate] = useState({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 = enero, 11 = diciembre

  useEffect(() => {
    fetchMonthTasks();
  }, [year, month]);

  const fetchMonthTasks = async () => {
    const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
    const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .gte("due_date", firstDay)
      .lte("due_date", lastDay);

    if (error) {
      console.error("Error al cargar tareas del mes:", error);
      return;
    }

    const grouped = {};
    data.forEach((task) => {
      if (!grouped[task.due_date]) grouped[task.due_date] = [];
      grouped[task.due_date].push(task);
    });
    setTasksByDate(grouped);
  };

  const buildCalendarGrid = () => {
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // getDay() da 0=domingo..6=sábado; convertimos para que la semana empiece en lunes
    let startWeekday = firstDayOfMonth.getDay();
    startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;

    const cells = [];

    // Huecos vacíos antes del día 1
    for (let i = 0; i < startWeekday; i++) {
      cells.push(null);
    }

    // Los días reales del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toISOString().split("T")[0];
      cells.push(dateStr);
    }

    return cells;
  };

  const changeMonth = (delta) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const monthName = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  const cells = buildCalendarGrid();
  const weekdayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button onClick={() => changeMonth(-1)}>◀</button>
        <h2 style={{ textTransform: "capitalize" }}>{monthName}</h2>
        <button onClick={() => changeMonth(1)}>▶</button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
        }}
      >
        {weekdayLabels.map((label) => (
          <div key={label} style={{ fontWeight: "bold", textAlign: "center" }}>
            {label}
          </div>
        ))}

        {cells.map((dateStr, index) => (
          <div
            key={index}
            style={{
              minHeight: "80px",
              border: dateStr ? "1px solid #ddd" : "none",
              padding: "4px",
              fontSize: "0.8rem",
            }}
          >
            {dateStr && (
              <>
                <strong>{dateStr.split("-")[2]}</strong>
                {(tasksByDate[dateStr] || []).map((task) => (
                  <div
                    key={task.id}
                    style={{
                      background: "#e0e7ff",
                      borderRadius: "4px",
                      padding: "2px 4px",
                      marginTop: "2px",
                    }}
                  >
                    {task.title}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarView;
