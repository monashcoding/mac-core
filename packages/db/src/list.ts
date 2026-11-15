import { and, asc, desc, eq, getTableColumns, gte, ilike, inArray, lte, or, type SQL, sql } from "drizzle-orm";
import type { AnyPgColumn, PgDatabase, PgQueryResultHKT, PgTable } from "drizzle-orm/pg-core";
import { z } from "zod";

/** A query string as the framework hands it over: `URLSearchParams`, or Next's `searchParams`. */
export type SearchInput = URLSearchParams | Readonly<Record<string, string | string[] | undefined>>;

export type SortDirection = "asc" | "desc";

type FilterScalar = string | number | boolean;

/** What a filter can hold: one value, or several for `oneOf`. */
export type FilterValue = FilterScalar | FilterScalar[];

/**
 * One filter of a list: how its values are read from the query string
 * and the SQL condition they become.
 */
export interface ListFilter<Value extends FilterValue> {
  /** The value from the raw query-string values, or `undefined` to leave the filter off. */
  parse(raw: readonly string[]): Value | undefined;
  where(value: Value): SQL | undefined;
  /** The query-string values that give `value` back. */
  format(value: Value): string[];
}

function single<Value extends FilterScalar>(schema: z.ZodType<Value>, where: (value: Value) => SQL | undefined): ListFilter<Value> {
  return {
    parse(raw) {
      const first = raw[0];

      if (first === undefined || first === "") return undefined;

      const parsed = schema.safeParse(first);

      return parsed.success ? parsed.data : undefined;
    },
    where,
    format: (value) => [String(value)],
  };
}

/** Escape `%`, `_` and `\` so user text matches literally inside LIKE. */
export function escapeLike(text: string): string {
  return text.replaceAll(/[\\%_]/g, (character) => `\\${character}`);
}

const text = z.string();
const number = z.coerce.number();

function equals(column: AnyPgColumn): ListFilter<string>;
function equals<Value extends FilterScalar>(column: AnyPgColumn, schema: z.ZodType<Value>): ListFilter<Value>;
function equals(column: AnyPgColumn, schema: z.ZodType<FilterScalar> = text): ListFilter<FilterScalar> {
  return single(schema, (value) => eq(column, value));
}

function oneOf(column: AnyPgColumn): ListFilter<string[]>;
function oneOf<Value extends FilterScalar>(column: AnyPgColumn, schema: z.ZodType<Value>): ListFilter<Value[]>;
function oneOf(column: AnyPgColumn, schema: z.ZodType<FilterScalar> = text): ListFilter<FilterScalar[]> {
  return {
    parse(raw) {
      const values: FilterScalar[] = [];

      for (const entry of raw.flatMap((value) => value.split(","))) {
        const parsed = entry === "" ? undefined : schema.safeParse(entry);

        if (parsed?.success) values.push(parsed.data);
      }

      return values.length > 0 ? values : undefined;
    },
    where: (values) => inArray(column, values),
    format: (values) => [values.map(String).join(",")],
  };
}

function atLeast(column: AnyPgColumn): ListFilter<number>;
function atLeast<Value extends FilterScalar>(column: AnyPgColumn, schema: z.ZodType<Value>): ListFilter<Value>;
function atLeast(column: AnyPgColumn, schema: z.ZodType<FilterScalar> = number): ListFilter<FilterScalar> {
  return single(schema, (value) => gte(column, value));
}

function atMost(column: AnyPgColumn): ListFilter<number>;
function atMost<Value extends FilterScalar>(column: AnyPgColumn, schema: z.ZodType<Value>): ListFilter<Value>;
function atMost(column: AnyPgColumn, schema: z.ZodType<FilterScalar> = number): ListFilter<FilterScalar> {
  return single(schema, (value) => lte(column, value));
}

/**
 * The filters a list can declare. Each one names its column, so a query
 * string can only ever reach the columns the list chose.
 */
