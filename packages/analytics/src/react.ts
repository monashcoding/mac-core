"use client";

import { useEffect, useRef } from "react";

import type { Analytics } from "./client";

export interface MacAnalyticsProps {
  readonly analytics: Analytics;
  /**
   * The signed-in macUserId, `null` when signed out, `undefined` while
   * the session is still loading.
   */
  readonly userId: string | null | undefined;
}

/**
 * Starts analytics and keeps its identity in step with the MAC session.
 * Mount once in the root layout.
 */
export function MacAnalytics({ analytics, userId }: MacAnalyticsProps): null {
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    analytics.start();
  }, [analytics]);

  useEffect(() => {
    if (userId === undefined || userId === lastId.current) return;

    const previous = lastId.current;

    lastId.current = userId;

    if (userId) analytics.identify(userId);
    // Was signed in, now signed out: drop the identity.
    else if (previous) analytics.reset();
  }, [analytics, userId]);

  return null;
}
