import type NDK from '@nostr-dev-kit/ndk'
import { expect, test } from '@playwright/test'
import {
  createEvent,
  createUser,
  destroyRelays,
  prepareRelays,
  selectLocation,
} from './helpers'

test.describe('Classified listings (marketplace) at location', () => {
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
        // https://github.com/nostr-protocol/nips/blob/master/99.md#example-event
        kind: 30402,
        created_at: 1675642635,
        // Markdown content
        content:
          'Lorem [ipsum][nostr:nevent1qqst8cujky046negxgwwm5ynqwn53t8aqjr6afd8g59nfqwxpdhylpcpzamhxue69uhhyetvv9ujuetcv9khqmr99e3k7mg8arnc9] dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nRead more at nostr:naddr1qqzkjurnw4ksz9thwden5te0wfjkccte9ehx7um5wghx7un8qgs2d90kkcq3nk2jry62dyf50k0h36rhpdtd594my40w9pkal876jxgrqsqqqa28pccpzu.',
        tags: [
          ['d', 'lorem-ipsum'],
          ['title', 'Lorem Ipsum'],
          ['published_at', '1296962229'],
          ['t', 'electronics'],
          ['image', 'https://picsum.photos/200/300', '200x300'],
          ['summary', 'More lorem ipsum that is a little more than the title'],
          ['location', 'NYC'],
          ['price', '100', 'USD'],
          [
            'e',
            'b3e392b11f5d4f28321cedd09303a748acfd0487aea5a7450b3481c60b6e4f87',
            'wss://relay.example.com',
          ],
          [
            'a',
            '30023:a695f6b60119d9521934a691347d9f78e8770b56da16bb255ee286ddf9fda919:ipsum',
            'wss://relay.nostr.org',
          ],
        ],
      },
      location: 'x37cfmbv',
    })
    await createEvent({
      ndk,
      user: bob,
      event: {
        kind: 30402,
        tags: [['title', 'Test title']],
      },
      location: 'x37cycrj',
    })
    await createEvent({
      ndk,
      user: cecilia,
      event: {
        // https://github.com/GammaMarkets/market-spec/blob/main/spec.md#3-events-and-kinds
        kind: 30402,
        content: '<product description in markdown>',
        tags: [
          // Required tags
          ['d', '<product identifier>'],
          ['title', '<product title>'],
          ['price', '<amount>', '<currency>', '<optional frequency>'],

          // Product details
          ['type', '<simple|variable|variation>', '<digital|physical>'], // Defaults: simple, digital
          ['visibility', '<hidden|on-sale|pre-order>'], // Default: on-sale
          ['stock', '<integer>'], // Available quantity
          ['summary', '<short description>'],

          // Media and specs
          ['image', 'https://picsum.photos/300/200', '300x200'],
          ['image', '<url>', '<dimensions>', '<sorting-order>'],
          ['spec', '<key>', '<value>'], // Product specifications (e.g., "screen-size", "21 inch"). MAY appear multiple times

          // Physical properties (for shipping)
          ['weight', '<value>', '<unit>'], // ISO 80000-1 units (g, kg, etc)
          ['dim', '<l>x<w>x<h>', '<unit>'], // ISO 80000-1 units (mm, cm, m)

          // Location
          ['location', '<address string>'],
          // ['g', '<geohash>'],

          // Classifications
          ['t', '<category>'],

          // References
          // ['shipping_option', '<30406|30405>:<pubkey>:<d-tag>', '<extra-cost>'], // Shipping options or collection, MAY appear multiple times
          // ['a', '30405:<pubkey>:<d-tag>'], // Product collection
        ],
      },
      location: 'x37gtt86',
    })
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
