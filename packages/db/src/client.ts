import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres, { type Sql } from "postgres";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export type SslMode = "require" | "verify-full" | "disable";

export interface DbOptions<Schema extends Record<string, unknown>> {
  /** The app's name, shown as `application_name` on the server. */
  readonly app: string;
  readonly schema: Schema;
  /** Connection string. Defaults to `DATABASE_URL`. */
  readonly url?: string | undefined;
  /** Pool size. Defaults to `DB_POOL_MAX`, then 10. */
  readonly max?: number;
  /** Defaults to `require` for every host except localhost. */
  readonly ssl?: SslMode;
  /** Set when the URL points at a transaction pooler, which cannot hold prepared statements. */
  readonly pooled?: boolean;
}

export interface Db<Schema extends Record<string, unknown>> {
  readonly db: PostgresJsDatabase<Schema>;
  readonly sql: Sql;
  close(): Promise<void>;
}

function requireUrl(url: string | undefined): string {
  if (!url) throw new Error("DATABASE_URL is not set.");

  return url;
}

/** The SSL mode for a connection string: local databases connect in the clear, everything else over TLS. */
export function defaultSslMode(url: string): SslMode {
  return LOCAL_HOSTS.has(new URL(url).hostname) ? "disable" : "require";
}

function connect(url: string, app: string, max: number, ssl: SslMode, pooled: boolean): Sql {
  return postgres(url, {
    // "already exists, skipping" notices from the migrator are not worth a log line.
    onnotice: () => {},
    max,
    ssl: ssl === "disable" ? false : ssl,
    prepare: !pooled,
    connection: { application_name: app },
    // Recycle idle connections so a failover or a restart of the managed
    // database is picked up without restarting the app.
    idle_timeout: 30,
    max_lifetime: 60 * 30,
  });
}

/** One Drizzle client per process. Each app connects as its own role to its own database. */
export function createDb<Schema extends Record<string, unknown>>(options: DbOptions<Schema>): Db<Schema> {
  const url = requireUrl(options.url ?? process.env.DATABASE_URL);
  const max = options.max ?? Number(process.env.DB_POOL_MAX ?? 10);
  const sql = connect(url, options.app, max, options.ssl ?? defaultSslMode(url), options.pooled ?? false);

  return {
    db: drizzle(sql, { schema: options.schema }),
    sql,
    close: () => sql.end({ timeout: 5 }),
  };
}

export interface MigrateOptions {
  readonly app: string;
  /** The folder `drizzle-kit generate` writes to. */
  readonly migrationsFolder: string;
  readonly url?: string | undefined;
  readonly ssl?: SslMode;
}

/**
 * Apply pending migrations on one connection, then close it. Run it
 * from the container entrypoint before the app starts. Schema changes
 * only ever reach a shared database through a reviewed migration file.
 */
export async function runMigrations(options: MigrateOptions): Promise<void> {
  const url = requireUrl(options.url ?? process.env.DATABASE_URL);
  const sql = connect(url, `${options.app}-migrate`, 1, options.ssl ?? defaultSslMode(url), false);

  try {
    await migrate(drizzle(sql), { migrationsFolder: options.migrationsFolder });
  } finally {
    await sql.end({ timeout: 5 });
  }
}
