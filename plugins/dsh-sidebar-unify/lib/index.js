/**
 * Host half of the sidebar polish plugin.
 *
 * The whole change is client-side: it restyles the shell's New Session button,
 * hides the brand mark, and toggles a root data attribute that hides the More
 * launcher when no plugin registers a sidebar panel. This row exists so the
 * bundle can be installed, toggled, and versioned like any other profile
 * plugin; it registers no Host service.
 *
 * @module @local/dsh-sidebar-unify
 */

/** Stable Cordis plugin name. */
export const name = "sidebar-unify";

/** No Host services are required. */
export const inject = [];

/** Mount nothing on the Host side. */
export function apply() {}
