import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

// Using a separate component for the loading state
function DashboardLoading() {
  return <div className="flex h-screen items-center justify-center">Loading...</div>;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardClient />
    </Suspense>
  );
}