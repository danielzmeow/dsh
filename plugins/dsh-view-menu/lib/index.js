/**
 * Host half of the View menu plugin.
 *
 * Folding the Conversation View tabs into the More menu is a client-only
 * surface over the existing `conversation.view` and
 * `conversation.session.header.views.actions` slots. This row exists so the
 * bundle can be installed, toggled, and versioned like any other profile
 * plugin; it registers no Host service.
 *
 * @module @local/dsh-view-menu
 */

/** Stable Cordis plugin name. */
export const name = "view-menu";

/** No Host services are required. */
export const inject = [];

/** Mount nothing on the Host side. */
export function apply() {}
