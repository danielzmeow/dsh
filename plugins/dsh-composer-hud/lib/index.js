/**
 * Host half of the composer HUD plugin.
 *
 * The HUD is a client-only surface: it reads the session's `contextPressure`,
 * `contextBreakdown`, `tokenUsage`, and `sessionStats` projections. This row
 * exists so the bundle can be installed, toggled, and versioned like any other
 * profile plugin; it registers no Host service.
 *
 * @module @local/dsh-composer-hud
 */

/** Stable Cordis plugin name. */
export const name = "composer-hud";

/** No Host services are required. */
export const inject = [];

/** Mount nothing on the Host side. */
export function apply() {}
