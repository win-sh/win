import test from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'
import {
  buildTokenApprovalUrl,
  loginWithBrowser,
  readAuth,
  redactToken,
  saveAuth
} from '../src/auth.js'

const execFileAsync = promisify(execFile)

test('buildTokenApprovalUrl points win.sh settings at a local callback', () => {
  const url = new URL(buildTokenApprovalUrl({
    appUrl: 'https://win.sh',
    redirectUri: 'http://127.0.0.1:49152/callback',
    state: 'state_123'
  }))

  assert.equal(url.origin, 'https://win.sh')
  assert.equal(url.pathname, '/settings/api-tokens/cli')
  assert.equal(url.searchParams.get('client'), 'win-loops')
  assert.equal(url.searchParams.get('redirect_uri'), 'http://127.0.0.1:49152/callback')
  assert.equal(url.searchParams.get('state'), 'state_123')
})

test('saveAuth stores token metadata and redactToken keeps only the edges visible', async () => {
  const configDir = await mkdtemp(join(tmpdir(), 'win-loops-auth-module-'))

  try {
    await saveAuth({
      configDir,
      token: 'win_live_123456789',
      workspace: 'acme',
      apiUrl: 'https://win.sh',
      appUrl: 'https://win.sh',
      createdAt: '2026-06-16T12:00:00.000Z'
    })

    const auth = await readAuth({ configDir })
    assert.equal(auth.token, 'win_live_123456789')
    assert.equal(auth.workspace, 'acme')
    assert.equal(redactToken(auth.token), 'win_...6789')

    const raw = JSON.parse(await readFile(join(configDir, 'auth.json'), 'utf8'))
    assert.equal(raw.apiUrl, 'https://win.sh')
  } finally {
    await rm(configDir, { recursive: true, force: true })
  }
})

test('loginWithBrowser stores the token returned to the local callback', async () => {
  const configDir = await mkdtemp(join(tmpdir(), 'win-loops-auth-browser-'))

  try {
    let approvalUrl = ''
    const login = loginWithBrowser({
      configDir,
      appUrl: 'https://win.sh',
      apiUrl: 'https://win.sh',
      openBrowser: true,
      opener: url => {
        approvalUrl = url
      },
      timeoutMs: 2000
    })

    await waitFor(() => approvalUrl)
    const approval = new URL(approvalUrl)
    const callback = new URL(approval.searchParams.get('redirect_uri'))
    callback.searchParams.set('token', 'win_browser_123456789')
    callback.searchParams.set('workspace', 'browser-workspace')
    callback.searchParams.set('state', approval.searchParams.get('state'))

    const response = await fetch(callback)
    assert.equal(response.status, 200)

    const auth = await login
    assert.equal(auth.token, 'win_browser_123456789')
    assert.equal(auth.workspace, 'browser-workspace')
  } finally {
    await rm(configDir, { recursive: true, force: true })
  }
})

test('CLI auth manual token flow stores, prints, reports, and clears credentials', async () => {
  const configDir = await mkdtemp(join(tmpdir(), 'win-loops-auth-cli-'))

  try {
    const cwd = new URL('..', import.meta.url).pathname
    const login = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'auth',
      'login',
      '--token',
      'win_test_123456789',
      '--workspace',
      'acme',
      '--config-dir',
      configDir
    ], { cwd })
    assert.match(login.stdout, /Saved win.sh token for acme/)

    const status = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'auth',
      'status',
      '--config-dir',
      configDir
    ], { cwd })
    assert.match(status.stdout, /Workspace: acme/)
    assert.match(status.stdout, /API: https:\/\/win\.sh/)
    assert.match(status.stdout, /Token: win_...6789/)

    const token = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'auth',
      'token',
      '--config-dir',
      configDir
    ], { cwd })
    assert.equal(token.stdout.trim(), 'win_test_123456789')

    const logout = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'auth',
      'logout',
      '--config-dir',
      configDir
    ], { cwd })
    assert.match(logout.stdout, /Logged out/)

    const afterLogout = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'auth',
      'status',
      '--config-dir',
      configDir
    ], { cwd })
    assert.match(afterLogout.stdout, /Not logged in/)
  } finally {
    await rm(configDir, { recursive: true, force: true })
  }
})

async function waitFor(predicate) {
  const started = Date.now()
  while (!predicate()) {
    if (Date.now() - started > 1000) throw new Error('Timed out waiting for predicate')
    await new Promise(resolve => setTimeout(resolve, 10))
  }
}
