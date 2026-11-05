/**
 * Host half of the model effort slider plugin.
 *
 * The selector is a client-only surface over the existing `modelDirectories`
 * service. This row exists so the bundle can be installed, toggled, and
 * versioned like any other profile plugin; it registers no Host service.
 *
 * @module @local/dsh-model-effort
 */

/** Stable Cordis plugin name. */
export const name = "model-effort";

/** No Host services are required. */
export const inject = [];

/** Mount nothing on the Host side. */
export function apply() {}
