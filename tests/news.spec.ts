import NDK, { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { expect, test } from '@playwright/test'
import { updateAppConfig } from './helpers'
import { freshRelay, stopRelay } from './relay'

test.describe('News at a location', () => {
  let relay: string
  test.beforeEach(async ({ page }) => {
    relay = await freshRelay()
    await page.waitForTimeout(500)
    await updateAppConfig(
      page,
      { relays: [relay] },
      { path: '/404', locator: page.getByRole('main') },
    )
  })

  test.afterEach(async () => {
    await stopRelay()
  })

  test.beforeEach(async () => {
    const aliceSigner = NDKPrivateKeySigner.generate()
    const bobSigner = NDKPrivateKeySigner.generate()
    const ceciliaSigner = NDKPrivateKeySigner.generate()
    const ndk = new NDK({ explicitRelayUrls: [relay] })
    await ndk.connect()

    const alice = await aliceSigner.user()
    alice.ndk = ndk
    ndk.signer = aliceSigner
    alice.profile = { name: 'Alice', about: 'Test user' }
    await alice.publish()
    ndk.signer = undefined
    const event = new NDKEvent(ndk, {
      content: 'Test content',
      tags: [
        ['g', 'u2fkb05'],
        ['g', 'u2fkb0'],
        ['g', 'u2fkb'],
        ['g', 'u2fk'],
        ['g', 'u2f'],
        ['g', 'u2'],
        ['g', 'u'],
      ],
      kind: 1,
    })
    await event.sign(aliceSigner)
    await event.publish()

    const event2 = new NDKEvent(ndk, {
      content: 'Other test event',
      tags: [
        ['g', 'u2fm6v'],
        ['g', 'u2fm6'],
        ['g', 'u2fm'],
        ['g', 'u2f'],
        ['g', 'u2'],
        ['g', 'u'],
      ],
      kind: 1,
    })
    await event2.sign(bobSigner)
    await event2.publish()

    const event3 = new NDKEvent(ndk, {
      content: 'Yet another test event',
      tags: [
        ['g', 'u2fhzvvh'],
        ['g', 'u2fhzvv'],
        ['g', 'u2fhzv'],
        ['g', 'u2fhz'],
        ['g', 'u2fh'],
        ['g', 'u2f'],
        ['g', 'u2'],
        ['g', 'u'],
      ],
      kind: 1,
    })
    await event3.sign(ceciliaSigner)
    await event3.publish()
  })

  test('show news at a selected location', async ({ page }) => {
    await page.getByRole('link', { name: 'news' }).click()
    await expect(page).toHaveURL('/news')
    await page.getByRole('spinbutton', { name: 'latitude' }).fill('50')
    await page.getByRole('spinbutton', { name: 'longitude' }).fill('14.5')
    await expect(page.getByTestId('news-item')).toHaveCount(3)
  })
})
