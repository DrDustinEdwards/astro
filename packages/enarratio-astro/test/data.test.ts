import { describe, expect, it } from "vitest";
import { parseTable } from "../src/data.ts";

// The parser is the one piece of tricky logic: editors paste from spreadsheets and type CSV by hand.
describe("parseTable", () => {
  it("reads quoted CSV, grouped numbers and empty cells", () => {
    const { columns, rows } = parseTable('name,count\n"Smith, J.",1\n"He said ""hi""",\n');
    expect(columns).toEqual(["name", "count"]);
    expect(rows[0]).toEqual({ name: "Smith, J.", count: 1 });
    // "1,234" unquoted in a comma file is two fields, so this row has an extra value; quoted it is one.
    expect(() => parseTable("name,count\nA,1,234\n")).toThrow(/more values/);
    expect(parseTable('n,c\nA,"1,234"').rows[0]?.["c"]).toBe(1234);
    expect(rows[1]?.["name"]).toBe('He said "hi"');
    expect(rows[1]?.["count"]).toBeNull();
  });

  it("reads a spreadsheet paste (tabs) and semicolon files, and ignores a trailing delimiter", () => {
    expect(parseTable("year\tvalue\r\n2024\t3.5\r\n").rows).toEqual([{ year: 2024, value: 3.5 }]);
    expect(parseTable("a;b\n1;x;\n").rows).toEqual([{ a: 1, b: "x" }]);
  });

  it("keeps a column named __proto__ as data", () => {
    const row = parseTable("__proto__,y\nx,1").rows[0];
    expect(Object.getPrototypeOf(row)).toBeNull();
    expect(Object.entries(row ?? {})).toContainEqual(["__proto__", "x"]);
  });

  it("explains data it cannot read", () => {
    expect(() => parseTable("only a header")).toThrow(/at least one row/);
    expect(() => parseTable('a,b\n"open,1')).toThrow(/never closed/);
    expect(() => parseTable("a,A\n1,2")).toThrow(/Two columns/);
  });
});
