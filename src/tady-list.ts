import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/button/button.styles.js'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { getDistance } from 'geolib'
import { LatLng } from 'leaflet'
import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import './components/nostr-short-text-note.js'
import { NostrGeoSubscription } from './controllers/geohash-subscription.js'
import type { LocationType } from './data/location.js'
import './tady-create-news.js'
import {
  geohash2location,
  getCircleGeohashesInRadius,
  getEventGeohash,
} from './utils/geo.js'

@customElement('tady-list')
export class TadyList extends LitElement {
  @property({ attribute: false }) locationAuto?: LatLng
  @property({ attribute: false }) locationSelected?: LatLng
  @property({ type: Number }) radius!: number
  @property({ attribute: false }) activeLocationType: LocationType = 'auto'

  @property({ type: Array }) kinds: number[] = [0]

  @property({ attribute: false }) filters = new Map<
    string,
    {
      filter: (events: NDKEvent[]) => NDKEvent[]
      exclude?: string[]
    }
  >([
    [
      'latest',
      {
        filter: events =>
          events.sort((a, b) =>
            a.created_at && b.created_at ? b.created_at - a.created_at : 0,
          ),
        exclude: ['nearest'],
      },
    ],
    [
      'nearest',
      {
        filter: events => {
          const activeLocation =
            this.activeLocationType === 'manual'
              ? this.locationSelected
              : this.locationAuto

          if (!activeLocation) return events

          return events.sort(
            (a, b) =>
              eventDistance(a, activeLocation) -
              eventDistance(b, activeLocation),
          )
        },
        exclude: ['latest'],
      },
    ],
  ])

  @state()
  private selectedFilters = new Set<string>()

  private _events = new NostrGeoSubscription(this, {
    geohashes: () => {
      const location =
        this.activeLocationType === 'manual'
          ? this.locationSelected
          : this.locationAuto

      if (!location) return []

      return getCircleGeohashesInRadius({
        coord: location,
        precision: 4,
        radiusMeters: this.radius,
      })
    },
    kinds: () => this.kinds,
  })

  render() {
    const origins: { type?: LocationType; location: LatLng }[] = []

    if (this.locationSelected && this.activeLocationType === 'manual')
      origins.push({ location: this.locationSelected, type: 'manual' })
    if (this.locationAuto)
      origins.push({ location: this.locationAuto, type: 'auto' })

    let filteredEvents = [...this._events.events]

    for (const filter of this.selectedFilters) {
      filteredEvents =
        this.filters.get(filter)?.filter(filteredEvents) ?? filteredEvents
    }

    return html`<div
        role="toolbar"
        aria-labelledby="filter-heading"
        class="filters"
      >
        <header id="filter-heading">
          <wa-icon name="filter" label="Filter results"></wa-icon>
        </header>
        ${repeat(
          this.filters.entries(),
          filter => filter[0],
          ([key, filter]) => {
            const active = this.selectedFilters.has(key)
            return html`<wa-button
              aria-pressed=${active ? 'true' : 'false'}
              size="small"
              pill
              appearance=${active ? 'accent' : 'outlined'}
              @click=${() => {
                const nextFilters = new Set(this.selectedFilters)
                if (nextFilters.has(key)) nextFilters.delete(key)
                else {
                  nextFilters.add(key)
                  filter.exclude?.forEach(excl => {
                    nextFilters.delete(excl)
                  })
                }
                this.selectedFilters = nextFilters
              }}
              >${key}</wa-button
            >`
          },
        )}
      </div>

      <ul class="list">
        ${repeat(
          filteredEvents,
          event => event.id,
          event => html`
            <li data-testid="news-item">
              <nostr-short-text-note
                .nostrEvent=${event}
                .origins=${origins}
              ></nostr-short-text-note>
            </li>
          `,
        )}
      </ul>

      <tady-create-news></tady-create-news>`
  }

  static styles = css`
    .list {
      list-style-type: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    tady-create-news::part(trigger) {
      display: block;
      position: fixed;
      right: 2rem;
      bottom: 2rem;
    }

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      margin: 0.5rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-list': TadyList
  }
}

function eventDistance(event: NDKEvent, origin: LatLng) {
  const geohash = getEventGeohash(event)
  if (geohash) {
    const eventLocation = geohash2location(geohash).coords
    return getDistance(eventLocation, origin)
  }
  return 100_000_000 // more than any distance on earth
}
