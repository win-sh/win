import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { chmod, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const DEFAULT_APP_URL = 'https://win.sh'
const DEFAULT_API_URL = 'https://api.win.sh'

export function buildTokenApprovalUrl({
  appUrl = DEFAULT_APP_URL,
  redirectUri,
  state,
  client = 'win-loops'
}) {
  if (!redirectUri) throw new Error('redirectUri is required')
  if (!state) throw new Error('state is required')

  const url = new URL('/settings/api-tokens/cli', appUrl)
  url.searchParams.set('client', client)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)
  return url.toString()
}

export async function saveAuth({
  configDir = defaultConfigDir(),
  token,
  workspace = '',
  apiUrl = DEFAULT_API_URL,
  appUrl = DEFAULT_APP_URL,
  expiresAt = '',
  createdAt = new Date().toISOString()
}) {
  if (!token) throw new Error('token is required')

  await mkdir(resolve(configDir), { recursive: true })
  const auth = {
    token,
    workspace,
    apiUrl,
    appUrl,
    expiresAt,
    createdAt
  }
  const path = authPath(configDir)
  await writeFile(path, `${JSON.stringify(auth, null, 2)}\n`, 'utf8')
  await chmod(path, 0o600)
  return auth
}

export async function readAuth({ configDir = defaultConfigDir() } = {}) {
  try {
    return JSON.parse(await readFile(authPath(configDir), 'utf8'))
  } catch {
    return null
  }
}

export async function clearAuth({ configDir = defaultConfigDir() } = {}) {
  await rm(authPath(configDir), { force: true })
}

export function renderAuthStatus(auth) {
  if (!auth) return 'Not logged in.\n'
  return [
    'Logged in to win.sh',
    `Workspace: ${auth.workspace || '-'}`,
    `API: ${auth.apiUrl || DEFAULT_API_URL}`,
    `Token: ${redactToken(auth.token)}`,
    `Created: ${auth.createdAt || '-'}`,
    `Expires: ${auth.expiresAt || '-'}`
  ].join('\n') + '\n'
}

export function redactToken(token) {
  if (!token) return '-'
  if (token.length <= 8) return `${token.slice(0, 2)}...`
  return `${token.slice(0, 4)}...${token.slice(-4)}`
}

export async function loginWithBrowser({
  configDir = defaultConfigDir(),
  appUrl = DEFAULT_APP_URL,
  apiUrl = DEFAULT_API_URL,
  port = 0,
  timeoutMs = 120000,
  openBrowser = true,
  printUrl = false,
  opener = openUrl
} = {}) {
  const state = randomBytes(16).toString('hex')
  const server = createServer()
  const callback = waitForCallback({ server, timeoutMs, state })
  await listen(server, port)
  const address = server.address()
  const redirectUri = `http://127.0.0.1:${address.port}/callback`
  const approvalUrl = buildTokenApprovalUrl({ appUrl, redirectUri, state })

  if (printUrl) process.stdout.write(`${approvalUrl}\n`)
  if (openBrowser) opener(approvalUrl)

  const params = await callback
  const auth = await saveAuth({
    configDir,
    token: params.token,
    workspace: params.workspace || '',
    apiUrl: params.apiUrl || apiUrl,
    appUrl,
    expiresAt: params.expiresAt || ''
  })
  return auth
}

function waitForCallback({ server, timeoutMs, state }) {
  return new Promise((resolveCallback, rejectCallback) => {
    const timer = setTimeout(() => {
      server.close()
      rejectCallback(new Error('Timed out waiting for browser approval'))
    }, timeoutMs)

    server.on('request', (request, response) => {
      const url = new URL(request.url, `http://${request.headers.host}`)
      if (url.pathname !== '/callback') {
        response.writeHead(404)
        response.end('Not found')
        return
      }

      if (url.searchParams.get('state') !== state) {
        response.writeHead(400)
        response.end('State mismatch')
        return
      }

      const token = url.searchParams.get('token')
      if (!token) {
        response.writeHead(400)
        response.end('Missing token')
        return
      }

      clearTimeout(timer)
      response.writeHead(200, { 'content-type': 'text/html' })
      response.end('<html><body><h1>win.sh CLI connected</h1><p>You can close this window.</p></body></html>')
      server.close()
      resolveCallback({
        token,
        workspace: url.searchParams.get('workspace') || '',
        apiUrl: url.searchParams.get('api_url') || '',
        expiresAt: url.searchParams.get('expires_at') || ''
      })
    })

    server.on('error', error => {
      clearTimeout(timer)
      rejectCallback(error)
    })
  })
}

function listen(server, port) {
  return new Promise((resolveListen, rejectListen) => {
    server.once('listening', resolveListen)
    server.once('error', rejectListen)
    server.listen(port, '127.0.0.1')
  })
}

function openUrl(url) {
  const command = process.platform === 'darwin'
    ? 'open'
    : process.platform === 'win32'
      ? 'cmd'
      : 'xdg-open'
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url]
  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore'
  })
  child.unref()
}

function defaultConfigDir() {
  return process.env.WIN_LOOPS_CONFIG_DIR || join(homedir(), '.config', 'win-loops')
}

function authPath(configDir) {
  return join(resolve(configDir), 'auth.json')
}
