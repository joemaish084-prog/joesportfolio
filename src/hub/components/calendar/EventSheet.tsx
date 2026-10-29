import { useEffect, useState } from "react";
import { addDays, format, parseISO, subDays } from "date-fns";
import { ExternalLink, Loader2, MapPin, Trash2, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { browserTimeZone, useDeleteEvent, useSaveEvent, type CalendarEvent } from "../../lib/calendar";
import { Field } from "../form";
import { DatePicker } from "../pickers";

// Create or edit one Google Calendar event. Saves go straight to Google; the
// calendar refetches afterwards. All-day end dates are shown inclusive here and
// sent exclusive, the way Google stores them.

type Draft = {
  title: string;
  allDay: boolean;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
};

const ymd = (d: Date) => format(d, "yyyy-MM-dd");

function blank(day: Date): Draft {
  // Next whole hour on today, 9am on other days.
  const now = new Date();
  const isToday = ymd(day) === ymd(now);
  const hour = isToday ? Math.min(now.getHours() + 1, 23) : 9;
  const hh = String(hour).padStart(2, "0");
  return {
    title: "",
    allDay: false,
    startDate: ymd(day),
    endDate: ymd(day),
    startTime: `${hh}:00`,
    endTime: hour === 23 ? "23:59" : `${String(hour + 1).padStart(2, "0")}:00`,
    location: "",
    description: "",
  };
}

function fromEvent(e: CalendarEvent): Draft {
  if (e.allDay) {
    return {
      title: e.title,
      allDay: true,
      startDate: e.start,
      endDate: ymd(subDays(parseISO(e.end), 1)),
      startTime: "09:00",
      endTime: "10:00",
      location: e.location ?? "",
      description: e.description ?? "",
    };
  }
  const s = parseISO(e.start);
  const f = parseISO(e.end);
  return {
    title: e.title,
    allDay: false,
    startDate: ymd(s),
    endDate: ymd(f),
    startTime: format(s, "HH:mm"),
    endTime: format(f, "HH:mm"),
    location: e.location ?? "",
    description: e.description ?? "",
  };
}

export function EventSheet({
  open,
  onOpenChange,
  event,
  day,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  day: Date;
}) {
  const [draft, setDraft] = useState<Draft>(() => (event ? fromEvent(event) : blank(day)));
  const save = useSaveEvent();
  const remove = useDeleteEvent();
  const readOnly = event !== null && !event.editable;

  useEffect(() => {
    if (open) setDraft(event ? fromEvent(event) : blank(day));
    // Reset only when the sheet opens on a new event or day.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event?.id, day.getTime()]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const submit = () => {
    const title = draft.title.trim();
    if (!title) return toast.error("Give the event a title");
    const start = draft.allDay ? draft.startDate : new Date(`${draft.startDate}T${draft.startTime}`).toISOString();
    const end = draft.allDay
      ? ymd(addDays(parseISO(draft.endDate < draft.startDate ? draft.startDate : draft.endDate), 1))
      : new Date(`${draft.endDate}T${draft.endTime}`).toISOString();
    if (!draft.allDay && end <= start) return toast.error("The event must end after it starts");

    save.mutate(
      {
        id: event?.id,
        event: {
          title,
          allDay: draft.allDay,
          start,
          end,
          location: draft.location.trim() || null,
          description: draft.description.trim() || null,
          timeZone: browserTimeZone(),
        },
      },
      {
        onSuccess: () => {
          toast.success(event ? "Event updated in Google Calendar" : "Event added to Google Calendar");
          onOpenChange(false);
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const destroy = () => {
    if (!event || !window.confirm(`Delete "${event.title}" from Google Calendar?`)) return;
    remove.mutate(event.id, {
      onSuccess: () => {
        toast.success("Event deleted");
        onOpenChange(false);
      },
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="mb-5 text-left">
          <SheetTitle>{event ? (readOnly ? event.title : "Edit event") : "New event"}</SheetTitle>
          <SheetDescription>
            {readOnly
              ? "Repeating events and invitations from others can only be changed in Google Calendar."
              : "Saved straight to your Google Calendar."}
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-1 flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <fieldset disabled={readOnly || save.isPending} className="space-y-4">
            <Field label="Title" htmlFor="event-title">
              <Input
                id="event-title"
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Call with client"
                className="rounded-xl"
                autoFocus={!event}
                maxLength={300}
              />
            </Field>

            <label className="flex items-center justify-between rounded-xl bg-secondary/60 px-3.5 py-2.5 text-sm">
              All day
              <Switch
                checked={draft.allDay}
                // Timed events here start and end on one day (multi-day ones keep their end date).
                onCheckedChange={(v) => setDraft((d) => ({ ...d, allDay: v, endDate: v ? d.endDate : d.startDate }))}
                disabled={readOnly}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <Field label={draft.allDay ? "From" : "Starts"} htmlFor="event-start-date">
                <DatePicker
                  id="event-start-date"
                  value={draft.startDate}
                  clearable={false}
                  onChange={(v) =>
                    v &&
                    setDraft((d) => ({ ...d, startDate: v, endDate: d.endDate < v || !d.allDay ? v : d.endDate }))
                  }
                />
              </Field>
              {draft.allDay ? (
                <Field label="To" htmlFor="event-end-date">
                  <DatePicker
                    id="event-end-date"
                    value={draft.endDate}
                    clearable={false}
                    onChange={(v) => v && set("endDate", v)}
                  />
                </Field>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Field label="From" htmlFor="event-start-time">
                    <Input
                      id="event-start-time"
                      type="time"
                      value={draft.startTime}
                      onChange={(e) => set("startTime", e.target.value)}
                      className="rounded-xl px-2"
                    />
                  </Field>
                  <Field label="To" htmlFor="event-end-time">
                    <Input
                      id="event-end-time"
                      type="time"
                      value={draft.endTime}
                      onChange={(e) => set("endTime", e.target.value)}
                      className="rounded-xl px-2"
                    />
                  </Field>
                </div>
              )}
            </div>

            <Field label="Location" htmlFor="event-location">
              <Input
                id="event-location"
                value={draft.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Office, or a link"
                className="rounded-xl"
                maxLength={500}
              />
            </Field>

            <Field label="Notes" htmlFor="event-notes">
              <Textarea
                id="event-notes"
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                className="rounded-xl"
                maxLength={8000}
              />
            </Field>
          </fieldset>

          {event && (event.meetLink || event.htmlLink || event.location) && (
            <div className="flex flex-wrap gap-2">
              {event.meetLink && (
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <a href={event.meetLink} target="_blank" rel="noreferrer">
                    <Video className="mr-1.5 h-4 w-4" /> Join Meet
                  </a>
                </Button>
              )}
              {event.location && !/^https?:\/\//.test(event.location) && (
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MapPin className="mr-1.5 h-4 w-4" /> Map
                  </a>
                </Button>
              )}
              {event.htmlLink && (
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <a href={event.htmlLink} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1.5 h-4 w-4" /> Open in Google
                  </a>
                </Button>
              )}
            </div>
          )}

          {!readOnly && (
            <div className="mt-auto flex items-center gap-2 border-t border-border/60 pt-4">
              {event && (
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl text-destructive hover:text-destructive"
                  onClick={destroy}
                  disabled={remove.isPending}
                >
                  {remove.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4" />}
                  Delete
                </Button>
              )}
              <Button type="submit" className="ml-auto rounded-xl" disabled={save.isPending}>
                {save.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                {event ? "Save" : "Add event"}
              </Button>
            </div>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
