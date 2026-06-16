import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { readAuth } from './auth.js'

export async function fetchConnectorSnapshot({
  loopId,
  configDir,
  apiUrl,
  token,
  fetchImpl = fetch
}) {
  if (!loopId) throw new Error('loopId is required')

  const auth = token ? null : await readAuth({ configDir })
  const resolvedToken = token || auth?.token
  if (!resolvedToken) throw new Error('Not logged in')

  const resolvedApiUrl = apiUrl || auth?.apiUrl || 'https://api.win.sh'
  const url = new URL(`/v1/loops/${encodeURIComponent(loopId)}/connector-snapshot`, resolvedApiUrl)
  const response = await fetchImpl(url, {
    headers: {
      authorization: `Bearer ${resolvedToken}`,
      accept: 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Snapshot fetch failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function writeConnectorSnapshot({ output, snapshot }) {
  if (!output) return snapshot
  await writeFile(resolve(output), `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
  return snapshot
}
