export type LogFields = Readonly<Record<string, string | number | boolean | null | undefined>>;

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  /** Pass the caught error as `cause`; its name, message and stack are logged. */
  error(message: string, cause?: unknown, fields?: LogFields): void;
  /** A logger for one part of this scope: `ticket-sync` → `ticket-sync.humanitix`. */
  child(scope: string): Logger;
}

export interface LoggerOptions {
  /** Where lines go. Defaults to stdout, and stderr for errors. */
  readonly write?: (line: string, level: LogLevel) => void;
  readonly now?: () => Date;
}

function writeToConsole(line: string, level: LogLevel): void {
  if (level === "error") console.error(line);
  else console.log(line);
}

interface CauseFields {
  readonly errorName?: string;
  readonly errorMessage?: string;
  readonly errorStack?: string | undefined;
}

function describeCause(cause: unknown): CauseFields {
  if (cause === undefined) return {};

  if (cause instanceof Error) {
    return { errorName: cause.name, errorMessage: cause.message, errorStack: cause.stack };
  }

  return { errorMessage: String(cause) };
}

/**
 * A logger that writes one JSON object per line, which is what Dokploy,
 * Docker and every log search read best. `scope` says which part of the
 * app is speaking.
 */
export function createLogger(scope: string, options: LoggerOptions = {}): Logger {
  const write = options.write ?? writeToConsole;
  const now = options.now ?? (() => new Date());

  function emit(level: LogLevel, message: string, fields: LogFields = {}): void {
    write(JSON.stringify({ level, time: now().toISOString(), scope, message, ...fields }), level);
  }

  return {
    debug: (message, fields) => emit("debug", message, fields),
    info: (message, fields) => emit("info", message, fields),
    warn: (message, fields) => emit("warn", message, fields),
    error: (message, cause, fields) => emit("error", message, { ...fields, ...describeCause(cause) }),
    child: (name) => createLogger(`${scope}.${name}`, options),
  };
}
