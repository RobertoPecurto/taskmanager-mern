-- Tabla de perfiles públicos
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null
);

alter table profiles enable row level security;

-- Cualquier usuario logueado puede ver los perfiles de los demás (para poder asignarles tareas)
create policy "Ver todos los perfiles"
on profiles for select
using (auth.role() = 'authenticated');

grant select on public.profiles to authenticated;

-- Función que copia el usuario nuevo a "profiles" automáticamente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Trigger: se ejecuta cada vez que se crea un usuario en auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();