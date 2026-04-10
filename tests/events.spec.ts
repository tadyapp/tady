import type NDK from '@nostr-dev-kit/ndk'
import { expect, test } from '@playwright/test'
import { destroyRelays, prepareRelays, selectLocation } from './helpers'
import { createTestEvents, testCalendarEvents } from './test-data'

test.describe('Calendar events at location', () => {
  let ndk: NDK

  test.beforeEach(async ({ page }) => {
    ndk = await prepareRelays(page)
  })

  test.afterEach(async () => {
    await destroyRelays(ndk)
  })

  test.beforeEach(async () => {
    await createTestEvents(testCalendarEvents, { ndk })
  })

  test('show classified listings at a selected location', async ({ page }) => {
    await page.getByRole('link', { name: 'events' }).click()
    await expect(page).toHaveURL('/events')
    await selectLocation(page, 7.35, 151.83)
    await expect(page.getByTestId('tady-list-item')).toHaveCount(3)

    // show title
    await expect(
      page
        .getByTestId('tady-list-item')
        .nth(2)
        .getByRole('heading', { name: 'This is event title' }),
    ).toBeVisible()
  })
})
