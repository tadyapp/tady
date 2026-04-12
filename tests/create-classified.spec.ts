import NDK from '@nostr-dev-kit/ndk'
import { expect, test } from '@playwright/test'
import {
  createUser,
  destroyRelays,
  setupNip07,
  setupTestRelay,
  updateAppRelays,
} from './helpers'
import { createTestEvents, testClassifieds } from './test-data'

test.describe('Create a classified', () => {
  let ndk: NDK
  let relay: string

  test.beforeEach(async () => {
    // the order of execution matters here because page.goto ruins updated app config
    ;({ ndk, relay } = await setupTestRelay())
  })
  test.beforeEach(async ({ page }) => {
    const alice = await createUser({ ndk, profile: { name: 'alice' } })
    await setupNip07(page, alice)
  })
  test.beforeEach(async ({ page }) => {
    await updateAppRelays(page, [relay])
  })
  test.afterEach(async () => {
    await destroyRelays(ndk)
  })

  test.beforeEach(async () => {
    await createTestEvents(testClassifieds, { ndk })
  })
  ;['sign in', 'anonymous'].forEach(userType => {
    test.use({ permissions: ['geolocation'] })
    test(`create a classified successfully with ${userType} user`, async ({
      page,
      context,
    }) => {
      await context.setGeolocation({
        latitude: 7.444731,
        longitude: 151.841869,
      })

      const title = 'Free sofa'
      const summary = 'Moving out. Sofa is used but good state.'
      const content = 'Quite a nice sofa it is. To good hands.'
      const location = 'village square'
      const price = [50, 'EUR', 'month'] as [number, string, string]

      const items = page.getByTestId('tady-list-item')
      const dialog = page
        .getByRole('dialog')
        .filter({ hasText: 'create classified' })

      await page.getByRole('link', { name: 'market' }).click()
      await expect(page).toHaveURL('/market')

      await expect(items).toHaveCount(3)

      await page.getByRole('button', { name: 'create classified' }).click()
      await expect(dialog).toBeVisible()
      await page.getByRole('textbox', { name: 'title' }).fill(title)
      await page.getByRole('textbox', { name: 'summary' }).fill(summary)
      await page.getByRole('textbox', { name: 'content' }).fill(content)
      await page.getByRole('textbox', { name: 'location' }).fill(location)
      await page
        .getByRole('spinbutton', { name: 'price' })
        .fill(String(price[0]))
      await page.getByRole('textbox', { name: 'currency' }).fill(price[1])
      await page.getByRole('textbox', { name: 'frequency' }).fill(price[2])

      // increase precision
      await page.locator('#geohash-precision #thumb').click()
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowRight')

      // submit the data
      await page.getByRole('button', { name: 'submit' }).click()
      await page.getByRole('button', { name: userType }).click()
      await expect(dialog).not.toBeVisible()

      await expect(items).toHaveCount(4)

      await page.getByRole('button', { name: 'nearest' }).click()

      const newItem = items.nth(0)

      expect(newItem.getByRole('heading', { name: title })).toBeVisible()
      expect(newItem.getByText(summary).first()).toBeVisible()
      expect(newItem.getByText(location).first()).toBeVisible()
      expect(newItem).toContainText(`${price[0]} ${price[1]} per ${price[2]}`)
    })
  })
})
