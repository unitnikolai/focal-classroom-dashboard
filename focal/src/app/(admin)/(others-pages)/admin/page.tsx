import type { Metadata } from "next";
import { FocalAdminGuard } from "@/components/auth/FocalAdminGuard";
import AdminPanel from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Focal — Admin Panel",
  description: "Manage users, organizations, and admin delegation.",
};

export default function AdminPage() {
  return (
    <FocalAdminGuard>
      <AdminPanel />
    </FocalAdminGuard>
  );
}
