import { Suspense } from "react";
import DashboardClient from "./dashboard/DashboardClient";
import DashboardLayout from "./dashboard/layout";
import DashboardPage from "./dashboard/page";

// You can reuse or create a specific loading component
function PageLoading() {
  return <div className="flex h-screen items-center justify-center">Loading...</div>;
}

export const metadata = {
  title: "AzurePrep AI — AZ-900 Practice Test Generator",
  description: "Generate AI-powered Azure Fundamentals (AZ-900) practice tests instantly.",
};

export default function Home() {
  return (
    <Suspense fallback={<PageLoading />}>
      <DashboardClient />
    </Suspense>
  );
}