#!/usr/bin/env node
/**
 * Concatenate the feature factories into the single client bundle the DSH
 * module loader can serve.
 *
 * Each feature source is the original standalone plugin client: a
 * window.__ModuleLoader__.load({ id, factory }) wrapper. We keep only the
 * factory body and turn it into a named creator function. The template then
 * owns the shared settings UI, flag storage, and per-feature lifecycle.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const specs = [
  { file: "composer-hud.client.js", name: "createComposerHud" },
  { file: "git-branch.client.js", name: "createGitBranch" },
  { file: "model-effort.client.js", name: "createModelEffort" },
  { file: "view-menu.client.js", name: "createViewMenu" },
  { file: "sidebar-unify.client.js", name: "createSidebarUnify" },
  { file: "sidebar-entries.client.js", name: "createSidebarEntries" },
  { file: "model-context.client.js", name: "createModelContext" },
  { file: "hero.client.js", name: "createHeroCleanup" },
  { file: "motion.client.js", name: "createSidebarMotion" },
  { file: "auto-load.client.js", name: "createAutoLoadEarlier" },
  { file: "terminal.client.js", name: "createTerminalPanelFeature" },
  { file: "auto-hide-scrollbar.client.js", name: "createAutoHideScrollbars" }
];

const FACTORY_MARKERS = ["factory: (require) => {", "factory: () => {"];
const RETURN_MARKER = "return module.exports;";

/** @param {string} file */
function extractFactoryBody(file) {
  const source = fs.readFileSync(path.join(root, "src/features", file), "utf8");
  let bodyStart = -1;
  for (const marker of FACTORY_MARKERS) {
    const index = source.indexOf(marker);
    if (index >= 0) {
      bodyStart = index + marker.length;
      break;
    }
  }
  if (bodyStart < 0) throw new Error(file + ": factory marker not found");
  const bodyEnd = source.lastIndexOf(RETURN_MARKER);
  if (bodyEnd < bodyStart) throw new Error(file + ": factory return not found");
  return source.slice(bodyStart, bodyEnd + RETURN_MARKER.length);
}

const creators = specs.map(({ file, name }) => {
  const body = extractFactoryBody(file);
  return "\t\t// feature: " + file + "\n\t\tfunction " + name + "(require) {" + body + "\n\t\t}";
}).join("\n\n");

const template = fs.readFileSync(path.join(root, "src/client.template.js"), "utf8");
const marker = "/* @@CREATORS@@ */";
if (!template.includes(marker)) throw new Error("template placeholder missing");
const primitivesMarker = "/* @@PRIMITIVES@@ */";
if (!template.includes(primitivesMarker)) throw new Error("template primitives placeholder missing");
const primitivesSource = fs.readFileSync(path.join(root, "src/local-primitives.js"), "utf8");
const vendorMarker = "/* @@VENDOR@@ */";
if (!template.includes(vendorMarker)) throw new Error("vendor placeholder missing");
const vendorPath = path.join(root, "vendor/xterm.bundle.js");
if (!fs.existsSync(vendorPath)) throw new Error("vendor/xterm.bundle.js is missing");
const chunk = [
	"window.__ModuleLoader__.load({",
	'\tid: "@local/dsh-ui-toolkit",',
	'\tchunk: "client.terminal.js",',
	"\tfactory: () => {",
	"\t\tvar module = { exports: {} };",
	"\t\tvar exports = module.exports;",
	"\t\t// xterm.js 6.0.0 + @xterm/addon-fit 0.11.0 (MIT), bundled by esbuild",
	fs.readFileSync(vendorPath, "utf8"),
	"\t\tconst lib = globalThis.__DSH_UI_TOOLKIT_XTERM__;",
	"\t\texports.Terminal = lib.Terminal;",
	"\t\texports.FitAddon = lib.FitAddon;",
	"\t\texports.css = lib.css;",
	"\t\treturn module.exports;",
	"\t}",
	"});",
	""
].join("\n");
fs.writeFileSync(path.join(root, "lib/client.terminal.js"), chunk);
const output = template.replace(vendorMarker, "").replace(primitivesMarker, primitivesSource).replace(marker, creators);
if (output.includes(marker)) throw new Error("template placeholder not replaced");
if (output.includes(primitivesMarker)) throw new Error("template primitives placeholder not replaced");
fs.writeFileSync(path.join(root, "lib/client.js"), output);
console.log("wrote lib/client.js (" + output.length + " bytes, " + specs.length + " features)");
