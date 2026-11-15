#!/usr/bin/env node
import postgres from "postgres";

import { defaultSslMode } from "./client";
import { generateKey } from "./crypto";
import { appConnectionString, generatePassword, provisionStatements } from "./provision";

const USAGE = `mac-db <command>

  generate-key       Print a new key for MAC_DATA_KEYS or MAC_INDEX_KEY.
  provision <app>    Create the app's role and database on the server in
                     ADMIN_DATABASE_URL, and print its DATABASE_URL once.
`;

async function provision(app: string): Promise<void> {
  const adminUrl = process.env.ADMIN_DATABASE_URL;

  if (!adminUrl) throw new Error("Set ADMIN_DATABASE_URL to an administrator connection string.");

  const password = generatePassword();
  const statements = provisionStatements({ app, password });
  const mode = defaultSslMode(adminUrl);
  const sql = postgres(adminUrl, { max: 1, ssl: mode === "disable" ? false : mode });

  try {
    for (const statement of statements) await sql.unsafe(statement);
  } finally {
    await sql.end({ timeout: 5 });
  }

  console.log(`DATABASE_URL=${appConnectionString(adminUrl, app, password)}`);
}

async function main(): Promise<void> {
  const [command, argument] = process.argv.slice(2);

  if (command === "generate-key") {
    console.log(generateKey());

    return;
  }

  if (command === "provision" && argument) {
    await provision(argument);

    return;
  }

  console.error(USAGE);
  process.exitCode = 1;
}

main().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
