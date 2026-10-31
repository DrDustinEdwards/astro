import type { PortableTextBlockConfig } from "emdash";

/** The Portable Text `_type` of a chart block, and the key of its renderer. */
export const BLOCK_TYPE = "enarratioChart";

/** A saved Chart block: the editor form's values, every one optional until the chart is drawn. */
export interface ChartNode {
  readonly _type: string;
  readonly _key?: string;
  readonly chart?: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly alt?: string;
  readonly caption?: string;
  readonly notes?: string;
  readonly source?: string;
  readonly sourceHref?: string;
  readonly byline?: string;
  readonly data?: string;
  readonly x?: string;
  readonly y?: string;
  readonly series?: string;
  readonly value?: string;
  readonly xLabel?: string;
  readonly yLabel?: string;
  readonly xUnit?: string;
  readonly yUnit?: string;
  readonly layout?: string;
  readonly orientation?: string;
  readonly scale?: string;
  readonly regression?: boolean;
  readonly dataTable?: string;
  readonly interactive?: boolean;
}

/**
 * The chart block as the editor shows it: one form, whose `action_id`s become the saved block's
 * properties. Every field but the chart kind, description, data and x column is optional, and
 * the labels say which chart kinds read it.
 */
export const chartBlock: PortableTextBlockConfig = {
  type: BLOCK_TYPE,
  label: "Chart",
  description: "An accessible chart drawn from data you paste",
  category: "Media",
  fields: [
    {
      type: "select",
      action_id: "chart",
      label: "Chart",
      options: [
        { label: "Bar", value: "bar" },
        { label: "Line", value: "line" },
        { label: "Area (stacked)", value: "area" },
        { label: "Scatter", value: "scatter" },
        { label: "Heatmap", value: "heatmap" },
      ],
      initial_value: "bar",
    },
    { type: "text_input", action_id: "title", label: "Title" },
    {
      type: "text_input",
      action_id: "subtitle",
      label: "Subtitle: how to read the chart (optional)",
    },
    {
      type: "text_input",
      action_id: "alt",
      label: "Description (required)",
      placeholder: "What the chart shows and what it finds, in a sentence. Screen readers read it.",
      multiline: true,
    },
    {
      type: "text_input",
      action_id: "data",
      label: "Data",
      placeholder:
        "Paste from a spreadsheet or type CSV. The first row names the columns.\nyear,type,count\n2024,Talks,3",
      multiline: true,
    },
    { type: "text_input", action_id: "x", label: "Column along the x axis" },
    {
      type: "text_input",
      action_id: "y",
      label: "Column of values (y)",
      placeholder: "Bar charts count rows when this is blank. Heatmaps: the row column.",
    },
    {
      type: "text_input",
      action_id: "series",
      label: "Column that splits rows into series (optional)",
    },
    { type: "text_input", action_id: "value", label: "Heatmap: column of cell values" },
    { type: "text_input", action_id: "xLabel", label: "x axis label (optional)" },
    { type: "text_input", action_id: "yLabel", label: "y axis label (optional)" },
    { type: "text_input", action_id: "xUnit", label: "x axis unit, such as kg (optional)" },
    { type: "text_input", action_id: "yUnit", label: "y axis unit (optional)" },
    {
      type: "text_input",
      action_id: "caption",
      label: "Caption: method or caveats (optional)",
    },
    { type: "text_input", action_id: "notes", label: "Notes: what a measure means (optional)" },
    { type: "text_input", action_id: "source", label: "Source of the data (optional)" },
    { type: "text_input", action_id: "sourceHref", label: "Link to the source, https (optional)" },
    { type: "text_input", action_id: "byline", label: "Made by (optional)" },
    {
      type: "select",
      action_id: "layout",
      label: "Bar: several series",
      options: [
        { label: "Stacked", value: "stacked" },
        { label: "Side by side", value: "grouped" },
      ],
      initial_value: "stacked",
    },
    {
      type: "select",
      action_id: "orientation",
      label: "Bar: direction",
      options: [
        { label: "Vertical", value: "vertical" },
        { label: "Horizontal", value: "horizontal" },
      ],
      initial_value: "vertical",
    },
    {
      type: "select",
      action_id: "scale",
      label: "Line and scatter: y scale",
      options: [
        { label: "Linear", value: "linear" },
        { label: "Logarithmic", value: "log" },
      ],
      initial_value: "linear",
    },
    { type: "toggle", action_id: "regression", label: "Scatter: regression line with 95% band" },
    {
      type: "select",
      action_id: "dataTable",
      label: "Data table",
      options: [
        { label: "Behind a Data table toggle", value: "details" },
        { label: "Hidden, for screen readers only", value: "visually-hidden" },
      ],
      initial_value: "details",
    },
    {
      type: "toggle",
      action_id: "interactive",
      label: "Interactive: hover details, keyboard navigation and filtering (adds a small script)",
    },
  ],
};
