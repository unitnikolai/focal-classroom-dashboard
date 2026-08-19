"use client";
import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/auth-client";
import { AdminUser, AdminOrganization } from "@/types/admin";
import UsersPanel from "./UsersPanel";
import OrganizationsPanel from "./OrganizationsPanel";

type Tab = "users" | "organizations";

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, orgsRes] = await Promise.all([
        apiFetch("/api/admin/users"),
        apiFetch("/api/admin/organizations"),
      ]);
      if (!usersRes.ok || !orgsRes.ok) {
        throw new Error("Failed to load admin data");
      }
      const usersData = await usersRes.json();
      const orgsData = await orgsRes.json();
      setUsers(usersData.users ?? []);
      setOrganizations(orgsData.organizations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-gray-800 dark:text-white/90">Admin panel</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Manage users, organization membership, and admin delegation.
      </p>

      <div className="mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800">
        {(["users", "organizations"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === t
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {t === "users" ? "Users" : "Organizations"}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : tab === "users" ? (
        <UsersPanel users={users} organizations={organizations} onChanged={fetchAll} />
      ) : (
        <OrganizationsPanel organizations={organizations} onChanged={fetchAll} />
      )}
    </div>
  );
}
