import { Globe, LayoutGrid, Rows3, type LucideIcon } from "lucide-react";

/**
 * The ways a visitor can browse the design work. To add a view, add it here,
 * then render it where `view` is switched on (WorkDesign and GraphicDesign).
 */
export const DESIGN_VIEWS = [
  { id: "grid", label: "Grid", icon: LayoutGrid },
  { id: "wall", label: "Drift wall", icon: Rows3 },
  { id: "sphere", label: "Sphere", icon: Globe },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon }[];

export type DesignView = (typeof DESIGN_VIEWS)[number]["id"];

export const parseDesignView = (value: string | null | undefined): DesignView =>
  DESIGN_VIEWS.find((v) => v.id === value)?.id ?? "grid";
