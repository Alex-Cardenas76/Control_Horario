---
name: rpsoft-supabase
description: Database and security standards for RPSoft
---

# RPSoft Supabase Skill

## Convenciones
- **DB**: `snake_case` (tablas/columnas).
- **Auditoría**: `created_at` obligatorio.

## Flujo de Trabajo
- **Migraciones**: `supabase/migrations/<timestamp>_name.sql`.
- **Tipos TypeScript**: `supabase gen types typescript --local > src/types/supabase.ts`.

## Seguridad (RLS)
- **RLS**: Habilitado por defecto (`alter table ... enable row level security;`).
- **Políticas**: Denegar todo por defecto, abrir explícitamente.

## Checklist de Seguridad
- [ ] API Keys (Anon/Service) gestionadas en `.env`.
- [ ] RLS activo en todas las tablas nuevas.

## Ejemplo SQL Seguro

```sql
create table public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  user_id uuid references auth.users not null,
  created_at timestamptz default timezone('utc', now()) not null
);

alter table public.items enable row level security;

create policy "Users can view own items"
on public.items for select
using ( auth.uid() = user_id );
```
