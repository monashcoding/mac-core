import { describe, expect, it } from "vitest";

import { defaultSslMode } from "./client";
import { appConnectionString, generatePassword, provisionStatements } from "./provision";

describe("provisionStatements", () => {
  it("creates a least-privilege role that owns one database", () => {
    const statements = provisionStatements({ app: "monmap", password: "pw" });

    expect(statements).toEqual([
      `CREATE ROLE "monmap" LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION CONNECTION LIMIT 20 PASSWORD 'pw'`,
      `GRANT "monmap" TO CURRENT_USER`,
      `CREATE DATABASE "monmap" OWNER "monmap"`,
      `REVOKE "monmap" FROM CURRENT_USER`,
      `REVOKE ALL ON DATABASE "monmap" FROM PUBLIC`,
      `GRANT CONNECT, TEMPORARY ON DATABASE "monmap" TO "monmap"`,
    ]);
  });

  it("escapes the password and refuses unsafe names", () => {
    expect(provisionStatements({ app: "study", password: "it's" })[0]).toContain("PASSWORD 'it''s'");
    expect(() => provisionStatements({ app: 'x"; DROP ROLE admin; --', password: "pw" })).toThrowError();
    expect(() => provisionStatements({ app: "Study", password: "pw" })).toThrowError();
    expect(() => provisionStatements({ app: "study", password: "pw", connectionLimit: 0 })).toThrowError();
  });
});

describe("connection strings", () => {
  it("points the app at its own database on the same server", () => {
    const password = generatePassword();
    const url = appConnectionString("postgres://admin:secret@db.example.com:5432/postgres", "monmap", password);

    expect(url).toBe(`postgres://monmap:${password}@db.example.com:5432/monmap`);
  });

  it("requires TLS everywhere except localhost", () => {
    expect(defaultSslMode("postgres://u:p@db.example.com/app")).toBe("require");
    expect(defaultSslMode("postgres://u:p@localhost:5432/app")).toBe("disable");
  });
});
