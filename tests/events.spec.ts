import type NDK from '@nostr-dev-kit/ndk'
import { expect, test } from '@playwright/test'
import {
  createEvent,
  createUser,
  destroyRelays,
  prepareRelays,
  selectLocation,
} from './helpers'

test.describe('Calendar events at location', () => {
  let ndk: NDK

  test.beforeEach(async ({ page }) => {
    ndk = await prepareRelays(page)
  })

  test.afterEach(async () => {
    await destroyRelays(ndk)
  })

  test.beforeEach(async () => {
    const alice = await createUser({
      ndk,
      profile: { name: 'Alice', about: 'Test user' },
    })
    const bob = await createUser({ ndk, profile: { name: 'Bob' } })
    const cecilia = await createUser({ ndk, profile: { name: 'Cecilia' } })

    await createEvent({
      ndk,
      user: alice,
      event: {
        // https://github.com/nostr-protocol/nips/blob/master/52.md#date-based-calendar-event
        kind: 31922,
        content: '<description of calendar event>',
        tags: [
          ['d', '<random-identifier>'],

          ['title', '<title of calendar event>'],

          // dates
          ['start', '<YYYY-MM-DD>'],
          ['end', '<YYYY-MM-DD>'],

          // location
          ['location', '<location>'],
          ['g', '<geohash>'],

          // participants
          [
            'p',
            '<32-bytes hex of a pubkey>',
            '<optional recommended relay URL>',
            '<role>',
          ],
          [
            'p',
            '<32-bytes hex of a pubkey>',
            '<optional recommended relay URL>',
            '<role>',
          ],
        ],
      },
      location: 'x37cfmbv',
    })
    await createEvent({
      ndk,
      user: bob,
      event: {
        // https://github.com/nostr-protocol/nips/blob/master/52.md#time-based-calendar-event
        kind: 31923,
        content: '<description of calendar event>',
        tags: [
          ['d', '<random-identifier>'],

          ['title', '<title of calendar event>'],
          ['summary', '<brief description of the calendar event>'],
          ['image', '<string with image URI>'],

          // timestamps
          ['start', '<unix timestamp in seconds>'],
          ['end', '<unix timestamp in seconds>'],
          ['D', '82549'],

          ['start_tzid', '<IANA Time Zone Database identifier>'],
          ['end_tzid', '<IANA Time Zone Database identifier>'],

          // location
          ['location', '<location>'],
          ['g', '<geohash>'],

          // participants
          [
            'p',
            '<32-bytes hex of a pubkey>',
            '<optional recommended relay URL>',
            '<role>',
          ],
          [
            'p',
            '<32-bytes hex of a pubkey>',
            '<optional recommended relay URL>',
            '<role>',
          ],
        ],
      },
      location: 'x37cycrj',
    })
    await createEvent({
      ndk,
      user: cecilia,
      event: {
        kind: 31923,
        content:
          'This is an event content and it is happening, from April 30 till May 5, 2025.',
        tags: [
          ['d', 'random-identifier'],
          ['title', 'This is event title'],
          ['name', 'This is deprecated event title'],
          ['image', 'https://picsum.photos/500/300'],
          [
            'summary',
            'This is an event content and it is happening, from April 30 till May 5, 2025.',
          ],
          ['start', '1745964000'],
          ['end', '1746396000'],
          ['start_tzid', 'UTC'],
          ['location', 'TestPlace, CZ'],
          ['t', 'event'],
          ['t', 'testing'],
        ],
      },
      location: 'x37gtt86',
    })
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
