/**
 * Demo showcase registry — the set of sample showcase files presented in the
 * gallery. Each entry is assembled from a `name` constant and its variant
 * components, then handed to the core `createShowcaseRegistry` via the
 * `useShowcase` view model. No business logic lives here.
 */

import type { ShowcaseFile } from "../../core/showcase";
import * as Badge from "./Badge";
import * as Button from "./Button";
import * as Spinner from "./Spinner";

/** The showcase files rendered by the demo gallery. */
export const demoShowcaseFiles: readonly ShowcaseFile[] = [
  {
    name: Button.name,
    showcases: {
      Primary: Button.Primary,
      Secondary: Button.Secondary,
      Disabled: Button.Disabled,
    },
  },
  {
    name: Spinner.name,
    showcases: {
      Small: Spinner.Small,
      Default: Spinner.Default,
      Large: Spinner.Large,
    },
  },
  {
    name: Badge.name,
    showcases: {
      Neutral: Badge.Neutral,
      Success: Badge.Success,
      Warning: Badge.Warning,
      Accent: Badge.Accent,
    },
  },
];
