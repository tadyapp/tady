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
})
