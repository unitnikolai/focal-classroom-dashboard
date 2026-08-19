"use client";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Modal } from "@/components/ui/modal";
import { TrashBinIcon, PlusIcon } from "@/icons";
import { apiFetch } from "@/lib/auth-client";
import { AdminOrganization } from "@/types/admin";

interface OrganizationsPanelProps {
  organizations: AdminOrganization[];
  onChanged: () => void;
}

export default function OrganizationsPanel({ organizations, onChanged }: OrganizationsPanelProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgId, setNewOrgId] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrganization = async () => {
    if (!newOrgName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await apiFetch("/api/admin/organizations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          organization_name: newOrgName.trim(),
          ...(newOrgId.trim() ? { organization_id: newOrgId.trim() } : {}),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to create organization");
      setIsCreateOpen(false);
      setNewOrgName("");
      setNewOrgId("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  const deleteOrganization = async (org: AdminOrganization) => {
    if (!confirm(`Delete organization "${org.organization_name}"? This cannot be undone.`)) return;
    setBusyId(org.id);
    setError(null);
    try {
      const res = await apiFetch("/api/admin/organizations", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ organization_id: org.id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to delete organization");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete organization");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <Button size="sm" startIcon={<PlusIcon />} onClick={() => setIsCreateOpen(true)}>
          New organization
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[700px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Organization</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Members</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Created</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {org.organization_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{org.id}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{org.member_count}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {new Date(org.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <button
                        onClick={() => deleteOrganization(org)}
                        disabled={busyId === org.id || org.member_count > 0}
                        title={org.member_count > 0 ? "Move or delete members first" : "Delete organization"}
                        className="text-error-500 hover:text-error-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={`Delete ${org.organization_name}`}
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

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} className="max-w-md p-6">
        <div className="p-2">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">New organization</h3>
          <div className="mb-4">
            <Label htmlFor="org-name">Organization name</Label>
            <Input id="org-name" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="Acme School District" />
          </div>
          <div className="mb-6">
            <Label htmlFor="org-id">Organization ID (optional)</Label>
            <Input id="org-id" value={newOrgId} onChange={(e) => setNewOrgId(e.target.value)} placeholder="Auto-generated if left blank" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={createOrganization} disabled={creating || !newOrgName.trim()}>
              {creating ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
