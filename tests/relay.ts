import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'

let container: StartedTestContainer

export async function startRelay(): Promise<string> {
  container = await new GenericContainer('scsibug/nostr-rs-relay')
    .withExposedPorts(8080)
    .withWaitStrategy(Wait.forListeningPorts())
    .start()

  const port = container.getMappedPort(8080)
  return `ws://localhost:${port}`
}

export async function stopRelay() {
  await container?.stop()
}

export async function freshRelay(): Promise<string> {
  await stopRelay()
  return await startRelay()
}
