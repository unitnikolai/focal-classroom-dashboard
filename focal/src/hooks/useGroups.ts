"use client";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/auth-client";

interface RawGroup {
  group_id: string;
  group_name: string;
}

export interface OrgGroup {
  id: string;
  name: string;
}

export function useGroups() {
  // Ordered list of every group in the caller's org (backend returns them
  // sorted by name). This is the authoritative set of groups an org admin
  // should see on the dashboard — independent of whether any group currently
  // has an active session.
  const [groups, setGroups] = useState<OrgGroup[]>([]);
  const [groupNames, setGroupNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await apiFetch("/api/groups");
      if (!res.ok) {
        throw new Error(`Failed to fetch groups (${res.status})`);
      }
      const data = await res.json();
      const raw: RawGroup[] = data.groups ?? [];
      setGroups(raw.map((g) => ({ id: g.group_id, name: g.group_name })));
      setGroupNames(new Map(raw.map((g) => [g.group_id, g.group_name])));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching groups");
      console.error("Groups fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, groupNames, loading, error, refetch: fetchGroups };
}
