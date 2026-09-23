/**
 * Core showcase engine (plan.md §19.1).
 *
 * The pure, router-agnostic business logic that powers the Storybook-like
 * showcase gallery. It owns the data model (showcase files + named variant
 * components), the validated registry, and the selection / expand-collapse /
 * URL state transitions. It has no React runtime and no DOM dependency: the
 * variant components are treated as opaque values so the UI layer decides how
 * to render them.
 */

import type { ComponentType } from "react";

/**
 * An opaque variant component. Kept as a type-only React import so core stays
 * free of any React *runtime* dependency while still modelling the showcase
 * gallery's UI payload.
 */
export type ShowcaseComponent = ComponentType<unknown>;

/**
 * A single showcase "file": a display name plus a map of named variant
 * components. E.g. `{ name: "Button", showcases: { Primary, Secondary } }`.
 */
export interface ShowcaseFile {
  /** Unique display name used for sidebar grouping and URL deep-linking. */
  name: string;
  /** Named variant components, keyed by variant name. */
  showcases: Record<string, ShowcaseComponent>;
}

/**
 * Which file / variant the user has currently selected. A selection is only
 * meaningful when *both* `file` and `showcase` are non-null; a partial or
 * unknown reference falls back to no selection (`null` / `null`).
 */
export interface ShowcaseSelection {
  /** Selected file name, or null when nothing is selected. */
  file: string | null;
  /** Selected variant name within `file`, or null when unselected. */
  showcase: string | null;
}

/**
 * Full showcase state: the active selection plus which sidebar file group is
 * expanded (single group, `null` when all are collapsed).
 */
export interface ShowcaseState {
  readonly selection: ShowcaseSelection;
  /** Name of the expanded file group, or null when all are collapsed. */
  readonly expanded: string | null;
}

/**
 * A registry of showcase files, validated up-front and pre-indexed for fast,
 * type-safe lookup during state transitions.
 */
export interface ShowcaseRegistry {
  /** All registered files, in display order. */
  readonly files: readonly ShowcaseFile[];
  /** Look up a file by name (immutable snapshot), or undefined. */
  fileByName(name: string | null | undefined): ShowcaseFile | undefined;
  /**
   * Look up a variant component by file + variant name, or undefined when
   * either reference is missing / unknown.
   */
  variant(
    file: string | null | undefined,
    showcase: string | null | undefined,
  ): ShowcaseComponent | undefined;
}

/** The initial selection: nothing selected. */
export const EMPTY_SELECTION: ShowcaseSelection = Object.freeze({
  file: null,
  showcase: null,
});

/**
 * Validate a candidate showcase file. Throws `ShowcaseRegistryError` when the
 * file is malformed (missing/blank name or no variants). The registry builder
 * uses this to reject bad input up front.
 */
export function validateShowcaseFile(file: ShowcaseFile): void {
  if (typeof file.name !== "string" || file.name.trim() === "") {
    throw new ShowcaseRegistryError("Showcase file must have a non-empty name");
  }
  const variantNames = Object.keys(file.showcases ?? {});
  if (variantNames.length === 0) {
    throw new ShowcaseRegistryError(
      `Showcase file "${file.name}" must have at least one variant`,
    );
  }
  for (const name of variantNames) {
    if (typeof file.showcases[name] !== "function") {
      throw new ShowcaseRegistryError(
        `Showcase file "${file.name}" variant "${name}" must be a component`,
      );
    }
  }
}

/**
 * Compile a list of showcase files into a validated, pre-indexed registry.
 *
 * Throws `ShowcaseRegistryError` on:
 * - a blank file name or a file with no variants;
 * - duplicate file names (the sidebar and URL deep-linking rely on uniqueness);
 * - a variant that isn't a component.
 */
