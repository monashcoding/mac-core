export interface HealthOptions {
  /** The app's name. */
  readonly service: string;
  /** Dependencies to probe, by name. A check passes unless it throws or takes too long. */
  readonly checks?: Readonly<Record<string, () => Promise<void>>>;
  readonly timeoutMs?: number;
}

export interface HealthReport {
  readonly status: "ok" | "degraded";
  readonly service: string;
  readonly checks: Record<string, "ok" | "down">;
}

async function passes(check: () => Promise<void>, timeoutMs: number): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<boolean>((resolve) => {
    timer = setTimeout(() => resolve(false), timeoutMs);
  });

  try {
    return await Promise.race([check().then(() => true), timeout]);
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Probe every dependency and report. */
export async function checkHealth(options: HealthOptions): Promise<HealthReport> {
  const entries = Object.entries(options.checks ?? {});
  const results = await Promise.all(entries.map(([, check]) => passes(check, options.timeoutMs ?? 2000)));
  const checks = Object.fromEntries(entries.map(([name], index) => [name, results[index] ? "ok" : "down"] as const));

  return { status: results.every(Boolean) ? "ok" : "degraded", service: options.service, checks };
}

/**
 * A handler for `GET /api/health`: 200 when every check passes, 503
 * when one is down, so Dokploy and uptime monitors read it the same way
 * in every app.
 */
export function createHealthHandler(options: HealthOptions): () => Promise<Response> {
  return async () => {
    const report = await checkHealth(options);

    return Response.json(report, {
      status: report.status === "ok" ? 200 : 503,
      headers: { "cache-control": "no-store" },
    });
  };
}
