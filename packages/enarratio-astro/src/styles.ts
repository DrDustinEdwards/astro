import { baseStylesheet, type StylesheetOptions, stylesheet, type Theme } from "enarratio";
import { defaultTheme } from "enarratio/themes";

/**
 * What a page's charts are styled with:
 * - `"theme"` (default): an Enarratio theme's colors and rules, light and dark.
 * - `"base"`: the rules without colors or fonts, for a site whose own tokens define the
 *   `--enarratio-*` properties (Capsomer's tokens do).
 * - `"none"`: nothing; the site includes Enarratio's stylesheet itself.
 */
export type Styles = "theme" | "base" | "none";

/** How charts are styled: the {@link Styles} choice, and for `"theme"` which theme and how. */
export interface StyleOptions {
  readonly styles?: Styles | undefined;
  /** The Enarratio theme. Default: Enarratio's default theme. */
  readonly theme?: Theme | undefined;
  /** Passed to Enarratio's `stylesheet()`, e.g. `{ colorScheme: { dark: '[data-theme="dark"]' } }`. */
  readonly stylesheetOptions?: StylesheetOptions | undefined;
}

/** The note that replaces a chart that cannot be drawn, set apart from the text around it. */
const NOTE =
  ".enarratio-chart-error{border-inline-start:3px solid currentColor;padding-inline-start:.75em;font-size:.875em}";

/** The CSS written once per page (or Markdown document) with a chart; empty for `"none"`. */
export function chartStyles(options: StyleOptions = {}): string {
  switch (options.styles ?? "theme") {
    case "none":
      return "";
    case "base":
      return `${baseStylesheet()}\n${NOTE}`;
    default:
      return `${stylesheet(options.theme ?? defaultTheme, options.stylesheetOptions)}\n${NOTE}`;
  }
}
