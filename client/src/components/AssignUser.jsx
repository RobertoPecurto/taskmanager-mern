import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function AssignUser({ taskId }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleAssign = async (e) => {
    e.preventDefault();
    setMessage("");

    // 1 Buscar el usuario por email en profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      setMessage("Usuario no encontrado");
      return;
    }

    // 2 Insertar la asignación
    const { error: assignError } = await supabase
      .from("task_assignees")
      .insert({ task_id: taskId, user_id: profile.id });

    if (assignError) {
      setMessage("Error al asignar: " + assignError.message);
    } else {
      setMessage("Usuario asignado correctamente");
      setEmail("");
    }
  };

  return (
    <form onSubmit={handleAssign} style={{ display: "inline" }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email del usuario"
      />
      <button type="submit">Asignar</button>
      {message && <span> {message}</span>}
    </form>
  );
}

export default AssignUser;
