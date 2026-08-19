"use client";
import React, { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { Modal } from "@/components/ui/modal";
import { TrashBinIcon, PlusIcon } from "@/icons";
import { apiFetch } from "@/lib/auth-client";
import { AdminGroup, AdminOrganization, AdminUser } from "@/types/admin";

interface GroupsPanelProps {
  groups: AdminGroup[];
  organizations: AdminOrganization[];
  users: AdminUser[];
  onChanged: () => void;
}

export default function GroupsPanel({ groups, organizations, users, onChanged }: GroupsPanelProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupOrgId, setNewGroupOrgId] = useState("");
  const [creating, setCreating] = useState(false);

  const [manageGroup, setManageGroup] = useState<AdminGroup | null>(null);
  const [addMemberUserId, setAddMemberUserId] = useState("");

  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Select is uncontrolled internally; bump this to force a remount (and
  // clear its displayed value) after an action succeeds.
  const [selectResetKey, setSelectResetKey] = useState(0);

  const orgOptions = organizations.map((o) => ({ value: o.id, label: o.organization_name }));

  const eligibleUsers = useMemo(() => {
    if (!manageGroup) return [];
    const memberIds = new Set(manageGroup.members.map((m) => m.id));
    return users.filter((u) => u.organization_id === manageGroup.organization_id && !memberIds.has(u.id));
  }, [manageGroup, users]);

  const createGroup = async () => {
    if (!newGroupName.trim() || !newGroupOrgId) return;
    setCreating(true);
    setError(null);
    try {
      const res = await apiFetch("/api/admin/groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ organization_id: newGroupOrgId, group_name: newGroupName.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to create group");
      setIsCreateOpen(false);
      setNewGroupName("");
      setNewGroupOrgId("");
      setSelectResetKey((k) => k + 1);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const deleteGroup = async (group: AdminGroup) => {
    if (!confirm(`Delete group "${group.group_name}"? This cannot be undone.`)) return;
    setBusyKey(group.group_id);
    setError(null);
    try {
      const res = await apiFetch("/api/admin/groups", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ group_id: group.group_id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to delete group");
      if (manageGroup?.group_id === group.group_id) setManageGroup(null);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group");
    } finally {
      setBusyKey(null);
    }
  };

  const addMember = async () => {
    if (!manageGroup || !addMemberUserId) return;
    setBusyKey(`add-${addMemberUserId}`);
    setError(null);
    try {
      const res = await apiFetch("/api/admin/groups/members", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ group_id: manageGroup.group_id, user_id: addMemberUserId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to add member");
      setAddMemberUserId("");
      setSelectResetKey((k) => k + 1);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setBusyKey(null);
    }
  };

  const removeMember = async (userId: string) => {
    if (!manageGroup) return;
    setBusyKey(`remove-${userId}`);
    setError(null);
    try {
      const res = await apiFetch("/api/admin/groups/members", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ group_id: manageGroup.group_id, user_id: userId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to remove member");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setBusyKey(null);
    }
  };

  // Keep the open "manage members" modal in sync as `groups` refreshes after a change.
  const liveManageGroup = manageGroup
    ? groups.find((g) => g.group_id === manageGroup.group_id) ?? null
    : null;

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <Button size="sm" startIcon={<PlusIcon />} onClick={() => setIsCreateOpen(true)} disabled={organizations.length === 0}>
          New group
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Group</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Organization</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Members</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {groups.map((group) => (
                  <TableRow key={group.group_id}>
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {group.group_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {group.organization_name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {group.members.length}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-3">
                        <Button size="sm" variant="outline" onClick={() => setManageGroup(group)}>
                          Manage members
                        </Button>
                        <button
                          onClick={() => deleteGroup(group)}
                          disabled={busyKey === group.group_id}
                          className="text-error-500 hover:text-error-600 disabled:opacity-50"
                          aria-label={`Delete ${group.group_name}`}
                        >
                          <TrashBinIcon />
                        </button>
                      </div>
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
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">New group</h3>
          <div className="mb-4">
            <Label htmlFor="group-org">Organization</Label>
            <Select key={selectResetKey} options={orgOptions} placeholder="Select organization" onChange={setNewGroupOrgId} />
          </div>
          <div className="mb-6">
            <Label htmlFor="group-name">Group name</Label>
            <Input id="group-name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Period 3" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={createGroup} disabled={creating || !newGroupName.trim() || !newGroupOrgId}>
              {creating ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!liveManageGroup} onClose={() => setManageGroup(null)} className="max-w-lg p-6">
        {liveManageGroup && (
          <div className="p-2">
            <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">{liveManageGroup.group_name}</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{liveManageGroup.organization_name}</p>

            <div className="mb-4 flex items-center gap-2">
              <Select
                key={selectResetKey}
                options={eligibleUsers.map((u) => ({
                  value: u.id,
                  label: `${[u.given_name, u.family_name].filter(Boolean).join(" ") || u.email}`,
                }))}
                placeholder={eligibleUsers.length ? "Add a member" : "No eligible users in this org"}
                onChange={setAddMemberUserId}
              />
              <Button
                size="sm"
                variant="outline"
                disabled={!addMemberUserId || busyKey === `add-${addMemberUserId}`}
                onClick={addMember}
              >
                Add
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-white/[0.05]">
              {liveManageGroup.members.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 dark:text-gray-400">No members yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {liveManageGroup.members.map((member) => (
                    <li key={member.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <span className="block text-sm font-medium text-gray-800 dark:text-white/90">
                          {[member.given_name, member.family_name].filter(Boolean).join(" ") || "—"}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">{member.email}</span>
                      </div>
                      <button
                        onClick={() => removeMember(member.id)}
                        disabled={busyKey === `remove-${member.id}`}
                        className="text-error-500 hover:text-error-600 disabled:opacity-50"
                        aria-label={`Remove ${member.email}`}
                      >
                        <TrashBinIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setManageGroup(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
