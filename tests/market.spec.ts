import type NDK from '@nostr-dev-kit/ndk'
import { expect, test } from '@playwright/test'
import { destroyRelays, prepareRelays, selectLocation } from './helpers'
import { createTestEvents, testClassifieds } from './test-data'

test.describe('Classified listings (marketplace) at location', () => {
  let ndk: NDK

  test.beforeEach(async ({ page }) => {
    ndk = await prepareRelays(page)
  })

  test.afterEach(async () => {
    await destroyRelays(ndk)
  })

  test.beforeEach(async () => {
    await createTestEvents(testClassifieds, { ndk })
  })

  test('show classified listings at a selected location', async ({ page }) => {
    await page.getByRole('link', { name: 'market' }).click()
    await expect(page).toHaveURL('/market')
    await selectLocation(page, 7.35, 151.83)
    await expect(page.getByTestId('tady-list-item')).toHaveCount(3)

    // show title
    await expect(
      page
        .getByTestId('tady-list-item')
        .nth(1)
        .getByRole('heading', { name: 'Test title' }),
    ).toBeVisible()
  })
})
