import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk'
import { LatLng } from 'leaflet'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import './components/nostr-short-text-note.js'
import { ndk } from './data/ndk'
import './tady-create-news.js'
import { getCircleGeohashesInRadius } from './utils/geo.js'

@customElement('tady-list')
export class TadyList extends LitElement {
  @property({ attribute: false })
  locationAuto?: LatLng
  @property({ attribute: false })
  locationSelected?: LatLng
  @property({ type: Number }) radius!: number

  @property({ type: Array }) kinds: number[] = [0]

  @state()
  private _events: NDKEvent[] = []

  private _subscription?: NDKSubscription

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (
      _changedProperties.has('locationSelected') ||
      _changedProperties.has('locationAuto') ||
      _changedProperties.has('radius') ||
      _changedProperties.has('kinds')
    ) {
      this._events = []

      const coord = this.locationSelected ?? this.locationAuto
      if (coord) {
        const geohashes = Array.from(
          getCircleGeohashesInRadius({
            coord,
            precision: 4,
            radiusMeters: this.radius,
          }),
        )

        this._subscription?.stop()
        this._subscription = ndk.subscribe(
          geohashes.map(g => ({ kinds: this.kinds, '#g': [g] })),
          { closeOnEose: false },
          {
            onEvent: e => {
              this._events = [...this._events, e]
            },
          },
        )
      }
    }

    return
  }

  render() {
    const origin: LatLng[] = []

    if (this.locationSelected) origin.push(this.locationSelected)
    if (this.locationAuto) origin.push(this.locationAuto)

    return html`<div>News ${this.locationSelected ?? this.locationAuto}</div>
      <ul class="list">
        ${repeat(
          this._events,
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
