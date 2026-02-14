import NDK, { NDKPool } from '@nostr-dev-kit/ndk'
import { EventGenerator, RelayPoolMock } from '@nostr-dev-kit/ndk/test'
import test from '@playwright/test'

test.describe('Create a note (news)', () => {
  let ndk: NDK
  let pool: RelayPoolMock

  test.beforeEach(async () => {
    // Create mock relay pool
    pool = new RelayPoolMock()

    // Initialize NDK with mock pool
    ndk = new NDK({ explicitRelayUrls: [] })
    ndk.pool = pool as unknown as NDKPool

    // Add mock relays
    pool.addMockRelay('wss://relay.example.com')

    // Configure EventGenerator
    EventGenerator.setNDK(ndk)
  })

  test.afterEach(() => {
    pool.disconnectAll()
    pool.resetAll()
  })

  test.fixme('open create form', async ({ page }) => {
    await page.goto('/')
  })
  test.fixme('write text content', async () => {})
  test.fixme('correctly manage tags', async () => {})
  test.fixme('upload media', async () => {})
  test.fixme('take a photo or record a video', async () => {})
  test.fixme('show current default location', async () => {})
  test.fixme('geolocate location', async () => {})
  test.fixme('select location manually', async () => {})
  test.fixme('select location from media metadata', async () => {})
  test.fixme('select precision', async () => {})
  test.fixme('show note preview', async () => {})
  test.fixme('successful submit', async () => {})
  test.fixme('show error when content is empty', async () => {})
  test.fixme('show error when location is not selected', async () => {})
})
