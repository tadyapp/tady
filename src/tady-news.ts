import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk'
import { LatLng } from 'leaflet'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import { getRelevantGeohashes } from './components/leaflet-select-location.js'
import './components/nostr-short-text-note.js'
import { ndk } from './data/ndk'
import './tady-create-news.js'

@customElement('tady-news')
export class TadyNews extends LitElement {
  @property({ attribute: false })
  locationAuto?: LatLng
  @property({ attribute: false })
  locationSelected?: LatLng

  @state()
  private _events: NDKEvent[] = []

  private _subscription?: NDKSubscription

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (
      _changedProperties.has('locationSelected') ||
      _changedProperties.has('locationAuto')
    ) {
      this._events = []

      const coord = this.locationSelected ?? this.locationAuto
      if (coord) {
        const geohashes = Array.from(
          getRelevantGeohashes({ coord, precision: 4, rings: 1 }),
        )

        this._subscription?.stop()
        this._subscription = ndk.subscribe(
          geohashes.map(g => ({ kinds: [1], '#g': [g] })),
          { closeOnEose: false },
          {
            onEvent: e => {
              console.log(e)
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
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-news': TadyNews
  }
}
