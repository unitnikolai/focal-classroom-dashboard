import type { Metadata } from "next";
import ClassroomDashboard from "@/components/classroom/ClassroomDashboard";

export const metadata: Metadata = {
  title: "Focal — Classroom Dashboard",
  description: "Manage your classroom session, device blocks, and attendance.",
};

export default function DashboardPage() {
  return <ClassroomDashboard />;
}
