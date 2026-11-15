import { randomBytes } from "node:crypto";

const APP_NAME = /^[a-z][a-z0-9_]{1,30}$/;

export interface ProvisionOptions {
  /** The app's name: its role and its database are both called this. */
  readonly app: string;
  readonly password: string;
  /** Most connections the app's role may hold at once. */
  readonly connectionLimit?: number;
}

function quoteLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

/** A random password that needs no escaping in a connection string. */
export function generatePassword(): string {
  return randomBytes(24).toString("base64url");
}

/**
 * The statements that give an app its own login role and its own
 * database on the shared Postgres server. The role owns that database
 * and cannot connect to another app's: PUBLIC loses CONNECT on each app
 * database, and the role is neither a superuser nor able to create
 * roles or databases.
 *
 * Run them as an administrator, connected to the maintenance database.
 * `CREATE DATABASE` cannot run inside a transaction, so run them one by one.
 */
export function provisionStatements(options: ProvisionOptions): string[] {
  const { app, password } = options;
  const limit = options.connectionLimit ?? 20;

  if (!APP_NAME.test(app)) {
    throw new Error("An app name is lowercase letters, digits and underscores, starting with a letter.");
  }

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("The connection limit is a positive integer.");
  }

  return [
    `CREATE ROLE "${app}" LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION CONNECTION LIMIT ${limit} PASSWORD ${quoteLiteral(password)}`,
    // A managed server's administrator is not a superuser, and may only hand
    // a database to a role it is a member of. It joins for that one statement.
    `GRANT "${app}" TO CURRENT_USER`,
    `CREATE DATABASE "${app}" OWNER "${app}"`,
    `REVOKE "${app}" FROM CURRENT_USER`,
    `REVOKE ALL ON DATABASE "${app}" FROM PUBLIC`,
    `GRANT CONNECT, TEMPORARY ON DATABASE "${app}" TO "${app}"`,
  ];
}

/** The connection string an app uses once its role and database exist. */
export function appConnectionString(adminUrl: string, app: string, password: string): string {
  const url = new URL(adminUrl);

  url.username = app;
  url.password = password;
  url.pathname = `/${app}`;

  return url.href;
}
