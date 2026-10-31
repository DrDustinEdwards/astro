import { areaChart, barChart, lineChart } from "enarratio/lite";
import { type Cell, column, parseTable, type Table, tableFromRows } from "./data.js";

/** The chart types a {@link ChartSpec} can draw. */
export const CHART_TYPES = ["bar", "line", "area", "scatter", "heatmap"] as const;
export type ChartType = (typeof CHART_TYPES)[number];

/**
 * One chart, as an author writes it: in a component's props, a Markdown `chart` block, or an
 * EmDash Chart block. Every field is checked when the chart is drawn, so a spec can come from
 * content as easily as from code.
 */
export interface ChartSpec {
  /** Bar (default), line, area (stacked), scatter or heatmap. */
  readonly type?: string | undefined;
  /**
   * The data: CSV, semicolon- or tab-separated text whose first row names the columns, or rows
   * as objects (from JSON or a content collection) whose values are numbers, text, dates or empty.
   */
  readonly data: string | readonly Readonly<Record<string, unknown>>[];
  /** Required: what the chart shows and finds, in a sentence. Names the chart for screen readers. */
  readonly alt?: string | undefined;
  readonly title?: string | undefined;
  /** A line under the title saying what the chart shows or how to read it. */
  readonly subtitle?: string | undefined;
  /** Method or caveats, below the chart. */
  readonly caption?: string | undefined;
  /** Notes under the chart: what a measure means, what was left out. */
  readonly notes?: string | undefined;
  /** Where the data come from, in the source line beside the CSV download. */
  readonly source?: string | undefined;
  /** A link for the source (https). */
  readonly sourceHref?: string | undefined;
  /** Who made the chart, in the source line. */
  readonly byline?: string | undefined;
  /** The column along the x axis. Column names match without regard to case. */
  readonly x?: string | undefined;
  /** The value column. Bar charts count rows without one; for a heatmap, the row column. */
  readonly y?: string | undefined;
  /** A column that splits rows into series. */
  readonly series?: string | undefined;
  /** Heatmap: the cell value column. */
  readonly value?: string | undefined;
  readonly xLabel?: string | undefined;
  readonly yLabel?: string | undefined;
  /** Units added to the axis labels and table headers: "Weight (kg)". */
  readonly xUnit?: string | undefined;
  readonly yUnit?: string | undefined;
  /** Bar: series stacked (default) or side by side ("grouped"). */
  readonly layout?: string | undefined;
  /** Bar: "vertical" (default) or "horizontal". */
  readonly orientation?: string | undefined;
  /** Line and scatter: "linear" (default) or "log" y axis. */
  readonly scale?: string | undefined;
  /** Scatter: a least-squares line with its 95% band. */
  readonly regression?: boolean | undefined;
  /** "details" (default): the data table behind a toggle; "visually-hidden": for screen readers only. */
  readonly dataTable?: string | undefined;
  /** The figure's id, reported as `chartId` in the enhancement layer's events. */
  readonly id?: string | undefined;
}

/** A drawn chart's HTML, or why it could not be drawn, in words an author can act on. */
export type ChartResult =
  | { readonly ok: true; readonly html: string }
  | { readonly ok: false; readonly error: string };

type Row = Readonly<Record<string, Cell>>;

