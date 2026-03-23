import type { Metadata } from "next";
import ClassroomDashboard from "@/components/classroom/ClassroomDashboard";

export const metadata: Metadata = {
  title: "Focal — Organization Dashboard",
  description: "Manage your organization session, device blocks, and attendance.",
};

export default function DashboardPage() {
  return <ClassroomDashboard />;
}
