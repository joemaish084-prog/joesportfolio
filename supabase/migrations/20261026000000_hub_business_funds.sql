-- Private business savings: no client or CRM-member access.
create table public.business_funds (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 120),
  category text not null default 'Other' check (category in ('Equipment', 'Subscriptions', 'Software & tools', 'Marketing', 'Other')),
  target_amount numeric(14,2) not null check (target_amount > 0 and target_amount < 1000000000000),
  saved_amount numeric(14,2) not null default 0 check (saved_amount >= 0 and saved_amount < 1000000000000),
  frequency text not null default 'once' check (frequency in ('once', 'monthly', 'yearly')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (frequency = 'once' or due_date is not null)
);

create trigger set_updated_at before update on public.business_funds
  for each row execute function public.hub_set_updated_at();

alter table public.business_funds enable row level security;
revoke all on table public.business_funds from public, anon;
grant select, insert, update, delete on table public.business_funds to authenticated;
create policy "Admin full access" on public.business_funds for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Atomic increments avoid losing savings when two tabs save at the same time.
create function public.hub_add_fund_savings(p_id uuid, p_amount numeric)
returns public.business_funds
language plpgsql security invoker set search_path = public as $$
declare result public.business_funds;
begin
  if p_amount is null or p_amount <= 0 or p_amount >= 1000000000000 or p_amount <> round(p_amount, 2) then
    raise exception 'Enter a positive amount with at most two decimal places.';
  end if;
  update public.business_funds set saved_amount = saved_amount + p_amount
    where id = p_id and completed_at is null returning * into result;
  if not found then raise exception 'Fund unavailable.'; end if;
  return result;
end;
$$;

-- Manual bookkeeping only: this does not charge a card or move real money.
create function public.hub_pay_fund(p_id uuid)
returns public.business_funds
language plpgsql security invoker set search_path = public as $$
declare result public.business_funds;
begin
  select * into result from public.business_funds where id = p_id and completed_at is null for update;
  if not found then raise exception 'Fund unavailable.'; end if;
  if result.saved_amount < result.target_amount then raise exception 'Save the target amount before recording a payment.'; end if;
  update public.business_funds set
    saved_amount = saved_amount - target_amount,
    completed_at = case when frequency = 'once' then now() else null end,
    due_date = case frequency
      when 'monthly' then (due_date + interval '1 month')::date
      when 'yearly' then (due_date + interval '1 year')::date
      else due_date end
    where id = p_id returning * into result;
  return result;
end;
$$;

revoke all on function public.hub_add_fund_savings(uuid, numeric) from public, anon;
revoke all on function public.hub_pay_fund(uuid) from public, anon;
grant execute on function public.hub_add_fund_savings(uuid, numeric) to authenticated;
grant execute on function public.hub_pay_fund(uuid) to authenticated;
