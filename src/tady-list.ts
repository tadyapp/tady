import { LatLng } from 'leaflet'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import './components/nostr-short-text-note.js'
import { NostrGeoSubscription } from './controllers/geohash-subscription.js'
import './tady-create-news.js'
import { getCircleGeohashesInRadius } from './utils/geo.js'

@customElement('tady-list')
export class TadyList extends LitElement {
  @property({ attribute: false }) locationAuto?: LatLng
  @property({ attribute: false }) locationSelected?: LatLng
  @property({ type: Number }) radius!: number
  @property({ attribute: false }) activeLocationType: 'auto' | 'manual' = 'auto'

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

  render() {
    const origin: LatLng[] = []

    if (this.locationSelected) origin.push(this.locationSelected)
    if (this.locationAuto) origin.push(this.locationAuto)

    return html`<div>News ${this.locationSelected ?? this.locationAuto}</div>
      <ul class="list">
        ${repeat(
          this._events.events,
          event => event.id,
          event => html`
            <li data-testid="news-item">
              <nostr-short-text-note
                .nostrEvent=${event}
                .origin=${origin}
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
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-list': TadyList
  }
}
