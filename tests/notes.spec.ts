import NDK from '@nostr-dev-kit/ndk'
import { expect, test } from '@playwright/test'
import { destroyRelays, prepareRelays, selectLocation } from './helpers'
import { createTestEvents, testNotes } from './test-data'

test.describe('Notes at a location', () => {
  let ndk: NDK

  test.beforeEach(async ({ page }) => {
    ndk = await prepareRelays(page)
  })

  test.afterEach(async () => {
    await destroyRelays(ndk)
  })

  test.beforeEach(async () => {
    await createTestEvents(testNotes, { ndk })
  })

  test('show notes near a selected location', async ({ page }) => {
    await page.getByRole('link', { name: 'notes' }).click()
    await expect(page).toHaveURL('/notes')
    await selectLocation(page, 50.087496, 14.421181)
    await expect(page.getByTestId('tady-list-item')).toHaveCount(3)
  })

  test('show direction from app location to the note', async ({ page }) => {
    await page.getByRole('link', { name: 'notes' }).click()
    await expect(page).toHaveURL('/notes')
    await selectLocation(page, 50.087496, 14.421181)

    await page.getByRole('button', { name: 'nearest' }).click()

    const directionSelector = page
      .getByTestId('tady-list-item')
      .nth(1)
      .getByTestId('geo-direction')

    await expect(directionSelector).toBeVisible()
    await expect(directionSelector).toContainText('3.7km')

    await directionSelector.click()

    const dialogSelector = page.getByRole('dialog')
    await expect(dialogSelector).toBeVisible()
    await expect(
      page.locator('.destination-geohash.destination-geohash-u2fkb05'),
    ).toBeVisible()
  })
})
