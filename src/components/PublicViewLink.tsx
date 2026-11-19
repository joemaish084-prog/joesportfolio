import { forwardRef, startTransition, useEffect, useRef, type ComponentProps } from "react";
import { flushSync } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AUDIT_PATH, PORTFOLIO_PATH } from "@/lib/publicViews";
import { preloadPrimaryView } from "@/pages/primaryViews";

type Props = Omit<ComponentProps<typeof Link>, "to"> & { to: "/" | typeof PORTFOLIO_PATH | typeof AUDIT_PATH };

export const PublicViewLink = forwardRef<HTMLAnchorElement, Props>(function PublicViewLink(
  { to, onClick, ...props }, ref,
) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = to === AUDIT_PATH ? "/" : to;
  const click = useRef(0);
  useEffect(() => () => { click.current++; }, [location.key]);

  function prefetch() {
    if (location.pathname !== path) void preloadPrimaryView(path).catch(() => {});
  }

  return (
    <Link {...props} to={to} ref={ref} onPointerEnter={prefetch} onFocus={prefetch} onClick={(event) => {
      onClick?.(event);
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
          event.altKey || event.shiftKey || (props.target && props.target !== "_self") ||
          location.pathname === path) return;
      event.preventDefault();
      const intent = ++click.current;
      void preloadPrimaryView(path).then(() => {
        const update = () => { if (click.current === intent) navigate(to); };
        if (click.current !== intent) return;
        if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          document.startViewTransition(() => flushSync(update));
        } else {
          startTransition(update);
        }
      }).catch(() => {
        if (click.current === intent) startTransition(() => navigate(to));
      });
    }} />
  );
});
