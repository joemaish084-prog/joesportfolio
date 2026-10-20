import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Archive, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  STATUS_HINT,
  positionBetween,
  sortByPosition,
  useArchiveTasks,
  useCreateTask,
  useRestoreTasks,
  useUpdateTask,
} from "../../lib/tasks";
import { TASK_STATUSES, TASK_STATUS_LABEL, type Task, type TaskStatus } from "../../lib/types";
import { STATUS_COLOR, TaskCard } from "./TaskCard";

type Columns = Record<TaskStatus, string[]>;

function toColumns(tasks: Task[]): Columns {
  const cols: Columns = { todo: [], in_progress: [], review: [], done: [] };
  sortByPosition(tasks).forEach((t) => cols[t.status].push(t.id));
  return cols;
}

const isStatus = (id: unknown): id is TaskStatus => (TASK_STATUSES as readonly unknown[]).includes(id);

const dropAnimation: DropAnimation = {
  duration: 220,
  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
};

// ---------------------------------------------------------------- sortable card

function SortableCard({
  task,
  clientName,
  onOpen,
}: {
  task: Task;
  clientName?: string;
  onOpen: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  });
  return (
    <TaskCard
      ref={setNodeRef}
      task={task}
      clientName={clientName}
      ghost={isDragging}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      onClick={() => onOpen(task)}
      {...attributes}
      {...listeners}
      onKeyDown={(e) => {
        // Enter opens; Space is dnd-kit's pick-up key.
        if (e.key === "Enter") onOpen(task);
        else listeners?.onKeyDown?.(e);
      }}
      aria-label={`${task.title}. ${TASK_STATUS_LABEL[task.status]}. Press space to move, enter to open.`}
    />
  );
}

// ---------------------------------------------------------------- column

function Column({
  status,
  tasks,
  clientName,
  onOpen,
  onQuickAdd,
  onClearDone,
  highlight,
}: {
  status: TaskStatus;
  tasks: Task[];
  clientName: (id: string | null) => string | undefined;
  onOpen: (task: Task) => void;
  onQuickAdd: (status: TaskStatus, title: string) => void;
  onClearDone: () => void;
  highlight: boolean;
}) {
  // The whole column (header and "Add task" included) accepts drops.
  const { setNodeRef } = useDroppable({ id: status });
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const color = STATUS_COLOR[status];

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const submit = () => {
    const title = draft.trim();
    if (title) onQuickAdd(status, title);
    setDraft("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      setDraft("");
      setAdding(false);
    }
  };

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-[84vw] max-w-[22rem] shrink-0 snap-start flex-col rounded-[22px] bg-secondary/55 p-2 transition-[background-color,box-shadow] duration-200 sm:w-80 lg:w-auto lg:max-w-none",
        highlight && "bg-tint/50 ring-2 ring-inset ring-primary/25",
      )}
      aria-label={TASK_STATUS_LABEL[status]}
    >
      <header className="flex items-center gap-2 px-2 pb-2.5 pt-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 0 4px color-mix(in srgb, ${color} 18%, transparent)` }}
        />
        <h2 className="text-sm font-semibold">{TASK_STATUS_LABEL[status]}</h2>
        <span className="hub-tabular rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground shadow-hub">
          {tasks.length}
        </span>
        <span className="sr-only">{STATUS_HINT[status]}</span>
        <div className="ml-auto flex items-center">
          {status === "done" && tasks.length > 0 && (
            <button
              type="button"
              onClick={onClearDone}
              className="flex h-7 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              title="Hide finished tasks from the board"
            >
              <Archive className="h-3.5 w-3.5" /> Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setAdding(true)}
            aria-label={`Add a task to ${TASK_STATUS_LABEL[status]}`}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </header>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-24 flex-1 flex-col gap-2 rounded-2xl p-0.5">
          {tasks.map((t) => (
            <SortableCard key={t.id} task={t} clientName={clientName(t.client_id)} onOpen={onOpen} />
          ))}
          {tasks.length === 0 && !adding && (
            <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-border/80 px-4 py-8 text-center text-xs text-muted-foreground">
              {status === "done" ? "Drag finished work here" : "Nothing here. Drop a task or press +"}
            </div>
          )}
        </div>
      </SortableContext>

      {adding ? (
        <div className="mt-2 rounded-2xl border border-primary/30 bg-card p-2 shadow-hub">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            onBlur={() => {
              submit();
              setAdding(false);
            }}
            placeholder="What needs doing?"
            className="w-full bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground"
            aria-label="New task title"
          />
          <p className="px-1.5 pt-1 text-[0.6875rem] text-muted-foreground">Enter to add · Esc to close</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        >
          <Plus className="h-4 w-4" /> Add task
        </button>
      )}
    </section>
  );
}

// ---------------------------------------------------------------- board

