import NDK from '@nostr-dev-kit/ndk'
import { expect, test } from '@playwright/test'
import {
  createEvent,
  createUser,
  destroyRelays,
  prepareRelays,
} from './helpers'

test.describe('Create a note (news)', () => {
  let ndk: NDK

  test.beforeEach(async ({ page }) => {
    ndk = await prepareRelays(page)
  })

  test.afterEach(async () => {
    await destroyRelays(ndk)
  })

  test.beforeEach(async () => {
    await createEvent({
      ndk,
      user: await createUser(),
      event: { content: 'Test content', kind: 1 },
      location: [49.0001, 14.0001, 8],
    })
    await createEvent({
      ndk,
      user: await createUser(),
      event: { content: 'Other test event', kind: 1 },
      location: [48.999, 13.9999, 7],
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
  test.fixme('successful submit with authenticated user', async () => {})
  test.use({ permissions: ['geolocation'] })
  test('successful submit with anonymous user', async ({ page, context }) => {
    await context.setGeolocation({ latitude: 49, longitude: 14 })
    await page.getByRole('link', { name: 'news' }).click()
    await expect(page.getByTestId('news-item')).toHaveCount(2)
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

    await page.getByRole('button', { name: 'post anonymously' }).click()

    await expect(page.getByTestId('create-news-form')).not.toBeVisible()
    await expect(page.getByTestId('news-item')).toHaveCount(3)
  })
  test.fixme('show error when content is empty', async () => {})
  test.fixme('show error when location is not selected', async () => {})
})
