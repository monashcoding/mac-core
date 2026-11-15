import { PGlite } from "@electric-sql/pglite";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { defineList, escapeLike, filter } from "./list";

const unit = pgTable("unit", {
  code: text("code").primaryKey(),
  title: text("title").notNull(),
  faculty: text("faculty").notNull(),
  level: integer("level").notNull(),
  credit: integer("credit").notNull(),
  offered: boolean("offered").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 3 }).notNull(),
  handbookUrl: text("handbook_url"),
});

const units = defineList({
  table: unit,
  id: unit.code,
  sorts: { code: unit.code, title: unit.title, credit: unit.credit, created: unit.createdAt },
  defaultSort: "code",
  filters: {
    faculty: filter.equals(unit.faculty),
    level: filter.oneOf(unit.level, z.coerce.number().int()),
    minCredit: filter.atLeast(unit.credit),
    offered: filter.flag(unit.offered),
    q: filter.contains(unit.code, unit.title),
  },
  pageSize: 7,
  maxPageSize: 20,
});

const client = new PGlite();
const db = drizzle(client);

beforeAll(async () => {
  await db.execute(sql`
    create table unit (
      code text primary key, title text not null, faculty text not null, level integer not null,
      credit integer not null, offered boolean not null, created_at timestamptz(3) not null, handbook_url text
    )
  `);
  await db.insert(unit).values(
    Array.from({ length: 40 }, (_, index) => ({
      code: `FIT${String(1000 + index)}`,
      // Many rows share a title and a credit value, so ties are the common case.
      title: `Topic ${index % 4}`,
      faculty: index % 2 === 0 ? "IT" : "ENG",
      level: (index % 3) + 1,
      credit: index % 5 === 0 ? 12 : 6,
      offered: index % 7 !== 0,
      createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, 0, index % 6)),
    })),
  );
  await db.insert(unit).values({
    code: "MTH100%", title: "100%_real", faculty: "SCI", level: 1, credit: 6, offered: true, createdAt: new Date(0),
  });
});

afterAll(async () => {
  await client.close();
});

async function walk(search: string): Promise<string[]> {
  const codes: string[] = [];
  let params = units.parse(new URLSearchParams(search));

  for (let pages = 0; pages < 50; pages += 1) {
    const page = await units.query(db, params);

    codes.push(...page.rows.map((row) => row.code));

    if (!page.nextCursor) return codes;

    params = units.parse(new URLSearchParams(units.href(params, { after: page.nextCursor }).slice(1)));
  }

  throw new Error("paging did not end");
}

describe("keyset paging", () => {
  it.each(["", "dir=desc", "sort=title", "sort=title&dir=desc", "sort=credit&dir=desc", "sort=created", "sort=created&dir=desc"])(
    "visits every row exactly once for ?%s",
    async (search) => {
      const codes = await walk(search);

      expect(codes).toHaveLength(41);
      expect(new Set(codes).size).toBe(41);
    },
  );

  it("returns rows in the requested order", async () => {
    const sort = new URLSearchParams("sort=title&dir=desc").get("sort");
    const all = await db.select().from(unit).orderBy(sql`title desc, code desc`);

    expect(sort).toBe("title");
    expect(await walk("sort=title&dir=desc")).toEqual(all.map((row) => row.code));
  });

  it("gives pages of the page size and no cursor on the last one", async () => {
    const first = await units.query(db, units.parse({}));

    expect(first.rows).toHaveLength(7);
    expect(first.nextCursor).not.toBeNull();

    const tiny = await units.query(db, units.parse({ faculty: "SCI" }));

    expect(tiny.rows).toHaveLength(1);
    expect(tiny.nextCursor).toBeNull();
  });

  it("ignores a cursor made for another order, or a forged one", async () => {
    const first = await units.query(db, units.parse({}));
    const stale = units.parse({ sort: "title", after: first.nextCursor ?? "" });
    const forged = units.parse({ after: "not-a-cursor" });

    expect((await units.query(db, stale)).rows[0]?.title).toBe("100%_real");
    expect((await units.query(db, forged)).rows[0]?.code).toBe("FIT1000");
  });
});

describe("filters", () => {
  it("combines filters from Next-style search params", async () => {
    const params = units.parse({ faculty: "IT", level: ["1", "2"], minCredit: "12", offered: "true", limit: "20" });
    const page = await units.query(db, params);

    expect(params.filters).toEqual({ faculty: "IT", level: [1, 2], minCredit: 12, offered: true });
    expect(page.rows.length).toBeGreaterThan(0);
    expect(page.rows.every((row) => row.faculty === "IT" && row.level < 3 && row.credit >= 12 && row.offered)).toBe(true);
  });

  it("drops invalid values instead of failing the page", () => {
    const params = units.parse({ level: "abc,2", minCredit: "lots", offered: "yes", sort: "password", dir: "sideways", limit: "9999" });

    expect(params).toEqual({ sort: "code", direction: "asc", after: null, limit: 20, filters: { level: [2] } });
  });

  it("matches text literally: % and _ are not wildcards", async () => {
    expect(escapeLike("100%_a\\")).toBe("100\\%\\_a\\\\");
    expect((await units.query(db, units.parse({ q: "100%_" }))).rows.map((row) => row.code)).toEqual(["MTH100%"]);
    expect((await units.query(db, units.parse({ q: "%" }))).rows.map((row) => row.code)).toEqual(["MTH100%"]);
  });

  it("counts matches and accepts an extra condition", async () => {
    const params = units.parse({ faculty: "IT" });

    expect(await units.count(db, params)).toBe(20);
    expect(await units.count(db, params, eq(unit.level, 1))).toBe(7);
    expect((await units.query(db, params, eq(unit.code, "FIT1002"))).rows).toHaveLength(1);
  });
});

describe("href", () => {
  it("leaves defaults out and returns to the first page when the order or a filter changes", () => {
    const params = units.parse({ faculty: "IT", after: "abc" });

    expect(units.href(units.parse({}))).toBe("");
    expect(units.href(params)).toBe("?faculty=IT&after=abc");
    expect(units.href(params, { sort: "title", direction: "desc" })).toBe("?faculty=IT&sort=title&dir=desc");
    expect(units.href(params, { filters: { level: [1, 2], faculty: undefined } })).toBe("?level=1%2C2");
  });
});

describe("defineList", () => {
  it("accepts a database created with a schema", async () => {
    const withSchema = drizzle(client, { schema: { unit } });

    expect((await units.query(withSchema, units.parse({ limit: "1" }))).rows).toHaveLength(1);
  });

  it("refuses nullable sort columns and reserved filter names", () => {
    expect(() => defineList({ table: unit, id: unit.code, sorts: { url: unit.handbookUrl }, defaultSort: "url" })).toThrowError(/NOT NULL/);
    expect(() =>
      defineList({ table: unit, id: unit.code, sorts: { code: unit.code }, defaultSort: "code", filters: { sort: filter.equals(unit.faculty) } }),
    ).toThrowError(/reserved/);
  });
});
