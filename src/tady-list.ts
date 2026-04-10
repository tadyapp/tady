import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/button/button.styles.js'
import type { NDKEvent } from '@nostr-dev-kit/ndk'
import { LatLng } from 'leaflet'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import { dialogOpen as locationDialogOpen } from './components/geo-select-location.js'
import './components/nostr-calendar-event.js'
import './components/nostr-classified-listing.js'
import './components/nostr-short-text-note.js'
import { NostrGeoSubscription } from './controllers/geohash-subscription.js'
import type { LocationType } from './data/location.js'
import { typeKinds } from './data/things.js'
import type { EventFilter } from './utils/filter.js'
import { getCircleGeohashesInRadius } from './utils/geo.js'

@customElement('tady-list')
export class TadyList extends LitElement {
  @property({ attribute: false }) locationAuto?: LatLng
  @property({ attribute: false }) locationSelected?: LatLng
  @property({ type: Number }) radius!: number
  @property({ attribute: false }) activeLocationType: LocationType = 'auto'
  @property({ attribute: false }) filter: EventFilter = events => events

  @property({ type: Array }) kinds: number[] = [0]

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

  private renderEvent(
    event: NDKEvent,
    origins: { location: LatLng; type?: LocationType }[],
  ) {
    if (typeKinds.notes.includes(event.kind)) {
      return html`<nostr-short-text-note
        .nostrEvent=${event}
        .origins=${origins}
      ></nostr-short-text-note>`
    } else if (typeKinds.events.includes(event.kind)) {
      return html`<nostr-calendar-event
        .nostrEvent=${event}
        .origins=${origins}
      ></nostr-calendar-event>`
    } else if (typeKinds.market.includes(event.kind)) {
      return html`<nostr-classified-listing
        .nostrEvent=${event}
        .origins=${origins}
      ></nostr-classified-listing>`
    } else {
      return html`<pre>${JSON.stringify(event.rawEvent())}</pre>`
    }
  }

  render() {
    const origins: { type?: LocationType; location: LatLng }[] = []

    if (this.locationSelected && this.activeLocationType === 'manual')
      origins.push({ location: this.locationSelected, type: 'manual' })
    if (this.locationAuto)
      origins.push({ location: this.locationAuto, type: 'auto' })

    const noLocation = !this.locationSelected && !this.locationAuto

    const noEvents = this._events.events.length === 0

    if (noLocation || noEvents) {
      const message = noLocation
        ? "Set a location to see what's nearby."
        : 'Nothing here yet. Expand the radius or try a different location.'
      return html`<div aria-live="polite" aria-atomic="true">
        <p id="location-message">${message}</p>
        <wa-button
          aria-describedby="location-message"
          appearance="outlined"
          @click=${() => locationDialogOpen.set(true)}
        >
          Set location
        </wa-button>
      </div>`
    }

    return html`<ul class="list">
      ${repeat(
        this.filter(this._events.events),
        event => event.id,
        event => html`
          <li data-testid="tady-list-item">
            ${this.renderEvent(event, origins)}
          </li>
        `,
      )}
    </ul>`
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
