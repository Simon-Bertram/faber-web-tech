export interface NavLink {
  href: string;
  label: string;
}

export interface NavGroup {
  children: readonly NavLink[];
  href: string;
  label: string;
}

export type NavItem = NavLink | NavGroup;

export const mainNav = [
  { href: "/", label: "Overview" },
  {
    children: [
      { href: "/solutions", label: "All solutions" },
      { href: "/solutions#modern-websites", label: "Modern Websites" },
      { href: "/solutions#web-apps", label: "Web Apps" },
      { href: "/ai-applications", label: "AI Automation" },
      { href: "/solutions#seo-geo", label: "SEO & GEO" },
    ],
    href: "/solutions",
    label: "Services",
  },
  { href: "/contact", label: "Contact" },
] as const satisfies readonly NavItem[];

export function isNavGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

function splitHref(href: string): { pathname: string; hash: string } {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) {
    return { hash: "", pathname: href };
  }
  return {
    hash: href.slice(hashIndex),
    pathname: href.slice(0, hashIndex) || "/",
  };
}

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** Exact match for a leaf link (pathname + optional hash). */
export function isNavLinkActive(
  pathname: string,
  hash: string,
  href: string
): boolean {
  const target = splitHref(href);
  const normalizedPath = normalizePathname(pathname);

  if (target.pathname !== normalizedPath && target.pathname !== pathname) {
    return false;
  }

  if (target.hash) {
    return hash === target.hash;
  }

  if (target.pathname === "/") {
    return normalizedPath === "/" || pathname === "/";
  }

  return !hash || hash === "#";
}

/** Services section is current on /solutions or /ai-applications. */
export function isServicesSectionActive(pathname: string): boolean {
  const normalizedPath = normalizePathname(pathname);
  return (
    normalizedPath === "/solutions" || normalizedPath === "/ai-applications"
  );
}

export function isNavItemActive(
  pathname: string,
  hash: string,
  item: NavItem
): boolean {
  if (isNavGroup(item)) {
    return isServicesSectionActive(pathname);
  }
  return isNavLinkActive(pathname, hash, item.href);
}
