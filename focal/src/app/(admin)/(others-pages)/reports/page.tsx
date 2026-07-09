import type { Metadata } from "next";
import ActivityReport from "@/components/classroom/ActivityReport";

export const metadata: Metadata = {
  title: "Focal — Activity Report",
  description: "Live active vs. inactive session activity per user.",
};

export default function ReportsPage() {
  return <ActivityReport />;
}
