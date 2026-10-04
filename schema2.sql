-- 1-QADAM: rollar jadvali
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','teacher')),
  teacher_name text
);
alter table public.profiles enable row level security;
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for select to authenticated using (user_id = auth.uid());

-- 2-QADAM: ozingizni admin qiling (EMAILNI ALMASHTIRING!)
insert into public.profiles (user_id, role, teacher_name)
select id, 'admin', null from auth.users
where email = 'makhmudovislombek0701@gmail.com'
on conflict (user_id) do update set role = 'admin';

-- 3-QADAM: funksiyalar
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where user_id = auth.uid() and role = 'admin');
$$;

create or replace function public.get_state()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  r text; tn text; d jsonb; st jsonb; gids text[];
begin
  select role, teacher_name into r, tn from public.profiles where user_id = auth.uid();
  if r is null then
    raise exception 'Sizga rol berilmagan. Administrator sizni profiles jadvaliga qoshishi kerak.';
  end if;
  select data into d  from public.crm_state where id = 'main';
  select data into st from public.crm_state where id = 'settings';
  if r = 'admin' then
    return jsonb_build_object('role','admin','name',coalesce(tn,''),
                              'data',d,'settings',coalesce(st,'{}'::jsonb));
  end if;
  if d is null then
    return jsonb_build_object('role',r,'name',coalesce(tn,''),'data',null,'settings','{}'::jsonb);
  end if;
  select coalesce(array_agg(g->>'id'), array[]::text[]) into gids
    from jsonb_array_elements(coalesce(d->'groups','[]'::jsonb)) g
    where g->>'teacher' = tn;
  return jsonb_build_object(
    'role', r, 'name', coalesce(tn,''),
    'settings', jsonb_build_object(
      'tgOn',      coalesce(st->'tgOn','false'::jsonb),
      'tgParents', coalesce(st->'tgParents','true'::jsonb),
      'tgStaff',   coalesce(st->'tgStaff','""'::jsonb),
      'center',    coalesce(st->'center','"Ufq"'::jsonb)),
    'data', jsonb_build_object(
      'groups', (select coalesce(jsonb_agg((g - 'price') || jsonb_build_object('price',0)),'[]'::jsonb)
                   from jsonb_array_elements(coalesce(d->'groups','[]'::jsonb)) g
                  where g->>'id' = any(gids)),
      'students', (select coalesce(jsonb_agg(s - 'phone' - 'parent' - 'discount'),'[]'::jsonb)
                     from jsonb_array_elements(coalesce(d->'students','[]'::jsonb)) s
                    where s->>'groupId' = any(gids)),
      'att', (select coalesce(jsonb_object_agg(e.key, e.value),'{}'::jsonb)
                from jsonb_each(coalesce(d->'att','{}'::jsonb)) e
               where e.key = any(gids)),
      'leads', '[]'::jsonb,
      'payments', '[]'::jsonb));
end;
$$;

create or replace function public.save_att(p_group text, p_date text, p_rec jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare r text; tn text; gt text;
begin
  select role, teacher_name into r, tn from public.profiles where user_id = auth.uid();
  if r is null then raise exception 'Ruxsat yoq'; end if;
  if p_date !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Sana notogri'; end if;
  if r <> 'admin' then
    select g->>'teacher' into gt
      from public.crm_state s, jsonb_array_elements(s.data->'groups') g
     where s.id = 'main' and g->>'id' = p_group;
    if gt is distinct from tn then raise exception 'Bu guruh sizniki emas'; end if;
  end if;
  update public.crm_state set
    data = jsonb_set(
             jsonb_set(
               jsonb_set(data, '{att}', coalesce(data->'att','{}'::jsonb)),
               array['att', p_group], coalesce(data->'att'->p_group,'{}'::jsonb)),
             array['att', p_group, p_date], coalesce(p_rec,'{}'::jsonb)),
    updated_at = now()
  where id = 'main';
end;
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.get_state() from public, anon;
revoke all on function public.save_att(text,text,jsonb) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_state() to authenticated;
grant execute on function public.save_att(text,text,jsonb) to authenticated;

-- 4-QADAM: crm_state jadvaliga endi faqat admin kira oladi
drop policy if exists "crm_select" on public.crm_state;
drop policy if exists "crm_insert" on public.crm_state;
drop policy if exists "crm_update" on public.crm_state;
drop policy if exists "crm_admin"  on public.crm_state;
create policy "crm_admin" on public.crm_state
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- USTOZ QOSHISH (har bir ustoz uchun alohida ishga tushiring):
-- 1) Authentication > Users > Add user (Auto Confirm)
-- 2) Quyidagini ishga tushiring (ism guruhdagi "Ustoz" bilan AYNAN BIR XIL):
-- insert into public.profiles (user_id, role, teacher_name)
-- select id, 'teacher', 'Dilnoza Rahimova' from auth.users
-- where email = 'ustoz@email.uz';