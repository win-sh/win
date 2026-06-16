import test from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'
import { fetchConnectorSnapshot } from '../src/cloud.js'
import { saveAuth } from '../src/auth.js'

const execFileAsync = promisify(execFile)

test('fetchConnectorSnapshot loads a hosted snapshot with the stored token', async () => {
  const configDir = await mkdtemp(join(tmpdir(), 'win-loops-cloud-module-'))
  const server = await createSnapshotServer()

  try {
    await saveAuth({
      configDir,
      token: 'win_test_cloud',
      workspace: 'acme',
      apiUrl: server.url,
      appUrl: 'https://win.sh'
    })

    const snapshot = await fetchConnectorSnapshot({
      loopId: 'seo-growth',
      configDir
    })

    assert.equal(snapshot.loopId, 'seo-growth')
    assert.equal(snapshot.source, 'hosted')
    assert.equal(server.requests[0].headers.authorization, 'Bearer win_test_cloud')
    assert.equal(server.requests[0].url, '/v1/loops/seo-growth/connector-snapshot')
  } finally {
    server.close()
    await rm(configDir, { recursive: true, force: true })
  }
})

test('CLI snapshot fetch prints hosted connector snapshot JSON', async () => {
  const configDir = await mkdtemp(join(tmpdir(), 'win-loops-cloud-cli-'))
  const server = await createSnapshotServer()

  try {
    await saveAuth({
      configDir,
      token: 'win_test_cloud',
      workspace: 'acme',
      apiUrl: server.url,
      appUrl: 'https://win.sh'
    })

    const { stdout } = await execFileAsync(process.execPath, [
      'bin/win-loops.js',
      'snapshot',
      'fetch',
      'feedback-to-fix',
      '--config-dir',
      configDir
    ], {
      cwd: new URL('..', import.meta.url).pathname
    })

    const snapshot = JSON.parse(stdout)
    assert.equal(snapshot.loopId, 'feedback-to-fix')
    assert.equal(snapshot.source, 'hosted')
  } finally {
    server.close()
    await rm(configDir, { recursive: true, force: true })
  }
})

function createSnapshotServer() {
  const requests = []
  const server = createServer((request, response) => {
    requests.push({
      url: request.url,
      headers: request.headers
    })
    const loopId = request.url.split('/')[3]
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify({
      loopId,
      source: 'hosted'
    }))
  })

  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      resolve({
        url: `http://127.0.0.1:${address.port}`,
        requests,
        close: () => server.close()
      })
    })
  })
}
