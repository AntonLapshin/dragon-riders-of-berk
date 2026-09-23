/**
 * showcase — public library entry point.
 *
 * Re-exports the package's public surface so consumers can pull in either the
 * pure core engine (business logic, no React runtime) or the ready-to-use,
 * router-agnostic `Showcase` gallery component. This file is what the
 * `exports`/`types` fields in `package.json` point at for a future `npm
 * publish` (done manually by the owner).
 */

// Pure core engine (no React runtime dependency). All business logic.
export * from "./core/showcase";

// Thin view model binding the core engine to React state + window.history.
export { useShowcase } from "./ui/viewModels/useShowcase";
export type { UseShowcaseResult } from "./ui/viewModels/useShowcase";

// Thin, dumb gallery view.
export { Showcase } from "./ui/components/Showcase";

// Sample showcase files used by the demo gallery (also handy as copy-paste
// examples for consumers adding their own showcases).
export { demoShowcaseFiles } from "./ui/showcases";
export type { ShowcaseFile } from "./core/showcase";
