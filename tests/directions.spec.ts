import NDK from '@nostr-dev-kit/ndk'
import { expect, test } from '@playwright/test'
import { destroyRelays, prepareRelays, selectLocation } from './helpers'
import {
  createTestEvents,
  testCalendarEvents,
  testClassifieds,
  testNotes,
} from './test-data'

test.describe('Show direction at notes', () => {
  let ndk: NDK

  test.beforeEach(async ({ page }) => {
    ndk = await prepareRelays(page)
  })

  test.afterEach(async () => {
    await destroyRelays(ndk)
  })
  ;[
    {
      eventType: 'note',
      link: 'notes',
      testData: testNotes,
      location: [50.087496, 14.421181],
      distance: '3.7km',
      itemIndex: 0,
      sortedIndex: 1,
    },
    {
      eventType: 'calendar event',
      link: 'events',
      testData: testCalendarEvents,
      location: [7.35, 151.83],
      distance: '22.9km',
      itemIndex: 0,
      sortedIndex: 1,
    },
    {
      eventType: 'classified listing',
      link: 'market',
      testData: testClassifieds,
      location: [7.35, 151.83],
      distance: '370m',
      itemIndex: 1,
      sortedIndex: 0,
    },
  ].forEach(config => {
    test(`show direction from app location to the ${config.eventType} (${config.link})`, async ({
      page,
    }) => {
      await createTestEvents(config.testData, { ndk })
      await page.getByRole('link', { name: config.link }).click()
      await expect(page).toHaveURL(`/${config.link}`)
      await selectLocation(page, config.location[0], config.location[1])

      await page.getByRole('button', { name: 'nearest' }).click()

      const directionSelector = page
        .getByTestId('tady-list-item')
        .nth(config.sortedIndex)
        .getByTestId('geo-direction')

      await expect(directionSelector).toBeVisible()
      await expect(directionSelector).toContainText(config.distance)

      await directionSelector.click()

      const dialogSelector = page.getByRole('dialog')
      await expect(dialogSelector).toBeVisible()

      const testedGeohash = config.testData[config.itemIndex].location

      await expect(
        page.locator(
          `.destination-geohash.destination-geohash-${testedGeohash}`,
        ),
      ).toBeVisible()
    })
  })

  test.fixme('[some geohash is invalid]', () => {})
})
