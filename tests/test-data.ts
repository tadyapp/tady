import NDK, { NDKRawEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
import { createEvent, createUser, User } from './helpers'

export async function createTestEvents(
  events: {
    location: string
    event: Partial<NDKRawEvent>
    user?: User
    profile?: NDKUserProfile
  }[],
  { ndk }: { ndk: NDK },
) {
  for (const eventData of events) {
    const { event, location, profile } = eventData

    const user = eventData.user ?? (await createUser({ ndk, profile }))

    await createEvent({
      ndk,
      user,
      event,
      location,
    })
  }
}

type userIdentifier = 'alice' | 'bob' | 'cecilia'

export const testProfiles: Record<userIdentifier, NDKUserProfile> = {
  alice: { name: 'Alice', about: 'Test user' },
  bob: { name: 'Bob' },
  cecilia: { name: 'Cecilia' },
}

const { alice, bob, cecilia } = testProfiles

export const testNotes = [
  {
    profile: alice,
    event: { content: 'Test content', kind: 1 },
    location: 'u2fkb05',
  },
  {
    event: { content: 'Other test event', kind: 1 },
    location: 'u2fm6v',
  },
  {
    event: { content: 'Yet another test event', kind: 1 },
    location: 'u2fhzvvh',
  },
]

export const testCalendarEvents = [
  {
    profile: alice,
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
        // ['g', '<geohash>'],

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
  },
  {
    profile: bob,
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
        // ['g', '<geohash>'],

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
  },
  {
    profile: cecilia,
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
  },
]

export const testClassifieds = [
  {
    profile: alice,
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
  },
  {
    profile: bob,
    event: {
      kind: 30402,
      tags: [
        ['title', 'Test title'],
        ['price', '10.5', 'EUR'],
      ],
    },
    location: 'x37cycrj',
  },
  {
    profile: cecilia,
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
  },
]
