import NDK, { NDKEvent, NostrEvent } from '@nostr-dev-kit/ndk'
import { expect, test } from '@playwright/test'
import {
  createEvent,
  createUser,
  destroyRelays,
  setupTestRelay,
  updateAppRelays,
} from './helpers'

test.describe('Create a note (news)', () => {
  let ndk: NDK
  let relay: string

  // test.beforeEach(async ({ page }) => {
  //   ndk = await prepareRelays(page)
  // })
  test.beforeEach(async () => {
    ;({ ndk, relay } = await setupTestRelay())
  })

  test.beforeEach(async ({ page }) => {
    const user = await createUser({ ndk, profile: { name: 'eve' } })

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
  })

  test.beforeEach(async ({ page }) => {
    await updateAppRelays(page, [relay])
  })

  test.afterEach(async () => {
    await destroyRelays(ndk)
  })

  test.beforeEach(async () => {
    await createEvent({
      ndk,
      user: await createUser(),
      event: { content: 'Test content', kind: 1 },
      location: [49.01, 14.01, 8],
    })
    await createEvent({
      ndk,
      user: await createUser(),
      event: { content: 'Other test event', kind: 1 },
      location: [48.98, 13.98, 7],
    })
  })

  test('open create form', async ({ page }) => {
    await page.getByRole('link', { name: 'news' }).click()
    await page.getByRole('button', { name: 'create news' }).click()
    await expect(page.getByTestId('create-news-form')).toBeVisible()
  })
  test('write text content', async ({ page }) => {
    await page.getByRole('link', { name: 'news' }).click()
    await page.getByRole('button', { name: 'create news' }).click()
    await expect(page.getByTestId('create-news-form')).toBeVisible()
    await page.getByRole('textbox', { name: 'content' }).fill('some text here')
  })
  test.fixme('correctly manage tags', async () => {})
  test.fixme('upload media', async () => {})
  test.fixme('take a photo or record a video', async () => {})
  test.use({ permissions: ['geolocation'] })
  test('show initial geolocated location', async ({ page, context }) => {
    await context.setGeolocation({ latitude: 49, longitude: 14 })
    await page.getByRole('link', { name: 'news' }).click()
    await page.getByRole('button', { name: 'create news' }).click()
    await expect(page.getByTestId('create-news-form')).toBeVisible()
    await expect(page.locator('geo-select-geohash')).toHaveJSProperty(
      'value',
      'u29yy8',
    )
  })
  test.fixme('geolocate location', async () => {})
  test.fixme('select location manually', async () => {})
  test.fixme('select location from media metadata', async () => {})
  test.use({ permissions: ['geolocation'] })
  test('select precision', async ({ page, context }) => {
    await context.setGeolocation({ latitude: 49, longitude: 14 })
    await page.getByRole('link', { name: 'news' }).click()
    await page.getByRole('button', { name: 'create news' }).click()
    await expect(page.getByTestId('create-news-form')).toBeVisible()
    await expect(page.locator('geo-select-geohash')).toHaveJSProperty(
      'value',
      'u29yy8',
    )
    await page.locator('#geohash-precision #thumb').click()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('geo-select-geohash')).toHaveJSProperty(
      'value',
      'u29yy84m',
    )
  })
  test.fixme('show note preview', async () => {})
  test('successful submit with authenticated user', async ({
    page,
    context,
  }) => {
    await context.setGeolocation({ latitude: 49, longitude: 14 })
    await page.getByRole('link', { name: 'news' }).click()
    await expect(page.getByTestId('tady-list-item')).toHaveCount(2)
    await page.getByRole('button', { name: 'create news' }).click()
    await page.getByRole('textbox', { name: 'content' }).fill('some text here')
    await page.locator('#geohash-precision #thumb').click()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('geo-select-geohash')).toHaveJSProperty(
      'value',
      'u29yy84m',
    )

    await page.getByRole('button', { name: 'submit' }).click()

    await page.getByRole('button', { name: 'sign in' }).click()

    await expect(page.getByTestId('create-news-form')).not.toBeVisible()
    await expect(page.getByTestId('tady-list-item')).toHaveCount(3)
  })
  test.use({ permissions: ['geolocation'] })
  test('successful submit with anonymous user', async ({ page, context }) => {
    await context.setGeolocation({ latitude: 49, longitude: 14 })
    await page.getByRole('link', { name: 'news' }).click()
    await expect(page.getByTestId('tady-list-item')).toHaveCount(2)
    await page.getByRole('button', { name: 'create news' }).click()
    await page.getByRole('textbox', { name: 'content' }).fill('some text here')
    await page.locator('#geohash-precision #thumb').click()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('geo-select-geohash')).toHaveJSProperty(
      'value',
      'u29yy84m',
    )

    await page.getByRole('button', { name: 'submit' }).click()

    await page.getByRole('button', { name: 'anonymous' }).click()

    await expect(page.getByTestId('create-news-form')).not.toBeVisible()
    await expect(page.getByTestId('tady-list-item')).toHaveCount(3)
  })
  test.fixme('show error when content is empty', async () => {})
  test.fixme('show error when location is not selected', async () => {})
})