export function TaskBoard({
  tasks,
  clientName,
  onOpen,
  defaultClientId,
}: {
  /** Already filtered; the board keeps its own order while dragging. */
  tasks: Task[];
  clientName: (id: string | null) => string | undefined;
  onOpen: (task: Task) => void;
  defaultClientId?: string | null;
}) {
  const update = useUpdateTask();
  const create = useCreateTask();
  const archive = useArchiveTasks();
  const restore = useRestoreTasks();

  const byId = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const [columns, setColumns] = useState<Columns>(() => toColumns(tasks));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const startColumn = useRef<TaskStatus | null>(null);

  // Follow the server/cache, except mid-drag.
  useEffect(() => {
    if (!activeId) setColumns(toColumns(tasks));
  }, [tasks, activeId]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // The column under the pointer decides; within it, the nearest card sets the slot.
  const collision: CollisionDetection = (args) => {
    const underPointer = pointerWithin(args);
    const hits = underPointer.length ? underPointer : rectIntersection(args);
    const card = hits.find((h) => !isStatus(h.id));
    if (card) return [card];
    const column = hits.find((h) => isStatus(h.id));
    if (!column) return hits;
    const ids = columns[column.id as TaskStatus].filter((id) => id !== args.active.id);
    if (!ids.length) return [column];
    const nearest = closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter((c) => ids.includes(String(c.id))),
    });
    return nearest.length ? [nearest[0]] : [column];
  };

  const columnOf = (id: string): TaskStatus | null => {
    if (isStatus(id)) return id;
    return (TASK_STATUSES.find((s) => columns[s].includes(id)) as TaskStatus | undefined) ?? null;
  };

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    startColumn.current = columnOf(String(active.id));
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const from = columnOf(String(active.id));
    const to = columnOf(String(over.id));
    setOverColumn(to);
    if (!from || !to || from === to) return;
    // Move the card into the new column as it's dragged across.
    setColumns((cols) => {
      const fromIds = cols[from].filter((id) => id !== active.id);
      const toIds = [...cols[to]];
      const overIndex = isStatus(over.id) ? toIds.length : toIds.indexOf(String(over.id));
      toIds.splice(overIndex < 0 ? toIds.length : overIndex, 0, String(active.id));
      return { ...cols, [from]: fromIds, [to]: toIds };
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const id = String(active.id);
    setActiveId(null);
    setOverColumn(null);
    const from = startColumn.current;
    const to = over ? columnOf(String(over.id)) : null;
    if (!to || !from) {
      setColumns(toColumns(tasks));
      return;
    }
    const ids = [...columns[to]];
    const oldIndex = ids.indexOf(id);
    const newIndex = isStatus(over?.id) ? ids.length - 1 : ids.indexOf(String(over?.id));
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      ids.splice(oldIndex, 1);
      ids.splice(newIndex, 0, id);
    }
    setColumns((cols) => ({ ...cols, [to]: ids }));

    const at = ids.indexOf(id);
    const position = positionBetween(byId.get(ids[at - 1])?.position, byId.get(ids[at + 1])?.position);
    const task = byId.get(id);
    if (!task || (task.status === to && task.position === position)) return;
    update.mutate(
      { id, patch: { status: to, position } },
      { onError: (e) => toast.error(`Couldn't move it: ${e.message}`) },
    );
    if (to === "done" && from !== "done") toast.success(`Done: ${task.title}`);
  };

  const quickAdd = (status: TaskStatus, title: string) => {
    const last = byId.get(columns[status][columns[status].length - 1]);
    create.mutate(
      { title, status, position: positionBetween(last?.position, undefined), client_id: defaultClientId ?? null },
      { onError: (e) => toast.error(e.message) },
    );
  };

  const clearDone = () => {
    const ids = columns.done;
    archive.mutate(ids, {
      onSuccess: () =>
        toast(`Cleared ${ids.length} finished ${ids.length === 1 ? "task" : "tasks"}`, {
          action: { label: "Undo", onClick: () => restore.mutate(ids) },
        }),
    });
  };

  const active = activeId ? byId.get(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setOverColumn(null);
        setColumns(toColumns(tasks));
      }}
    >
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 lg:grid lg:snap-none lg:grid-cols-4 lg:overflow-visible">
        {TASK_STATUSES.map((s) => (
          <Column
            key={s}
            status={s}
            tasks={columns[s].map((id) => byId.get(id)).filter((t): t is Task => !!t)}
            clientName={clientName}
            onOpen={onOpen}
            onQuickAdd={quickAdd}
            onClearDone={clearDone}
            highlight={!!activeId && overColumn === s && startColumn.current !== s}
          />
        ))}
      </div>
      {/* Portalled: the page's fade-in transform would otherwise offset the lifted card. */}
      {createPortal(
        <DragOverlay dropAnimation={dropAnimation} zIndex={60}>
          {active ? <TaskCard task={active} clientName={clientName(active.client_id)} overlay /> : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
}
