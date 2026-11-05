# Workspace plugins

## Installed in the desktop profile

- **dsh-ui-toolkit** — merged interface toolkit (sidebar, composer HUD, Git branch, model effort, view menu, conversation cost), with per-feature switches in Settings → 界面 / Interface.
- **dsh-opencode-quota** — OpenCode Go quota; intentionally kept separate.
- **dsh-delete-session** — external plugin, not part of this workspace.

## Retired sources

These directories are kept as reference but are **no longer linked into the profile**; their features now live in `dsh-ui-toolkit/src/features/`:

- `dsh-composer-hud`
- `dsh-git-branch`
- `dsh-model-effort`
- `dsh-view-menu`
- `dsh-sidebar-unify`
- `~/.dsh/plugins/dsh-model-context`

The merged client is generated with:

```sh
node plugins/dsh-ui-toolkit/scripts/build-client.mjs
```
