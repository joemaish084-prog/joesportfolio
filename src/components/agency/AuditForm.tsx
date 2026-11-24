import { useEffect, useRef, useState, type ComponentType } from "react";
import { AuditFormView } from "./AuditFormView";

export function AuditForm() {
  const placeholder = useRef<HTMLDivElement>(null);
  const [Controller, setController] = useState<ComponentType>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!placeholder.current) return;
    let active = true;
    const load = () => {
      void import("./AuditFormController").then(({ default: Form }) => {
        if (active) setController(() => Form);
      }).catch(() => {
        if (active) setFailed(true);
      });
    };

    if (attempt > 0 || window.location.hash === "#audit" || !("IntersectionObserver" in window)) {
      load();
      return () => { active = false; };
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      load();
    }, { rootMargin: "650px" });
    observer.observe(placeholder.current);
    return () => { active = false; observer.disconnect(); };
  }, [attempt]);

  if (Controller) return <Controller />;
  return <div ref={placeholder}><AuditFormView status={failed ? "unavailable" : "loading"} onRetry={() => {
    setFailed(false);
    setAttempt(value => value + 1);
  }} /></div>;
}
