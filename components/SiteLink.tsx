import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string | null;
  className?: string;
  children: ReactNode;
  /** Shown to assistive tech (and as a tooltip) when the destination isn't live yet. */
  pendingLabel?: string;
  external?: boolean;
  "aria-current"?: "page";
};

/**
 * Link to a configurable destination. When `href` is null the destination
 * doesn't exist yet, so render a disabled placeholder rather than a fake URL.
 */
export default function SiteLink({ href, className, children, pendingLabel = "Coming soon", external, ...rest }: Props) {
  if (!href) {
    return (
      <a className={className} aria-disabled="true" title={pendingLabel} data-pending="">
        {children}
        <span className="sr-only"> ({pendingLabel})</span>
      </a>
    );
  }
  if (external || href.startsWith("http") || href.endsWith(".pdf")) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={href} {...rest}>
      {children}
    </Link>
  );
}