function text(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Copies the rows with one column's numbers turned into text, for fields Enarratio reads as names. */
function asNames(table: Table, name: string): Row[] {
  return table.rows.map((row) => {
    const copy: Record<string, Cell> = Object.assign(Object.create(null), row);
    const v = copy[name];
    if (typeof v === "number") copy[name] = String(v);
    return copy;
  });
}

/** Checks that a column holds only numbers and empty cells. */
function numeric(table: Table, name: string): void {
  const bad = table.rows.find((row) => typeof row[name] === "string");
  if (bad) throw new Error(`The column "${name}" should hold numbers, but has "${bad[name]}".`);
}

/** The options every chart type shares: text, the data table and the id. */
function figure(spec: ChartSpec) {
  const alt = text(spec.alt);
  if (!alt) throw new Error("Add a description (alt): one sentence on what the chart shows.");
  const title = text(spec.title);
  const source = text(spec.source);
  const sourceHref = text(spec.sourceHref);
  if (sourceHref && !source)
    throw new Error("Name the source (source) that the link (sourceHref) goes to.");
  const id = text(spec.id)?.replace(/[^A-Za-z0-9_-]/g, "");
  const optional = Object.fromEntries(
    (["subtitle", "caption", "notes", "byline", "xLabel", "yLabel", "xUnit", "yUnit"] as const)
      .map((key) => [key, text(spec[key])])
      .filter(([, value]) => value !== undefined),
  );
  return {
    alt,
    ...(title ? { title } : {}),
    ...optional,
    ...(source ? { source: sourceHref ? { name: source, href: sourceHref } : source } : {}),
    ...(id ? { id } : {}),
    dataTable:
      spec.dataTable === "visually-hidden" ? ("visually-hidden" as const) : ("details" as const),
  };
}

async function draw(spec: ChartSpec): Promise<string> {
  const type = (text(spec.type) ?? "bar").toLowerCase();
  if (!CHART_TYPES.includes(type as ChartType)) {
    throw new Error(
      `There is no chart type "${spec.type}". Use one of: ${CHART_TYPES.join(", ")}.`,
    );
  }
  const common = figure(spec);
  const table = typeof spec.data === "string" ? parseTable(spec.data) : tableFromRows(spec.data);
  const x = column(table, spec.x, "x axis");
  const seriesName = text(spec.series) ? column(table, spec.series, "series") : undefined;
  const data = seriesName ? asNames(table, seriesName) : [...table.rows];
  const series = seriesName ? { series: seriesName } : {};
  const log = spec.scale === "log" ? ({ yType: "log" } as const) : {};

  // Enarratio types its field options by the row type; parsed rows are only known at run time,
  // so the options are checked here and passed on as plain objects.
  // biome-ignore lint/suspicious/noExplicitAny: see above
  type Loose = any;

  switch (type as ChartType) {
    case "bar": {
      const y = text(spec.y) ? column(table, spec.y, "values") : undefined;
      if (y) numeric(table, y);
      return barChart<Loose>({
        ...common,
        data,
        x,
        ...(y ? { y } : {}),
        ...series,
        layout: spec.layout === "grouped" ? "grouped" : "stacked",
        orientation: spec.orientation === "horizontal" ? "horizontal" : "vertical",
      });
    }
    case "line":
    case "area": {
      const y = column(table, spec.y, "values");
      numeric(table, y);
      const options = { ...common, data, x, y, ...series };
      return type === "line" ? lineChart<Loose>({ ...options, ...log }) : areaChart<Loose>(options);
    }
    case "scatter": {
      const y = column(table, spec.y, "values");
      numeric(table, x);
      numeric(table, y);
      const { scatterPlot } = await import("enarratio/plot");
      return scatterPlot<Loose>({
        ...common,
        data,
        x,
        y,
        ...series,
        ...log,
        regression: spec.regression === true,
      });
    }
    case "heatmap": {
      const y = column(table, spec.y, "rows");
      const value = column(table, spec.value, "cell values");
      numeric(table, value);
      const { heatmap } = await import("enarratio/plot");
      return heatmap<Loose>({ ...common, data, x, y, value });
    }
  }
}

/**
 * Draws a chart. Bar, line and area charts come from `enarratio/lite`, which builds the SVG as a
 * string with no DOM, the cheapest render on a Worker; scatter plots and heatmaps load
 * `enarratio/plot` (Observable Plot and linkedom) only when a page has one. Never throws: a chart
 * that cannot be drawn returns the reason instead, so one mistake cannot break a page.
 */
export async function renderChart(spec: ChartSpec): Promise<ChartResult> {
  try {
    return { ok: true, html: await draw(spec) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
