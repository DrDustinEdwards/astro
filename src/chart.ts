import { areaChart, barChart, lineChart } from "enarratio/lite";
import { CHART_KINDS, type ChartKind } from "./block.js";
import { type Cell, column, parseTable, type Table } from "./data.js";

/** A saved chart block: the editor form's values, every one optional until checked here. */
export interface ChartNode {
  readonly _type: string;
  readonly _key?: string;
  readonly chart?: string;
  readonly title?: string;
  readonly alt?: string;
  readonly caption?: string;
  readonly data?: string;
  readonly x?: string;
  readonly y?: string;
  readonly series?: string;
  readonly value?: string;
  readonly xLabel?: string;
  readonly yLabel?: string;
  readonly layout?: string;
  readonly orientation?: string;
  readonly scale?: string;
  readonly regression?: boolean;
  readonly dataTable?: string;
  readonly interactive?: boolean;
}

/** A drawn chart's HTML, or why it could not be drawn, in words an editor can act on. */
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

/** The options every chart kind shares: text, the data table and a stable id. */
function figure(node: ChartNode) {
  const alt = text(node.alt);
  if (!alt) throw new Error("Add a description: one sentence on what the chart shows.");
  const title = text(node.title);
  const caption = text(node.caption);
  const xLabel = text(node.xLabel);
  const yLabel = text(node.yLabel);
  const key = node._key?.replace(/[^A-Za-z0-9_-]/g, "");
  return {
    alt,
    ...(title ? { title } : {}),
    ...(caption ? { caption } : {}),
    ...(xLabel ? { xLabel } : {}),
    ...(yLabel ? { yLabel } : {}),
    ...(key ? { id: `chart-${key}` } : {}),
    dataTable:
      node.dataTable === "visually-hidden" ? ("visually-hidden" as const) : ("details" as const),
  };
}

async function draw(node: ChartNode): Promise<string> {
  const kind: ChartKind = CHART_KINDS.includes(node.chart as ChartKind)
    ? (node.chart as ChartKind)
    : "bar";
  const common = figure(node);
  const table = parseTable(node.data ?? "");
  const x = column(table, node.x, "x axis");
  const seriesName = text(node.series) ? column(table, node.series, "series") : undefined;
  const data = seriesName ? asNames(table, seriesName) : [...table.rows];
  const series = seriesName ? { series: seriesName } : {};
  const log = node.scale === "log" ? ({ yType: "log" } as const) : {};

  // Enarratio types its field options by the row type; parsed rows are only known at run time,
  // so the options are checked here and passed on as plain objects.
  // biome-ignore lint/suspicious/noExplicitAny: see above
  type Loose = any;

  switch (kind) {
    case "bar": {
      const y = text(node.y) ? column(table, node.y, "values") : undefined;
      if (y) numeric(table, y);
      return barChart<Loose>({
        ...common,
        data,
        x,
        ...(y ? { y } : {}),
        ...series,
        layout: node.layout === "grouped" ? "grouped" : "stacked",
        orientation: node.orientation === "horizontal" ? "horizontal" : "vertical",
      });
    }
    case "line":
    case "area": {
      const y = column(table, node.y, "values");
      numeric(table, y);
      const options = { ...common, data, x, y, ...series };
      return kind === "line" ? lineChart<Loose>({ ...options, ...log }) : areaChart<Loose>(options);
    }
    case "scatter": {
      const y = column(table, node.y, "values");
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
        regression: node.regression === true,
      });
    }
    case "heatmap": {
      const y = column(table, node.y, "rows");
      const value = column(table, node.value, "cell values");
      numeric(table, value);
      const { heatmap } = await import("enarratio/plot");
      return heatmap<Loose>({ ...common, data, x, y, value });
    }
  }
}

/**
 * Draws a chart block. Bar, line and area charts come from `enarratio/lite`, which builds the SVG
 * as a string with no DOM, the cheapest render on a Worker; scatter plots and heatmaps load
 * `enarratio/plot` (Observable Plot and linkedom) only when a page has one. Never throws: a chart
 * that cannot be drawn returns the reason instead, so one bad block cannot break a page.
 */
export async function renderChart(node: ChartNode): Promise<ChartResult> {
  try {
    return { ok: true, html: await draw(node) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
