import { describe, expect, it } from "vitest";
import { skyPhase } from "../components/art";
import { contactFor, whatsappDigits } from "./contact";
import { greetingFor, nairobiDate, nairobiHour, swahiliGreeting } from "./format";

// Kenya time is UTC+3 all year (no daylight saving), so these instants are exact.
const eat = (hhmm: string) => new Date(`2026-10-28T${hhmm}:00+03:00`);

describe("whatsappDigits", () => {
  it.each([
    ["0704 700 160", "254704700160"],
    ["+254 704 700 160", "254704700160"],
    ["254704700160", "254704700160"],
    ["704700160", "254704700160"],
    ["00254704700160", "254704700160"],
    ["+254-704-700-160", "254704700160"],
    ["0112 345 678", "254112345678"],
  ])("normalises %s", (input, expected) => {
    expect(whatsappDigits(input)).toBe(expected);
  });
});

describe("contactFor", () => {
  it("falls back to the public details when the hub has none", () => {
    const c = contactFor({});
    expect(c.name).toBe("Joseph Maina");
    expect(c.firstName).toBe("Joseph");
    expect(c.tel).toBe("tel:+254704700160");
  });

  it("prefers the hub's business settings", () => {
    const c = contactFor({ name: "Wanjiku Kamau", phone: "0711 222 333", email: "hello@example.co.ke" });
    expect(c.firstName).toBe("Wanjiku");
    expect(c.email).toBe("hello@example.co.ke");
    expect(c.tel).toBe("tel:+254711222333");
  });

  it("builds a WhatsApp link with the message encoded", () => {
    const url = contactFor({}).whatsapp("Hi Joseph, it's Amina & team. ");
    expect(url).toBe("https://wa.me/254704700160?text=Hi%20Joseph%2C%20it's%20Amina%20%26%20team.%20");
  });
});

describe("Nairobi time", () => {
  it("reads the hour in East Africa Time whatever the device zone", () => {
    expect(nairobiHour(new Date("2026-10-28T15:30:00Z"))).toBe(18);
    expect(nairobiHour(new Date("2026-10-28T21:00:00Z"))).toBe(0); // midnight in Nairobi, not 24
  });

  it("greets in English and Swahili by Kenyan time of day", () => {
    expect(greetingFor(eat("06:30"))).toBe("Good morning");
    expect(swahiliGreeting(eat("06:30"))).toBe("Habari za asubuhi");
    expect(greetingFor(eat("13:00"))).toBe("Good afternoon");
    expect(swahiliGreeting(eat("13:00"))).toBe("Habari za mchana");
    expect(greetingFor(eat("19:30"))).toBe("Good evening");
    expect(swahiliGreeting(eat("19:30"))).toBe("Habari za jioni");
  });

  it("writes the date as Nairobi sees it", () => {
    expect(nairobiDate(eat("08:00"))).toBe("Wednesday 28 October");
    // 22:30 UTC on the 27th is already the 28th in Nairobi.
    expect(nairobiDate(new Date("2026-10-27T22:30:00Z"))).toBe("Wednesday 28 October");
  });
});

describe("skyPhase", () => {
  it.each([
    ["04:59", "night"],
    ["05:00", "dawn"],
    ["07:59", "dawn"],
    ["12:00", "day"],
    ["15:59", "day"],
    ["16:00", "dusk"],
    ["18:59", "dusk"],
    ["19:00", "night"],
    ["23:30", "night"],
  ])("%s is %s", (time, phase) => {
    expect(skyPhase(eat(time))).toBe(phase);
  });
});
