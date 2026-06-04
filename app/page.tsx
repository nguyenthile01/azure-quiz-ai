import DashboardLayout from "./dashboard/layout";
import DashboardPage from "./dashboard/page";

export const metadata = {
  title: "AzurePrep AI — AZ-900 Practice Test Generator",
  description: "Generate AI-powered Azure Fundamentals (AZ-900) practice tests instantly.",
};

export default function Home() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}