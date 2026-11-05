# Vendored xterm

`xterm.bundle.js` is a self-contained IIFE built from:

- `@xterm/xterm@6.0.0` (MIT)
- `@xterm/addon-fit@0.11.0` (MIT)

It exposes `globalThis.__DSH_UI_TOOLKIT_XTERM__ = { Terminal, FitAddon, css }`.
`scripts/build-client.mjs` wraps it into `lib/client.terminal.js`, the package-local
chunk that the terminal feature loads with `require.async("./client.terminal.js")`.

Rebuild:

```sh
npm install --no-save @xterm/xterm@6.0.0 @xterm/addon-fit@0.11.0 esbuild@0.25.10
cat > entry.js <<'JS'
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import css from "@xterm/xterm/css/xterm.css"
globalThis.__DSH_UI_TOOLKIT_XTERM__ = { Terminal, FitAddon, css }
JS
npx esbuild entry.js --bundle --minify --format=iife \
  --loader:.css=text --outfile=vendor/xterm.bundle.js
node scripts/build-client.mjs
```

The `css` export is the full xterm stylesheet with the `--loader:.css=text`
import; the feature injects it as a `<style data-plugin-css="ui-toolkit-terminal-xterm">`
tag on first terminal creation.
