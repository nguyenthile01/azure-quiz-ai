import type { ReactNode } from "react";

// named exports are fine
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}