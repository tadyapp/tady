import NDK from '@nostr-dev-kit/ndk'
import { expect, Page, test } from '@playwright/test'
import {
  createEvent,
  createUser,
  destroyRelays,
  prepareRelays,
} from './helpers'
import { stopRelay } from './relay'

test.describe('News at a location', () => {
  let ndk: NDK

  test.beforeEach(async ({ page }) => {
    ndk = await prepareRelays(page)
  })

  test.afterEach(async () => {
    await destroyRelays(ndk)
  })

  test.afterEach(async () => {
    for (const relay of ndk.pool.relays.values()) relay.disconnect()

    ndk.pool.relays.clear()
    await stopRelay()
  })

  test.beforeEach(async () => {
    const alice = await createUser({
      ndk,
      profile: { name: 'Alice', about: 'Test user' },
    })
    const bob = await createUser()
    const cecilia = await createUser()

    await createEvent({
      ndk,
      user: alice,
      event: { content: 'Test content', kind: 1 },
      location: 'u2fkb05',
    })
    await createEvent({
      ndk,
      user: bob,
      event: { content: 'Other test event', kind: 1 },
      location: 'u2fm6v',
    })
    await createEvent({
      ndk,
      user: cecilia,
      event: { content: 'Yet another test event', kind: 1 },
      location: 'u2fhzvvh',
    })
  })

  const selectLocation = async (
    page: Page,
    latitude: number,
    longitude: number,
  ) => {
    await page
      .getByRole('spinbutton', { name: 'latitude' })
      .fill(String(latitude))
    await page
      .getByRole('spinbutton', { name: 'longitude' })
      .fill(String(longitude))
  }

  test('show news at a selected location', async ({ page }) => {
    await page.getByRole('link', { name: 'news' }).click()
    await expect(page).toHaveURL('/news')
    await selectLocation(page, 50.087496, 14.421181)
    await expect(page.getByTestId('news-item')).toHaveCount(3)
  })
})
