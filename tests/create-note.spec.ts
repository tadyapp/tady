import NDK from '@nostr-dev-kit/ndk'
import { expect, test } from '@playwright/test'
import { destroyRelays, prepareRelays } from './helpers'

test.describe('Create a note (news)', () => {
  let ndk: NDK

  test.beforeEach(async ({ page }) => {
    ndk = await prepareRelays(page)
  })

  test.afterEach(async () => {
    await destroyRelays(ndk)
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
  test.fixme('select precision', async () => {})
  test.fixme('show note preview', async () => {})
  test.fixme('successful submit with authenticated user', async () => {})
  test.fixme('successful submit with anonymous user', async () => {})
  test.fixme('show error when content is empty', async () => {})
  test.fixme('show error when location is not selected', async () => {})
})
