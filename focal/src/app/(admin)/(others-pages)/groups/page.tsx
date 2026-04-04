import type { Metadata } from "next";
import TabbedDashboard from "@/components/classroom/TabbedDashboard";

export const metadata: Metadata = {
  title: "Focal — Organization Dashboard",
  description: "Manage your organization session, device blocks, and attendance.",
};

export default function DashboardPage() {
  return <TabbedDashboard />;
}
