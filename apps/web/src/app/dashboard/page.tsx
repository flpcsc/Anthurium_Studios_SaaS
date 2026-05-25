import { redirect } from "next/navigation";

/**
 * /dashboard root redirects to the first meaningful section.
 * The dashboard layout handles auth guarding for the whole /dashboard/* tree.
 */
export default function DashboardIndexPage(): never {
  redirect("/dashboard/videos");
}
