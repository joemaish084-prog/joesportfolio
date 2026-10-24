-- Undoes 20261024000000_crm_core.sql. Deletes every CRM lead, draft, message,
-- deal, suppression entry and audit record. Export anything you need first.
-- The rest of the Client Hub (clients, finance, tasks, the old pipeline) is untouched.

drop table if exists
  public.crm_rate_limits,
  public.crm_import_rows,
  public.crm_import_jobs,
  public.crm_suppression_list,
  public.crm_deals,
  public.crm_follow_up_tasks,
  public.crm_stage_changes,
  public.crm_activities,
  public.crm_outreach_events,
  public.crm_outreach_messages,
  public.crm_outreach_drafts,
  public.crm_lead_campaigns,
  public.crm_lead_contacts,
  public.crm_lead_shares,
  public.crm_leads,
  public.crm_campaigns,
  public.crm_lead_sources,
  public.crm_industries,
  public.crm_audit_logs,
  public.crm_memberships,
  public.crm_organisations
cascade;

drop function if exists public.crm_clear_import_raw(uuid);
drop function if exists public.crm_purge_stale_leads(uuid);
drop function if exists public.crm_dashboard_metrics(uuid, timestamptz, timestamptz, uuid, uuid, uuid);
drop function if exists public.crm_commit_import(uuid, jsonb);
drop function if exists public.crm_record_provider_event(text, text, text, text, jsonb, timestamptz);
drop function if exists public.crm_take_rate_token(text, integer, integer);
drop function if exists public.crm_log_export(uuid, integer, jsonb);
drop function if exists public.crm_add_member(uuid, text, text);
drop function if exists public.crm_members(uuid);
drop function if exists public.crm_my_access();
drop function if exists public.crm_share_after_write();
drop function if exists public.crm_org_after_update();
drop function if exists public.crm_membership_guard();
drop function if exists public.crm_deal_after_write();
drop function if exists public.crm_deal_before_write();
drop function if exists public.crm_campaign_before_update();
drop function if exists public.crm_campaign_after_update();
drop function if exists public.crm_follow_up_after_write();
drop function if exists public.crm_follow_up_before_write();
drop function if exists public.crm_suppression_after_delete();
drop function if exists public.crm_suppression_after_insert();
drop function if exists public.crm_suppression_before_insert();
drop function if exists public.crm_message_after_insert();
drop function if exists public.crm_schedule_follow_ups(uuid, uuid, text, date);
drop function if exists public.crm_message_guard();
drop function if exists public.crm_is_suppressed(uuid, text, text);
drop function if exists public.crm_draft_guard();
drop function if exists public.crm_lead_after_delete();
drop function if exists public.crm_lead_after_write();
drop function if exists public.crm_lead_before_write();
drop function if exists public.crm_check_campaign_org();
drop function if exists public.crm_inherit_org();
drop function if exists public.crm_can_write_lead(uuid);
drop function if exists public.crm_can_read_lead(uuid);
drop function if exists public.crm_lead_access(uuid);
drop function if exists public.crm_lead_row_access(uuid, uuid, uuid);
drop function if exists public.crm_add_business_days(date, integer);
drop function if exists public.crm_phone_key(text);
drop function if exists public.crm_email_key(text);
drop function if exists public.crm_domain_key(text);
drop function if exists public.crm_name_key(text);
drop function if exists public.crm_audit(uuid, text, text, uuid, jsonb);
drop function if exists public.crm_set_updated_at();
drop function if exists public.crm_is_owner(uuid);
drop function if exists public.crm_is_editor(uuid);
drop function if exists public.crm_is_member(uuid);
drop function if exists public.crm_role(uuid);
