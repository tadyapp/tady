import NDK, {
  NDKEvent,
  NDKPrivateKeySigner,
  NDKRawEvent,
  NDKRelay,
  NDKUser,
  NDKUserProfile,
  NostrEvent,
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

export interface User {
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
}): Promise<{ event: NDKEvent; relays: Set<NDKRelay> }> => {
  if (location) {
    const geohash =
      typeof location === 'string' ? location : ngeohash.encode(...location)
    const allGeohashes = substrings(geohash)
    event.tags ??= []
    event.tags.push(...allGeohashes.map(g => ['g', g]))
  }

  const ndkEvent = new NDKEvent(ndk, event)
  await ndkEvent.sign(user.signer)
  const relays = await ndkEvent.publish()

  return { event: ndkEvent, relays }
}

const substrings = (s: string) =>
  Array.from({ length: s.length }, (_, i) => s.slice(0, s.length - i))

export const prepareRelays = async (page: Page) => {
  const { ndk, relay } = await setupTestRelay()
  await updateAppRelays(page, [relay])
  return ndk
}

export const setupTestRelay = async () => {
  const relay = await freshRelay()
  const ndk = new NDK({ explicitRelayUrls: [relay] })
  await ndk.connect()
  return { ndk, relay }
}

export const updateAppRelays = async (page: Page, relays: string[]) => {
  await page.waitForTimeout(1000)
  await updateAppConfig(
    page,
    { relays },
    { path: '/404', locator: page.getByRole('main') },
  )
}

export const destroyRelays = async (ndk?: NDK) => {
  if (ndk)
    for (const pool of ndk.pools) {
      for (const relay of pool.relays.values()) {
        relay.disconnect()
      }
      pool.relays.clear()
    }
  await stopRelay()
}

export const selectLocation = async (
  page: Page,
  latitude: number,
  longitude: number,
) => {
  await page.getByTestId('location-select-trigger').click()
  await page
    .getByRole('spinbutton', { name: 'latitude' })
    .fill(String(latitude))
  await page
    .getByRole('spinbutton', { name: 'longitude' })
    .fill(String(longitude))
  await page.getByRole('button', { name: 'Close' }).click()
}

/**
 * Set up capability for web browsers on window.nostr, e.g. for signing events
 * https://github.com/nostr-protocol/nips/blob/master/07.md
 */
export async function setupNip07(page: Page, user: User) {
  const getPublicKey = async () => user.signer.pubkey
  const signEvent = async (event: NostrEvent) => {
    const ndkEvent = new NDKEvent(undefined, event)
    await ndkEvent.sign(user.signer)
    return ndkEvent.rawEvent()
  }

  await page.exposeFunction('__nostrGetPublicKey', getPublicKey)
  await page.exposeFunction('__nostrSignEvent', signEvent)

  await page.addInitScript(() => {
    window.nostr = {
      // @ts-expect-error nonexistent function on window
      getPublicKey: window.__nostrGetPublicKey,
      // @ts-expect-error nonexistent function on window
      signEvent: window.__nostrSignEvent,
      // nip04: {
      //   encrypt: async (pubkey, plaintext) => plaintext,
      //   decrypt: async (pubkey, ciphertext) => ciphertext,
      // },
    }
  })
}
