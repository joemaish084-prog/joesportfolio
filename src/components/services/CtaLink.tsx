import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface CtaLinkProps {
  to: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
}

/** Internal routes use the router; external destinations (Calendly) open in a new tab. */
export function CtaLink({ to, external, className, children }: CtaLinkProps) {
  const isExternal = external ?? /^https?:\/\//.test(to);
  return isExternal ? (
    <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}
