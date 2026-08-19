"use client";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Switch from "@/components/form/switch/Switch";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { TrashBinIcon } from "@/icons";
import { apiFetch } from "@/lib/auth-client";
import { AdminUser, AdminOrganization } from "@/types/admin";

interface UsersPanelProps {
  users: AdminUser[];
  organizations: AdminOrganization[];
  onChanged: () => void;
}

export default function UsersPanel({ users, organizations, onChanged }: UsersPanelProps) {
  const [pendingOrgMove, setPendingOrgMove] = useState<Record<string, string>>({});
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orgOptions = organizations.map((o) => ({ value: o.id, label: o.organization_name }));

  const toggleAdminStatus = async (user: AdminUser, next: boolean) => {
    setBusyUserId(user.id);
    setError(null);
    try {
      const res = await apiFetch("/api/admin/users/admin-status", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_id: user.id, admin_status: next }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to update admin status");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update admin status");
    } finally {
      setBusyUserId(null);
    }
  };

  const moveToOrganization = async (user: AdminUser) => {
    const organization_id = pendingOrgMove[user.id];
    if (!organization_id || organization_id === user.organization_id) return;
    setBusyUserId(user.id);
    setError(null);
    try {
      const res = await apiFetch("/api/admin/users/organization", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_id: user.id, organization_id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to move user");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move user");
    } finally {
      setBusyUserId(null);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return;
    setBusyUserId(user.id);
    setError(null);
    try {
      const res = await apiFetch("/api/admin/users", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to delete user");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1100px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">User</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Organization</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Move to org</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Admin status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Focal admin</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {[user.given_name, user.family_name].filter(Boolean).join(" ") || "—"}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">{user.email}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.organization_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <Select
                          options={orgOptions}
                          placeholder="Select org"
                          onChange={(value) => setPendingOrgMove((prev) => ({ ...prev, [user.id]: value }))}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyUserId === user.id || !pendingOrgMove[user.id] || pendingOrgMove[user.id] === user.organization_id}
                          onClick={() => moveToOrganization(user)}
                        >
                          Move
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Switch
                        label=""
                        defaultChecked={user.admin_status}
                        disabled={busyUserId === user.id}
                        onChange={(checked) => toggleAdminStatus(user, checked)}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge size="sm" color={user.focal_admin ? "primary" : "light"}>
                        {user.focal_admin ? "focal_admin" : "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <button
                        onClick={() => deleteUser(user)}
                        disabled={busyUserId === user.id}
                        className="text-error-500 hover:text-error-600 disabled:opacity-50"
                        aria-label={`Delete ${user.email}`}
                      >
                        <TrashBinIcon />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