export const filter = {
  /** `?faculty=IT` → `faculty = 'IT'` */
  equals,

  /** `?level=1&level=2` or `?level=1,2` → `level in (1, 2)` */
  oneOf,

  /** `?minCredit=6` → `credit_points >= 6` */
  atLeast,

  /** `?maxCredit=12` → `credit_points <= 12` */
  atMost,

  /** `?open=true` → `is_open = true`. Any other value leaves the filter off. */
  flag(column: AnyPgColumn): ListFilter<boolean> {
    return single(z.enum(["true", "false"]).transform((value) => value === "true"), (value) => eq(column, value));
  },

  /**
   * `?q=data` → `title ilike '%data%' or code ilike '%data%'`. Fast on a
   * large table only with a `pg_trgm` GIN index on each column.
   */
  contains(...columns: [AnyPgColumn, ...AnyPgColumn[]]): ListFilter<string> {
    return single(z.string().trim().min(1).max(200), (term) => {
      const pattern = `%${escapeLike(term)}%`;

      return or(...columns.map((column) => ilike(column, pattern)));
    });
  },

  /**
   * `?q=machine learning -intro` → a full-text match on a `tsvector`
   * column, using web-search syntax. Needs a GIN index on the column.
   */
  fullText(column: AnyPgColumn, language = "english"): ListFilter<string> {
    return single(
      z.string().trim().min(1).max(200),
      (term) => sql`${column} @@ websearch_to_tsquery(${language}::regconfig, ${term})`,
    );
  },

  /** Anything else: your own schema and condition. */
  custom<Value extends FilterScalar>(schema: z.ZodType<Value>, where: (value: Value) => SQL | undefined): ListFilter<Value> {
    return single(schema, where);
  },
};

/** Any filter, whatever its value type. */
interface AnyListFilter {
  parse(raw: readonly string[]): FilterValue | undefined;
  where(value: never): SQL | undefined;
  format(value: never): string[];
}

type FilterValues<Filters> = {
  readonly [Name in keyof Filters]?: Filters[Name] extends ListFilter<infer Value> ? Value : never;
};

export interface ListParams<Sort extends string, Filters> {
  readonly sort: Sort;
  readonly direction: SortDirection;
  /** The cursor of the previous page's last row, or null for the first page. */
  readonly after: string | null;
  readonly limit: number;
  readonly filters: FilterValues<Filters>;
}

export interface ListPage<Row> {
  readonly rows: Row[];
  /** Pass as `after` for the next page. Null on the last page. */
  readonly nextCursor: string | null;
}

export interface ListClauses {
  readonly where: SQL | undefined;
  readonly orderBy: SQL[];
  /** One more than the page size: the extra row says whether another page exists. */
  readonly limit: number;
}

export interface ListOptions<Table extends PgTable, Sort extends string, Filters> {
  readonly table: Table;
  /** A unique, non-null column. It breaks ties, so paging never skips or repeats a row. */
  readonly id: AnyPgColumn;
  /** The columns a list may be sorted by, keyed by their name in the URL. All must be NOT NULL. */
  readonly sorts: Readonly<Record<Sort, AnyPgColumn>>;
  readonly defaultSort: NoInfer<Sort>;
  readonly defaultDirection?: SortDirection;
  readonly filters?: Filters;
  readonly pageSize?: number;
  readonly maxPageSize?: number;
}

// The schema a database was created with does not matter here: only select() and $count() are used.
// oxlint-disable-next-line typescript/no-explicit-any
type ListDatabase = Pick<PgDatabase<PgQueryResultHKT, any, any>, "select" | "$count">;

export interface List<Table extends PgTable, Sort extends string, Filters> {
  /** Read `sort`, `dir`, `after`, `limit` and every filter from a query string. Invalid values are dropped. */
  parse(input: SearchInput): ListParams<Sort, Filters>;
  /** The WHERE, ORDER BY and LIMIT of a page, for a query you write yourself. */
  clauses(params: ListParams<Sort, Filters>, extraWhere?: SQL): ListClauses;
  /** Trim the extra row off a result and work out the next cursor. */
  page<Row extends Partial<Table["$inferSelect"]>>(rows: readonly Row[], params: ListParams<Sort, Filters>): ListPage<Row>;
  /** Run the page query and return whole rows. */
  query(db: ListDatabase, params: ListParams<Sort, Filters>, extraWhere?: SQL): Promise<ListPage<Table["$inferSelect"]>>;
  /** How many rows match the filters, ignoring paging. */
  count(db: ListDatabase, params: ListParams<Sort, Filters>, extraWhere?: SQL): Promise<number>;
  /** A query string for a link. Changing the sort or a filter goes back to the first page. */
  href(params: ListParams<Sort, Filters>, changes?: ListChanges<Sort, Filters>): string;
}

