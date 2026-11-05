import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {
  GitError,
  classifySwitchFailure,
  internals,
  parseBranches,
  parseTrack,
  readRepoStatus,
  resolveGit,
  runGit,
  switchBranch
} from '../lib/git.js'

async function scratch() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-git-branch-'))
  return {
    dir,
    async cleanup() {
      await fs.rm(dir, { recursive: true, force: true })
    }
  }
}

async function makeRepo() {
  const scratchDir = await scratch()
  const dir = scratchDir.dir
  const git = await resolveGit()
  await runGit(git, ['init', '-q', '-b', 'main'], { cwd: dir })
  await runGit(git, ['config', 'user.email', 'test@example.com'], { cwd: dir })
  await runGit(git, ['config', 'user.name', 'Test User'], { cwd: dir })
  // A global commit.gpgsign (for example 1Password SSH signing) must not turn
  // the fixture's commits into an interactive prompt.
  await runGit(git, ['config', 'commit.gpgsign', 'false'], { cwd: dir })
  await fs.writeFile(path.join(dir, 'file.txt'), 'base\n', 'utf8')
  await runGit(git, ['add', 'file.txt'], { cwd: dir })
  await runGit(git, ['commit', '-qm', 'base'], { cwd: dir })
  return { ...scratchDir, git }
}

test('parseTrack understands git upstream summaries', () => {
  assert.deepEqual(parseTrack(''), { ahead: 0, behind: 0, gone: false })
  assert.deepEqual(parseTrack('[ahead 1]'), { ahead: 1, behind: 0, gone: false })
  assert.deepEqual(parseTrack('[behind 12]'), { ahead: 0, behind: 12, gone: false })
  assert.deepEqual(parseTrack('[ahead 1, behind 2]'), { ahead: 1, behind: 2, gone: false })
  assert.deepEqual(parseTrack('[gone]'), { ahead: 0, behind: 0, gone: true })
  assert.deepEqual(parseTrack(undefined), { ahead: 0, behind: 0, gone: false })
})

test('parseBranches keeps the subject after the numeric fields', () => {
  const stdout = [
    'main\t*\torigin/main\t[ahead 1, behind 2]\t1700000000\tRelease \tnotes',
    'feature/x\t \t\t\t1699999999\tFeature work'
  ].join('\n')
  const branches = parseBranches(stdout)
  assert.equal(branches.length, 2)
  assert.deepEqual(branches[0], {
    name: 'main',
    current: true,
    upstream: 'origin/main',
    ahead: 1,
    behind: 2,
    gone: false,
    commit: new Date(1700000000 * 1000).toISOString(),
    subject: 'Release \tnotes'
  })
  assert.equal(branches[1].current, false)
  assert.equal(branches[1].upstream, null)
  assert.equal(branches[1].subject, 'Feature work')
})

test('readRepoStatus reports branch, cleanliness, and local branches', async () => {
  const repo = await makeRepo()
  try {
    await runGit(repo.git, ['branch', 'feature/x'], { cwd: repo.dir })
    const status = await readRepoStatus(repo.git, repo.dir)
    // Git reports the real path; macOS /var is a symlink to /private/var.
    assert.equal(status.repository.root, await fs.realpath(repo.dir))
    assert.equal(status.repository.name, path.basename(repo.dir))
    assert.equal(status.branch, 'main')
    assert.equal(status.detached, false)
    assert.equal(status.unborn, false)
    assert.equal(status.dirty, 0)
    assert.ok(status.branches.some((branch) => branch.name === 'main' && branch.current))
    assert.ok(status.branches.some((branch) => branch.name === 'feature/x'))
  } finally {
    await repo.cleanup()
  }
})

test('readRepoStatus counts untracked and modified files', async () => {
  const repo = await makeRepo()
  try {
    await fs.writeFile(path.join(repo.dir, 'untracked.txt'), 'new\n', 'utf8')
    let status = await readRepoStatus(repo.git, repo.dir)
    assert.equal(status.dirty, 1)
    await fs.writeFile(path.join(repo.dir, 'file.txt'), 'changed\n', 'utf8')
    status = await readRepoStatus(repo.git, repo.dir)
    assert.equal(status.dirty, 2)
  } finally {
    await repo.cleanup()
  }
})