export function createShowcaseRegistry(
  files: readonly ShowcaseFile[],
): ShowcaseRegistry {
  const seen = new Set<string>();
  for (const file of files) {
    validateShowcaseFile(file);
    const name = file.name;
    if (seen.has(name)) {
      throw new ShowcaseRegistryError(`Duplicate showcase file name: "${name}"`);
    }
    seen.add(name);
  }
  const byName = new Map(files.map((file) => [file.name, file]));
  return {
    files,
    fileByName(name) {
      if (name == null) return undefined;
      return byName.get(name);
    },
    variant(file, showcase) {
      const known = byName.get(file ?? "");
      if (!known || showcase == null) return undefined;
      return known.showcases[showcase];
    },
  };
}

/**
 * Create the starting showcase state: no selection, nothing expanded.
 */
export function createShowcaseState(): ShowcaseState {
  return { selection: { ...EMPTY_SELECTION }, expanded: null };
}

/**
 * Pure state transition — select a file + variant.
 *
 * Validates the reference against the registry:
 * - unknown file → selection is cleared (fallback to none);
 * - known file but unknown/missing variant → the file is selected with no
 *   variant (there is nothing valid to render).
 *
 * Returns a new state; never mutates the input.
 */
export function select(
  state: ShowcaseState,
  registry: ShowcaseRegistry,
  file: string,
  showcase: string | null,
): ShowcaseState {
  const known = registry.fileByName(file);
  if (!known) {
    return { ...state, selection: { ...EMPTY_SELECTION } };
  }
  const validVariant =
    showcase != null && known.showcases[showcase] !== undefined;
  return {
    ...state,
    selection: { file, showcase: validVariant ? showcase : null },
  };
}

/**
 * Pure state transition — collapse/expand a sidebar file group. Only one group
 * is expanded at a time; toggling an already-expanded group collapses it.
 */
export function toggleExpand(state: ShowcaseState, name: string): ShowcaseState {
  return { ...state, expanded: state.expanded === name ? null : name };
}

/**
 * Decode raw `file` / `showcase` query-string values into a selection.
 *
 * No registry lookup happens here — this is a lossless, round-trip-safe
 * (de)serializer. Missing, empty, or whitespace-only values decode to an empty
 * selection. `applyUrlPath` is responsible for validating unknown references
 * against the registry.
 */
export function decodeUrlPath(
  params: Readonly<Record<string, string | undefined>>,
): ShowcaseSelection {
  const file = params["file"];
  const showcase = params["showcase"];
  if (
    file == null ||
    file.trim() === "" ||
    showcase == null ||
    showcase.trim() === ""
  ) {
    return { ...EMPTY_SELECTION };
  }
  return { file, showcase };
}

/**
 * Encode a selection into a `?file=..&showcase=..` query string (without the
 * leading `?`). An empty selection (or a selection missing a file or showcase)
 * produces an empty string. Values are percent-encoded so names with spaces or
 * special characters round-trip safely.
 */
export function encodeUrlPath(selection: ShowcaseSelection): string {
  if (selection.file == null || selection.showcase == null) {
    return "";
  }
  return `file=${encodeURIComponent(selection.file)}&showcase=${encodeURIComponent(
    selection.showcase,
  )}`;
}

/**
 * Pure state transition — apply decoded `file` / `showcase` URL params to the
 * state, with fallback when a referenced file/showcase doesn't exist.
 *
 * Unknown references fall back to no selection; the previously selected file
 * group stays expanded, and a newly selected file's group is expanded so the
 * deep-linked selection is visible even on a fresh load. Returns a new state.
 */
export function applyUrlPath(
  state: ShowcaseState,
  registry: ShowcaseRegistry,
  params: Readonly<Record<string, string | undefined>>,
): ShowcaseState {
  const selection = decodeUrlPath(params);
  const known = registry.fileByName(selection.file);
  const valid = known && selection.showcase != null
    ? known.showcases[selection.showcase] !== undefined
    : false;
  const nextSelection: ShowcaseSelection = valid
    ? selection
    : { ...EMPTY_SELECTION };
  const expanded =
    nextSelection.file != null ? nextSelection.file : state.expanded;
  return { ...state, selection: nextSelection, expanded };
}

/** Error thrown when a showcase registry is invalid. */
export class ShowcaseRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShowcaseRegistryError";
  }
}