export interface ListChanges<Sort extends string, Filters> {
  readonly sort?: Sort;
  readonly direction?: SortDirection;
  readonly after?: string | null;
  readonly limit?: number;
  readonly filters?: { readonly [Name in keyof Filters]?: FilterValues<Filters>[Name] | undefined };
}

const RESERVED = new Set(["sort", "dir", "after", "limit"]);
const cursorScalar = z.union([z.string(), z.number(), z.boolean()]);
const cursorSchema = z.tuple([z.string(), z.enum(["asc", "desc"]), cursorScalar, cursorScalar]);
const rowScalar = z.union([z.string(), z.number(), z.boolean(), z.date().transform((date) => date.toISOString())]);

function readAll(input: SearchInput, name: string): string[] {
  if (input instanceof URLSearchParams) return input.getAll(name);

  const value = input[name];

  if (value === undefined) return [];

  return Array.isArray(value) ? value : [value];
}

function columnKey(table: PgTable, column: AnyPgColumn): string {
  const entry = Object.entries(getTableColumns(table)).find(([, candidate]) => candidate === column);

  if (!entry) throw new Error(`Column "${column.name}" is not a column of the list's table.`);

  return entry[0];
}

/** A cursor value back in the form the column's driver expects. Timestamps travel as ISO strings. */
function cursorParam(column: AnyPgColumn, value: string | number | boolean): SQL {
  const revived = column.dataType === "date" ? new Date(String(value)) : value;

  return sql`${sql.param(revived, column)}`;
}

/**
 * A list of rows that a URL can filter, sort and page through.
 *
 * Paging is by keyset: each page starts after the last row of the
 * previous one, using `(sort column, id) > (…)`. With an index on
 * `(sort column, id)` every page costs the same, however deep, and rows
 * inserted meanwhile never shift a page.
 */