test('a directory outside a work tree is a normal no-repository answer', async () => {
  const scratchDir = await scratch()
  try {
    const git = await resolveGit()
    const status = await readRepoStatus(git, scratchDir.dir)
    assert.equal(status.repository, null)
    assert.equal(status.reason, 'not-a-repository')
  } finally {
    await scratchDir.cleanup()
  }
})

test('switchBranch moves to an existing local branch and rejects unknown names', async () => {
  const repo = await makeRepo()
  try {
    await runGit(repo.git, ['branch', 'feature/x'], { cwd: repo.dir })
    await switchBranch(repo.git, repo.dir, 'feature/x')
    const current = await runGit(repo.git, ['branch', '--show-current'], { cwd: repo.dir })
    assert.equal(current.stdout.trim(), 'feature/x')

    await assert.rejects(
      () => switchBranch(repo.git, repo.dir, 'missing'),
      (error) => error instanceof GitError && error.code === 'invalid-branch'
    )
    await assert.rejects(
      () => switchBranch(repo.git, repo.dir, '-bad'),
      (error) => error instanceof GitError && error.code === 'invalid-branch'
    )
  } finally {
    await repo.cleanup()
  }
})

test('switchBranch preserves the branch when local changes would be overwritten', async () => {
  const repo = await makeRepo()
  try {
    await runGit(repo.git, ['branch', 'other'], { cwd: repo.dir })
    await switchBranch(repo.git, repo.dir, 'other')
    await fs.writeFile(path.join(repo.dir, 'file.txt'), 'other branch\n', 'utf8')
    await runGit(repo.git, ['commit', '-qam', 'other change'], { cwd: repo.dir })
    await switchBranch(repo.git, repo.dir, 'main')
    await fs.writeFile(path.join(repo.dir, 'file.txt'), 'local change\n', 'utf8')

    await assert.rejects(
      () => switchBranch(repo.git, repo.dir, 'other'),
      (error) => error instanceof GitError && error.code === 'dirty-conflict'
    )
    const current = await runGit(repo.git, ['branch', '--show-current'], { cwd: repo.dir })
    assert.equal(current.stdout.trim(), 'main')
  } finally {
    await repo.cleanup()
  }
})

test('readRepoStatus reports detached HEAD and switch recovers a branch', async () => {
  const repo = await makeRepo()
  try {
    await runGit(repo.git, ['checkout', '--detach', '-q'], { cwd: repo.dir })
    const detached = await readRepoStatus(repo.git, repo.dir)
    assert.equal(detached.branch, null)
    assert.equal(detached.detached, true)
    assert.match(detached.head, /^[0-9a-f]{7,}$/u)

    await switchBranch(repo.git, repo.dir, 'main')
    const back = await readRepoStatus(repo.git, repo.dir)
    assert.equal(back.branch, 'main')
    assert.equal(back.detached, false)
  } finally {
    await repo.cleanup()
  }
})

test('classifySwitchFailure maps the common Git refusals', () => {
  assert.equal(classifySwitchFailure('error: Your local changes would be overwritten'), 'dirty-conflict')
  assert.equal(classifySwitchFailure("fatal: 'x' is already checked out at '/tmp/x'"), 'checked-out-elsewhere')
  assert.equal(classifySwitchFailure("fatal: no such branch: 'x'"), 'invalid-branch')
  assert.equal(classifySwitchFailure('fatal: cannot switch branch while rebasing'), 'operation-in-progress')
  assert.equal(classifySwitchFailure('error: you need to resolve your current index first'), 'index-conflict')
  assert.equal(classifySwitchFailure('something else'), 'switch-failed')
})

test('the dirty counter stops at the display cap', () => {
  assert.equal(internals.countDirty(''), 0)
  assert.equal(internals.countDirty(' M a\n?? b\n'), 2)
  const many = Array.from({ length: 1200 }, (_, index) => ' M file-' + index).join('\n')
  assert.equal(internals.countDirty(many), internals.MAX_DIRTY_ENTRIES)
})
