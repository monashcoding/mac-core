"use client";

import { useEffect, useSyncExternalStore } from "react";

import { getMacAuthClient, type MacAuthClient, type MacSession } from "./client";

const LOADING: MacSession = { status: "loading", user: null };

/**
 * The signed-in user in a client component. Starts as `loading`, then
 * settles on `signed-in` or `signed-out`.
 */
export function useMacSession(client: MacAuthClient = getMacAuthClient()): MacSession {
  const session = useSyncExternalStore(
    client.subscribe,
    client.getSession,
    () => LOADING,
  );

  useEffect(() => {
    void client.refresh();
  }, [client]);

  return session;
}
