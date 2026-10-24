import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useCampaigns, useCrm, useIndustries, useMembers, type MetricFilters } from "../lib/queries";
import { RANGE_LABEL, RANGE_PRESETS, presetDays, rangeBounds, type RangePreset } from "../lib/ranges";
import { SelectField } from "./bits";

// Date range, industry, campaign and lead-owner filters for the dashboard and analytics.

export function useMetricFilters() {
  const [preset, setPreset] = useState<RangePreset>("this_month");
  const [custom, setCustom] = useState(() => presetDays("this_month"));
  const [industry, setIndustry] = useState("");
  const [campaign, setCampaign] = useState("");
  const [owner, setOwner] = useState("");

  const days = preset === "custom" ? custom : presetDays(preset);
  const filters: MetricFilters = useMemo(() => {
    const b = rangeBounds(days.from, days.to);
    return { from: b.from, to: b.to, industry: industry || null, campaign: campaign || null, owner: owner || null };
  }, [days.from, days.to, industry, campaign, owner]);

  return {
    filters,
    days,
    state: { preset, setPreset, custom, setCustom, industry, setIndustry, campaign, setCampaign, owner, setOwner },
  };
}

export function FilterBar({ state }: { state: ReturnType<typeof useMetricFilters>["state"] }) {
  const industries = useIndustries();
  const campaigns = useCampaigns();
  const members = useMembers();
  const { isOwner } = useCrm();

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <SelectField
        label="Date range"
        className="w-40"
        value={state.preset}
        onChange={(v) => state.setPreset(v as RangePreset)}
        options={[...RANGE_PRESETS, "custom" as const].map((p) => ({ value: p, label: RANGE_LABEL[p] }))}
      />
      {state.preset === "custom" && (
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            aria-label="From"
            value={state.custom.from}
            max={state.custom.to}
            onChange={(e) => e.target.value && state.setCustom({ ...state.custom, from: e.target.value })}
            className="h-10 w-40 rounded-xl"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            aria-label="To"
            value={state.custom.to}
            min={state.custom.from}
            onChange={(e) => e.target.value && state.setCustom({ ...state.custom, to: e.target.value })}
            className="h-10 w-40 rounded-xl"
          />
        </div>
      )}
      <SelectField
        label="Industry"
        className="w-44"
        value={state.industry}
        onChange={state.setIndustry}
        options={[{ value: "", label: "All industries" }, ...(industries.data ?? []).map((i) => ({ value: i.id, label: i.name }))]}
      />
      <SelectField
        label="Campaign"
        className="w-52"
        value={state.campaign}
        onChange={state.setCampaign}
        options={[{ value: "", label: "All campaigns" }, ...(campaigns.data ?? []).map((c) => ({ value: c.id, label: c.name }))]}
      />
      {isOwner && (members.data?.length ?? 0) > 1 && (
        <SelectField
          label="Lead owner"
          className="w-48"
          value={state.owner}
          onChange={state.setOwner}
          options={[{ value: "", label: "Everyone" }, ...(members.data ?? []).map((m) => ({ value: m.user_id, label: m.email }))]}
        />
      )}
    </div>
  );
}
