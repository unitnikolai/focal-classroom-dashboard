"use client";
import React, { createContext, useContext } from "react";
import { useSessions } from "@/hooks/useSessions";
import { Student } from "@/components/classroom/types";

type SessionsContextType = {
  sessions: Student[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

export const useSessionsContext = () => {
  const context = useContext(SessionsContext);
  if (!context) {
    throw new Error("useSessionsContext must be used within a SessionsProvider");
  }
  return context;
};

/**
 * Runs the org session fetch + AppSync subscription once at the layout
 * level, so switching between pages that both need session data (Dashboard,
 * Reports) doesn't tear down and re-establish the WebSocket subscription —
 * and re-fetch from scratch — on every navigation.
 */
export const SessionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useSessions(5000);
  return <SessionsContext.Provider value={value}>{children}</SessionsContext.Provider>;
};
