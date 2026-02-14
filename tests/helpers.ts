import NDK, {
  NDKEvent,
  NDKPrivateKeySigner,
  NDKRawEvent,
  NDKUser,
  NDKUserProfile,
} from '@nostr-dev-kit/ndk'
import { expect, Locator, Page } from '@playwright/test'
import ngeohash from 'ngeohash'
import { ConfigType } from '../src/config/update.js'
import { freshRelay, stopRelay } from './relay.js'

export const updateAppConfig = async (
  page: Page,
  config: Partial<ConfigType>,
  { path = '/', locator }: { path?: string; locator?: Locator } = {},
) => {
  locator ??= page.getByRole('button', { name: 'Sign in' })
  await page.goto(path)
  await expect(locator).toBeVisible()
  await page.evaluate(`globalThis.updateAppConfig(${JSON.stringify(config)})`)
}

interface User {
  signer: NDKPrivateKeySigner
  user?: NDKUser
}

export const createUser = async ({
  profile,
  ndk,
}: {
  profile?: NDKUserProfile
  ndk?: NDK
} = {}): Promise<User> => {
  const signer = NDKPrivateKeySigner.generate()
  let user: NDKUser | undefined = undefined
  if (ndk && profile) {
    user = await signer.user()
    user.ndk = ndk
    ndk.signer = signer
    user.profile = profile
    await user.publish()
    ndk.signer = undefined
  }

  return { signer, user }
}

export const createEvent = async ({
  ndk,
  user,
  event,
  location,
}: {
  ndk: NDK
  user: User
  event: Partial<NDKRawEvent>
  location?: [number, number, number] | string
}): Promise<NDKEvent> => {
  if (location) {
    const geohash =
      typeof location === 'string' ? location : ngeohash.encode(...location)
    const allGeohashes = substrings(geohash)
    event.tags ??= []
    event.tags.push(...allGeohashes.map(g => ['g', g]))
  }

  const ndkEvent = new NDKEvent(ndk, event)
  await ndkEvent.sign(user.signer)
  await ndkEvent.publish()

  return ndkEvent
}

const substrings = (s: string) =>
  Array.from({ length: s.length }, (_, i) => s.slice(0, s.length - i))

export const prepareRelays = async (page: Page) => {
  const relay = await freshRelay()
  await page.waitForTimeout(1000)
  await updateAppConfig(
    page,
    { relays: [relay] },
    { path: '/404', locator: page.getByRole('main') },
  )

  const ndk = new NDK({ explicitRelayUrls: [relay] })
  await ndk.connect()

  return ndk
}

export const destroyRelays = async (ndk: NDK) => {
  for (const pool of ndk.pools) {
    for (const relay of pool.relays.values()) {
      relay.disconnect()
    }
    pool.relays.clear()
  }
  await stopRelay()
}
