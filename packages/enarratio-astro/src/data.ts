/** A cell after parsing: a number, text, or `null` for an empty cell. */
export type Cell = number | string | null;

/** A table parsed from the block's data field. */
export interface Table {
  readonly columns: readonly string[];
  readonly rows: ReadonlyArray<Readonly<Record<string, Cell>>>;
}

/** Limits that keep one chart's render bounded, whatever an editor pastes. */
export const MAX_ROWS = 5000;
export const MAX_COLUMNS = 50;

const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;
const GROUPED_NUMBER = /^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/;

/** Reads a cell: numbers (including "1,234") become numbers, an empty cell `null`, the rest text. */
function cell(raw: string): Cell {
  const text = raw.trim();
  if (text === "") return null;
  if (NUMBER.test(text)) return Number(text);
  if (GROUPED_NUMBER.test(text)) return Number(text.replaceAll(",", ""));
  return text;
}

/**
 * The delimiter of pasted data: a tab when the header row has one (a spreadsheet paste),
 * otherwise whichever of comma and semicolon appears more often outside quotes in that row.
 */
function delimiter(text: string): string {
  const header = text.slice(0, text.search(/\r?\n|$/));
  if (header.includes("\t")) return "\t";
  const unquoted = header.replace(/"[^"]*"/g, "");
  const count = (c: string) => unquoted.split(c).length - 1;
  return count(";") > count(",") ? ";" : ",";
}

/** Splits delimited text into records, following RFC 4180 quoting ("" is a literal quote). */
function records(text: string, sep: string): string[][] {
  const out: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"' && field.trim() === "") {
      quoted = true;
      field = "";
    } else if (c === sep) {
      record.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      record.push(field);
      out.push(record);
      record = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (quoted) throw new Error("The data has a quote that is never closed.");
  record.push(field);
  out.push(record);
  return out.filter((r) => r.some((f) => f.trim() !== ""));
}

/**
 * Parses the data an editor pasted or typed: CSV, semicolon-separated or tab-separated text
 * whose first row names the columns. Throws an Error whose message an editor can act on.
 */
export function parseTable(text: string): Table {
  const all = records(text, delimiter(text));
  const [header, ...body] = all;
  if (!header || body.length === 0) {
    throw new Error("Add data: a first row naming the columns, then at least one row of values.");
  }
  const columns = header.map((name) => name.trim());
  if (columns.length > MAX_COLUMNS)
    throw new Error(`The data has more than ${MAX_COLUMNS} columns.`);
  if (body.length > MAX_ROWS) throw new Error(`The data has more than ${MAX_ROWS} rows.`);
  const seen = new Set<string>();
  for (const name of columns) {
    if (name === "") throw new Error("Every column in the first row needs a name.");
    const key = name.toLowerCase();
    if (seen.has(key)) throw new Error(`Two columns are named "${name}".`);
    seen.add(key);
  }
  const rows = body.map((record, n) => {
    if (record.slice(columns.length).some((f) => f.trim() !== "")) {
      throw new Error(`Row ${n + 2} has more values than there are columns.`);
    }
    // No prototype, so a column named "__proto__" is an ordinary field.
    const row: Record<string, Cell> = Object.create(null);
    columns.forEach((name, i) => {
      row[name] = cell(record[i] ?? "");
    });
    return row;
  });
  return { columns, rows };
}

/**
 * The column an editor named, matched without regard to case or surrounding space. Throws when
 * there is none, listing the columns there are.
 */
export function column(table: Table, name: string | undefined, role: string): string {
  const wanted = name?.trim().toLowerCase() ?? "";
  if (wanted === "") throw new Error(`Name the ${role} column.`);
  const found = table.columns.find((c) => c.toLowerCase() === wanted);
  if (!found) {
    throw new Error(
      `There is no column "${name?.trim()}" for the ${role}. The columns are: ${table.columns.join(", ")}.`,
    );
  }
  return found;
}

/** Reads one value from a row given as an object: dates as ISO text, true and false as text. */
function value(raw: unknown): Cell {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw === "string") return raw;
  if (raw instanceof Date) return raw.toISOString();
  if (typeof raw === "boolean") return String(raw);
  throw new Error(
    `A value in the data is ${Array.isArray(raw) ? "a list" : "an object"}; use numbers or text.`,
  );
}

/** Reads rows given as objects (from JSON or a content collection) into a table. */
export function tableFromRows(input: readonly Readonly<Record<string, unknown>>[]): Table {
  if (input.length === 0) throw new Error("Add data: at least one row.");
  if (input.length > MAX_ROWS) throw new Error(`The data has more than ${MAX_ROWS} rows.`);
  const columns: string[] = [];
  for (const row of input) {
    for (const key of Object.keys(row)) if (!columns.includes(key)) columns.push(key);
  }
  if (columns.length > MAX_COLUMNS)
    throw new Error(`The data has more than ${MAX_COLUMNS} columns.`);
  const rows = input.map((source) => {
    const row: Record<string, Cell> = Object.create(null);
    for (const name of columns) row[name] = value(source[name]);
    return row;
  });
  return { columns, rows };
}