export function defineList<Table extends PgTable, Sort extends string, Filters extends Readonly<Record<string, AnyListFilter>> = Record<never, never>>(
  options: ListOptions<Table, Sort, Filters>,
): List<Table, Sort, Filters> {
  const { table, id, sorts } = options;
  const pageSize = options.pageSize ?? 25;
  const maxPageSize = options.maxPageSize ?? 100;
  const defaultDirection = options.defaultDirection ?? "asc";
  // SAFETY: Object.keys of a Record<Sort, _> yields exactly the Sort keys the caller declared.
  const sortNames = Object.keys(sorts) as Sort[];
  // SAFETY: each declared filter is a ListFilter of its own value type; the registry erases it to read uniformly.
  const filters = Object.entries(options.filters ?? {}) as [keyof Filters & string, ListFilter<FilterValue>][];
  const idKey = columnKey(table, id);

  for (const name of sortNames) {
    if (!sorts[name].notNull) throw new Error(`Sort column "${sorts[name].name}" must be NOT NULL.`);

    columnKey(table, sorts[name]);
  }

  for (const [name] of filters) {
    if (RESERVED.has(name)) throw new Error(`"${name}" is reserved by the list and cannot be a filter name.`);
  }

  function isSort(name: string | undefined): name is Sort {
    return name !== undefined && Object.hasOwn(sorts, name);
  }

  function encodeCursor(row: Partial<Table["$inferSelect"]>, params: ListParams<Sort, Filters>): string {
    const values = new Map(Object.entries(row));
    const sortValue = rowScalar.parse(values.get(columnKey(table, sorts[params.sort])));
    const idValue = rowScalar.parse(values.get(idKey));

    return Buffer.from(JSON.stringify([params.sort, params.direction, sortValue, idValue])).toString("base64url");
  }

  function decodeCursor(params: ListParams<Sort, Filters>) {
    if (!params.after) return null;

    try {
      const [sort, direction, sortValue, idValue] = cursorSchema.parse(
        JSON.parse(Buffer.from(params.after, "base64url").toString("utf8")),
      );

      // A cursor only means something under the order it was made for.
      return sort === params.sort && direction === params.direction ? { sortValue, idValue } : null;
    } catch {
      return null;
    }
  }

  function afterCursor(params: ListParams<Sort, Filters>): SQL | undefined {
    const cursor = decodeCursor(params);

    if (!cursor) return undefined;

    const column = sorts[params.sort];
    const compare = params.direction === "asc" ? sql`>` : sql`<`;

    if (column === id) return sql`${id} ${compare} ${cursorParam(id, cursor.idValue)}`;

    return sql`(${column}, ${id}) ${compare} (${cursorParam(column, cursor.sortValue)}, ${cursorParam(id, cursor.idValue)})`;
  }

  function filterWhere(params: ListParams<Sort, Filters>, extraWhere: SQL | undefined): SQL | undefined {
    const conditions = filters.map(([name, definition]) => {
      const value = params.filters[name];

      return value === undefined ? undefined : definition.where(value);
    });

    return and(extraWhere, ...conditions);
  }

  function clauses(params: ListParams<Sort, Filters>, extraWhere?: SQL): ListClauses {
    const order = params.direction === "asc" ? asc : desc;
    const column = sorts[params.sort];

    return {
      where: and(filterWhere(params, extraWhere), afterCursor(params)),
      orderBy: column === id ? [order(id)] : [order(column), order(id)],
      limit: params.limit + 1,
    };
  }

  function page<Row extends Partial<Table["$inferSelect"]>>(rows: readonly Row[], params: ListParams<Sort, Filters>): ListPage<Row> {
    const kept = rows.slice(0, params.limit);
    const last = kept.at(-1);

    return {
      rows: kept,
      nextCursor: rows.length > params.limit && last ? encodeCursor(last, params) : null,
    };
  }

  return {
    parse(input) {
      const sortName = readAll(input, "sort")[0];
      const sort = isSort(sortName) ? sortName : options.defaultSort;
      const direction = z.enum(["asc", "desc"]).safeParse(readAll(input, "dir")[0]);
      const limit = z.coerce.number().int().min(1).safeParse(readAll(input, "limit")[0]);
      const values = new Map<string, FilterValue>();

      for (const [name, definition] of filters) {
        const value = definition.parse(readAll(input, name));

        if (value !== undefined) values.set(name, value);
      }

      return {
        sort,
        direction: direction.success ? direction.data : defaultDirection,
        after: readAll(input, "after")[0] || null,
        limit: limit.success ? Math.min(limit.data, maxPageSize) : pageSize,
        // SAFETY: every entry was produced by the filter of the same name, so it holds that filter's value type.
        filters: Object.fromEntries(values) as FilterValues<Filters>,
      };
    },

    clauses,
    page,

    async query(db, params, extraWhere) {
      const { where, orderBy, limit } = clauses(params, extraWhere);
      // SAFETY: PgTable is the base of every table; from() needs the concrete builder type, which the generic hides.
      const rows = await db.select().from(table as PgTable).where(where).orderBy(...orderBy).limit(limit);

      // SAFETY: a select() without a projection returns the table's full row type.
      return page(rows as Table["$inferSelect"][], params);
    },

    count(db, params, extraWhere) {
      return db.$count(table, filterWhere(params, extraWhere));
    },

    href(params, changes = {}) {
      const next = {
        sort: changes.sort ?? params.sort,
        direction: changes.direction ?? params.direction,
        limit: changes.limit ?? params.limit,
        filters: { ...params.filters, ...changes.filters },
      };

      const samePage = changes.sort === undefined && changes.direction === undefined && changes.filters === undefined;
      const after = changes.after === undefined ? (samePage ? params.after : null) : changes.after;
      const search = new URLSearchParams();

      for (const [name, definition] of filters) {
        // SAFETY: indexing the merged filter values by a declared filter name.
        const value = (next.filters as Readonly<Record<string, FilterValue | undefined>>)[name];

        if (value === undefined) continue;

        for (const text of definition.format(value)) search.append(name, text);
      }

      if (next.sort !== options.defaultSort) search.set("sort", next.sort);

      if (next.direction !== defaultDirection) search.set("dir", next.direction);

      if (next.limit !== pageSize) search.set("limit", String(next.limit));

      if (after) search.set("after", after);

      const text = search.toString();

      return text ? `?${text}` : "";
    },
  };
}
