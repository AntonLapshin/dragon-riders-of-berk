import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyUrlPath,
  createShowcaseRegistry,
  createShowcaseState,
  encodeUrlPath,
  select as selectCore,
  toggleExpand as toggleExpandCore,
  type ShowcaseFile,
  type ShowcaseRegistry,
  type ShowcaseState,
} from "../../core/showcase";

/**
 * Read the current `file` / `showcase` query params from `window.location`.
 * Missing, empty, or unknown values are handled by the core `applyUrlPath`
 * fallback when this is applied to state.
 */
function readUrlParams(): Record<string, string | undefined> {
  const search = new URLSearchParams(window.location.search);
  const file = search.get("file") ?? undefined;
  const showcase = search.get("showcase") ?? undefined;
  return { file, showcase };
}

/**
 * Reflect a selection in the address bar (`?file=..&showcase=..`) via
 * `window.history.pushState`. An empty selection clears both params. Pushing a
 * new history entry (rather than replacing) lets back/forward step through
 * selections, which the `popstate` listener below restores.
 */
function writeUrlParams(selection: { file: string | null; showcase: string | null }): void {
  const encoded = encodeUrlPath(selection);
  const url = new URL(window.location.href);
  url.searchParams.delete("file");
  url.searchParams.delete("showcase");
  if (encoded) {
    for (const [key, value] of new URLSearchParams(encoded)) {
      url.searchParams.set(key, value);
    }
  }
  window.history.pushState({}, "", `${url.pathname}${url.search}`);
}

export interface UseShowcaseResult {
  /** The validated showcase registry (from core). */
  registry: ShowcaseRegistry;
  /** Current selection + expand state (from core). */
  state: ShowcaseState;
  /** The variant component matching the current selection, or undefined. */
  selectedComponent: ReturnType<ShowcaseRegistry["variant"]>;
  /** Select a file + variant; reflected in the URL. */
  select: (file: string, showcase: string) => void;
  /** Collapse/expand a sidebar file group. */
  toggleExpand: (name: string) => void;
}

/**
 * Thin view model for the showcase gallery.
 *
 * Contains no business logic — it just binds the core engine's pure functions
 * (registry, selection, expand/collapse, URL (de)serialization) to the
 * component tree and keeps selection in sync with `window.history` /
 * `popstate` so showcases are deep-linkable and back/forward step through
 * selections. All decisions stay in `src/core`.
 */
export function useShowcase(files: readonly ShowcaseFile[]): UseShowcaseResult {
  const registry = useMemo(() => createShowcaseRegistry(files), [files]);

  // Apply the URL once on first load so deep links restore the selection,
  // with core's fallback when a referenced file/showcase doesn't exist.
  const [state, setState] = useState<ShowcaseState>(() =>
    applyUrlPath(createShowcaseState(), registry, readUrlParams()),
  );

  const select = useCallback(
    (file: string, showcase: string) => {
      const next = selectCore(state, registry, file, showcase);
      setState(next);
      writeUrlParams(next.selection);
    },
    [state, registry],
  );

  const toggleExpand = useCallback((name: string) => {
    setState((cur) => toggleExpandCore(cur, name));
  }, []);

  // Back/forward navigation: re-read the URL and apply it to current state.
  useEffect(() => {
    const onPopState = () =>
      setState((cur) => applyUrlPath(cur, registry, readUrlParams()));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [registry]);

  const selectedComponent = registry.variant(
    state.selection.file,
    state.selection.showcase,
  );

  return { registry, state, selectedComponent, select, toggleExpand };
}
