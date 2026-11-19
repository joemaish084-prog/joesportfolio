import { lazy, type ComponentType } from "react";
import { PORTFOLIO_PATH } from "@/lib/publicViews";

function preloadableView(load: () => Promise<{ default: ComponentType }>) {
  let ready: ComponentType | undefined;
  let pending: ReturnType<typeof load> | undefined;
  const preload = () => pending ??= load().then((module) => {
    ready = module.default;
    return module;
  });
  const LazyView = lazy(preload);
  return { preload, View: () => {
    const View = ready ?? LazyView;
    return <View />;
  } };
}

const agency = preloadableView(() => import("./AgencyHome"));
const portfolio = preloadableView(() => import("./Index"));

export const AgencyHomeView = agency.View;
export const PortfolioView = portfolio.View;
// The route components share their cached imports with the view switch.
// eslint-disable-next-line react-refresh/only-export-components
export function preloadPrimaryView(path: "/" | typeof PORTFOLIO_PATH) {
  return path === "/" ? agency.preload() : portfolio.preload();
}
