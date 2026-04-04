import type { Metadata } from "next";
import GroupsDashboard from "@/components/classroom/GroupsDashboard";

export const metadata: Metadata = {
  title: "Focal — Groups",
  description: "Manage devices by group within your organization.",
};

export default function GroupsPage() {
  return <GroupsDashboard />;
}
