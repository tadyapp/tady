import NDK from '@nostr-dev-kit/ndk'
import { expect, test } from '@playwright/test'
import {
  createEvent,
  createUser,
  destroyRelays,
  setupNip07,
  setupTestRelay,
  updateAppRelays,
} from './helpers'

test.describe('Create a calendar event', () => {
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
    await createEvent({
      ndk,
      user: await createUser(),
      event: {
        content: 'Test content',
        kind: 31923,
        tags: [
          ['title', 'test1'],
          ['d', 'unique-event-1'],
        ],
      },
      location: [25.64166, 39.56, 8],
    })
    await createEvent({
      ndk,
      user: await createUser(),
      event: {
        content: 'Test content 2',
        kind: 31923,
        tags: [
          ['title', 'test2'],
          ['d', 'unique-event-2'],
        ],
      },
      location: [25.64165, 39.55, 7],
    })
  })
  ;['sign in', 'anonymous'].forEach(userType => {
    test.use({ permissions: ['geolocation'] })
    test(`create a calendar event successfully with ${userType} user`, async ({
      page,
      context,
    }) => {
      const startDate = new Date(Date.now() + 7 * 24 * 3600 * 1000)
      startDate.setSeconds(0, 0)
      const endDate = new Date(Date.now() + 14 * 24 * 3600 * 1000)
      endDate.setSeconds(0, 0)

      const localDatetime = (date: Date): string =>
        new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)

      await context.setGeolocation({
        latitude: 25.641659,
        longitude: 39.558838,
      })

      const items = page.getByTestId('tady-list-item')
      const dialog = page
        .getByRole('dialog')
        .filter({ hasText: 'create calendar event' })

      await page.getByRole('link', { name: 'events' }).click()
      await expect(page).toHaveURL('/events')

      await expect(items).toHaveCount(2)

      await page.getByRole('button', { name: 'create calendar event' }).click()
      await expect(dialog).toBeVisible()
      await page
        .getByRole('textbox', { name: 'start' })
        .fill(localDatetime(startDate))
      await page
        .getByRole('textbox', { name: 'end' })
        .fill(localDatetime(endDate))
      await page
        .getByRole('textbox', { name: 'title' })
        .fill('This is event title.')
      await page
        .getByRole('textbox', { name: 'summary' })
        .fill('This is event summary.')
      await page
        .getByRole('textbox', { name: 'content' })
        .fill('This is event\nmultiline\ncontent.')
      await page
        .getByRole('textbox', { name: 'location' })
        .fill('This is text description of event location.')

      // increase precision
      await page.locator('#geohash-precision #thumb').click()
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowRight')

      // submit the data
      await page.getByRole('button', { name: 'submit' }).click()
      await page.getByRole('button', { name: userType }).click()
      await expect(dialog).not.toBeVisible()

      await expect(items).toHaveCount(3)

      await page.getByRole('button', { name: 'nearest' }).click()

      const newItem = items.nth(0)

      expect(newItem).toContainText('This is event title.')
      expect(newItem).toContainText('This is event summary.')
      expect(newItem.getByRole('time').nth(0)).toHaveAttribute(
        'datetime',
        startDate.toISOString(),
      )
      expect(newItem.getByRole('time').nth(1)).toHaveAttribute(
        'datetime',
        endDate.toISOString(),
      )
    })
  })
})
