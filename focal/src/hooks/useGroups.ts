"use client";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/auth-client";

interface RawGroup {
  group_id: string;
  group_name: string;
}

export function useGroups() {
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
      const groups: RawGroup[] = data.groups ?? [];
      setGroupNames(new Map(groups.map((g) => [g.group_id, g.group_name])));
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

  return { groupNames, loading, error, refetch: fetchGroups };
}
