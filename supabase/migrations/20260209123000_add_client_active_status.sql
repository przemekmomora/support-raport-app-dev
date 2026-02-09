alter table public.clients
add column if not exists is_active boolean not null default false;
