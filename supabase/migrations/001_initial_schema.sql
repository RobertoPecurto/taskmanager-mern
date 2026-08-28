-- ============================================
-- TABLAS
-- ============================================

create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  completed boolean default false,
  created_by uuid references auth.users(id) not null default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table task_assignees (
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  primary key (task_id, user_id)
);

alter table tasks enable row level security;
alter table task_assignees enable row level security;

-- ============================================
-- FUNCIONES AUXILIARES (evitan recursión infinita en RLS)
-- ============================================

create or replace function public.is_task_assignee(_task_id uuid, _user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from task_assignees
    where task_id = _task_id and user_id = _user_id
  );
$$;

create or replace function public.can_access_task(_task_id uuid, _user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from tasks
    where id = _task_id
      and (created_by = _user_id or public.is_task_assignee(_task_id, _user_id))
  );
$$;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- tasks
create policy "Crear tareas"
on tasks for insert
with check (created_by = auth.uid());

create policy "Ver tareas propias o asignadas"
on tasks for select
using (
  created_by = auth.uid()
  or public.is_task_assignee(id, auth.uid())
);

create policy "Editar tareas propias o asignadas"
on tasks for update
using (
  created_by = auth.uid()
  or public.is_task_assignee(id, auth.uid())
);

create policy "Borrar solo el creador"
on tasks for delete
using (created_by = auth.uid());

-- task_assignees
create policy "Ver asignaciones de tareas visibles"
on task_assignees for select
using (
  public.can_access_task(task_id, auth.uid())
);

create policy "Asignar usuarios solo el creador"
on task_assignees for insert
with check (
  task_id in (select id from tasks where created_by = auth.uid())
);

create policy "Quitar asignaciones solo el creador"
on task_assignees for delete
using (
  task_id in (select id from tasks where created_by = auth.uid())
);

-- ============================================
-- PERMISOS
-- ============================================

grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, delete on public.task_assignees to authenticated;