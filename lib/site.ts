/**
 * Single source for site-wide navigation, routes and company details.
 * A `null` route/URL means the destination doesn't exist yet: links render as
 * clearly-marked disabled placeholders instead of pointing somewhere fake.
 */

export type NavKey = "solutions" | "products" | "work" | "about" | "careers";

export const NAV: { key: NavKey; label: string; href: string | null }[] = [
  { key: "solutions", label: "Solutions", href: null },
  { key: "products", label: "Products", href: null },
  { key: "work", label: "Work", href: null },
  { key: "about", label: "About Us", href: "/about" },
  { key: "careers", label: "Careers", href: null },
];

export const ROUTES: {
  home: string;
  about: string;
  projects: string | null;
  contact: string | null;
  capabilities: string | null;
} = {
  home: "/",
  about: "/about",
  projects: null,
  contact: null,
  capabilities: null,
};

/** Leave empty until verified; empty values are not rendered. */
export const CONTACT = {
  email: "",
  phone: "",
  location: "Riyadh, Kingdom of Saudi Arabia",
};

/** Company Profile document. Set real URLs when the PDF is published. */
export const COMPANY_PROFILE: { downloadUrl: string | null; viewUrl: string | null } = {
  downloadUrl: null,
  viewUrl: null,
};
