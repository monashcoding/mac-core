import type { Logger } from "./log";

export type JobOutcome = "ran" | "skipped" | "busy" | "failed";

export interface JobOptions {
  readonly name: string;
  /** Return false to skip a run: an integration with no API key, a paused sync. */
  readonly enabled?: () => boolean;
  run(): Promise<void>;
  readonly logger: Logger;
}

export interface Job {
  readonly name: string;
  /** Run once. Never throws, and never overlaps a run still in progress. */
  run(): Promise<JobOutcome>;
}

/**
 * A scheduled task, wrapped the way every MAC cron already is by hand:
 * skipped when it is not configured, never two at once, and a failure
 * is logged instead of taking the process down. Schedule `job.run` with
 * node-cron, setInterval or a cron-triggered route.
 */
export function defineJob(options: JobOptions): Job {
  const logger = options.logger.child(options.name);
  let running = false;

  return {
    name: options.name,

    async run() {
      if (options.enabled?.() === false) return "skipped";

      if (running) {
        logger.warn("Skipped: the previous run is still going");

        return "busy";
      }

      running = true;

      const started = Date.now();

      try {
        await options.run();
        logger.info("Finished", { durationMs: Date.now() - started });

        return "ran";
      } catch (error) {
        logger.error("Failed", error, { durationMs: Date.now() - started });

        return "failed";
      } finally {
        running = false;
      }
    },
  };
}
