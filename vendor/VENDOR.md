# Vendored `showcase` library

The component gallery on the Showcase page is built on
[`AntonLapshin/showcase`](https://github.com/AntonLapshin/showcase) —
a lightweight, Storybook-like gallery (registry of showcase files +
`useShowcase` view model with URL deep-linking).

## Why vendored?

The library is not published to npm (the `showcase` name on the public
registry is an unrelated legacy package), and installing it straight from
git ships only its `dist/` build output — which isn't committed — so a git
dependency resolves to an unusable stub. Until the owner publishes it,
the library source is vendored here and aliased as `showcase` in
`vite.config.ts` + `tsconfig.app.json`.

## Contents

- `showcase-src/` — verbatim copy of the library's `src/` (`core/`,
  `ui/`, `styles/`, `index.ts`)
- `showcase.package.json`, `showcase.README.md`, `showcase.CHANGELOG.md` —
  reference copies from the upstream repo (not used by the build)

## Upstream

- Repo: https://github.com/AntonLapshin/showcase
- Vendored from commit `aff00a047f7700af6930e97a10afc5ba43c64594`
- To refresh: `git clone --depth 1 https://github.com/AntonLapshin/showcase /tmp/s`
  then copy `/tmp/s/src` over `showcase-src/` and update the commit hash above.
