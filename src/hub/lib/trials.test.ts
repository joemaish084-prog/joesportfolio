import { describe, expect, it } from "vitest";
import { clientPatchForLeadStage, trialLeadFor, unlinkedTrialClients } from "./trials";
import type { Client, Lead } from "./types";

const client = (id: string, over: Partial<Client> = {}) =>
  ({ id, name: id, engagement_type: "trial", status: "active", archived_at: null, ...over }) as Client;
const lead = (id: string, over: Partial<Lead> = {}) =>
  ({ id, name: id, stage: "trial", converted_client_id: null, archived_at: null, ...over }) as Lead;

describe("trial sync between pipeline and clients", () => {
  it("converts a trial client to a retainer when its lead is won", () => {
    expect(clientPatchForLeadStage(client("a"), "won")).toEqual({
      engagement_type: "retainer",
      end_date: null,
      status: "active",
    });
  });

  it("ends a trial client when its lead is lost", () => {
    expect(clientPatchForLeadStage(client("a"), "lost")).toEqual({ status: "ended" });
  });

  it("leaves clients alone when they aren't a live trial or the move isn't an outcome", () => {
    expect(clientPatchForLeadStage(client("a", { engagement_type: "retainer" }), "lost")).toBeNull();
    expect(clientPatchForLeadStage(client("a", { status: "ended" }), "won")).toBeNull();
    expect(clientPatchForLeadStage(client("a"), "proposal")).toBeNull();
    expect(clientPatchForLeadStage(undefined, "won")).toBeNull();
  });

  it("finds the trial lead for a client, ignoring other stages and archived cards", () => {
    const leads = [
      lead("old", { converted_client_id: "c1", archived_at: "2026-11-01" }),
      lead("won", { converted_client_id: "c1", stage: "won" }),
      lead("live", { converted_client_id: "c1" }),
    ];
    expect(trialLeadFor(leads, "c1")?.id).toBe("live");
    expect(trialLeadFor(leads, "c2")).toBeUndefined();
  });

  it("lists trial clients with no pipeline card so the Trial column can show them", () => {
    const clients = [
      client("linked"),
      client("solo"),
      client("ended", { status: "ended" }),
      client("retainer", { engagement_type: "retainer" }),
    ];
    const leads = [lead("l", { converted_client_id: "linked" })];
    expect(unlinkedTrialClients(clients, leads).map((c) => c.id)).toEqual(["solo"]);
  });
});
