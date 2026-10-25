-- Removes all business fund records.
drop function if exists public.hub_pay_fund(uuid);
drop function if exists public.hub_add_fund_savings(uuid, numeric);
drop table if exists public.business_funds;
