import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
import { LatLng } from 'leaflet'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import type { LocationType } from '../data/location.js'
import {
  formatDistance,
  geohash2location,
  getEventGeohash,
} from '../utils/geo.js'
import './geo-direction.js'
import './nostr-avatar.js'
import './nostr-content.js'
import './nostr-event-preview-raw.js'
import './nostr-social.js'

@customElement('nostr-calendar-event')
export class NostrCalendarEvent extends LitElement {
  @property({ attribute: false })
  nostrEvent!: NDKEvent

  @property({ attribute: false })
  origins: { location: LatLng; type?: LocationType }[] = []

  @state()
  private _author: NDKUserProfile | null = null

  protected async willUpdate(_changedProperties: PropertyValues) {
    if (_changedProperties.has('nostrEvent')) {
      this._author = await this.nostrEvent.author.fetchProfile()
    }
  }

  private _getTag(tagname: string) {
    return this.nostrEvent.tags.find(t => t[0] === tagname)
  }

  // private _getTags(tagname: string) {
  //   return this.nostrEvent.tags.filter(t => t[0] === tagname)
  // }

  render() {
    const geohash = getEventGeohash(this.nostrEvent)
    const loc = geohash ? geohash2location(geohash) : undefined
    const dest = loc?.coords
    const precision = loc?.precision

    const title = this._getTag('title')?.[1]
    const summary = this._getTag('summary')?.[1]
    const image = this._getTag('image')?.[1]
    const start = this._getTag('start')?.[1]
    const end = this._getTag('end')?.[1]
    // const startTz = this._getTag('start_tzid')?.[1]
    // const endTz = this._getTag('end_tzid')?.[1] ?? startTz

    const startDate = new Date(Number(start) * 1000).toLocaleString()
    const endDate = new Date(Number(end) * 1000).toLocaleString()

    return html`<article class="calendar-event">
      <figure>
        <img src=${ifDefined(image)} width="128" height="128" />
      </figure>
      <div class="info-panel">
        <div class="info-tools-wip">
          <div>
            <span>
              <nostr-avatar .profile=${this._author}></nostr-avatar>
              <span class="name">${this._author?.displayName}</span>
              <span>${this._author?.nip05}</span>
            </span>
            <span>
              ${this.origins.map(
                o =>
                  html`<geo-direction
                    .origin=${o.location}
                    .dest=${dest}
                  ></geo-direction> `,
              )}
              ${typeof precision === 'number'
                ? html`<span>&plusmn; ${formatDistance(precision)}</span>`
                : null}
            </span>
          </div>
          <div>
            <nostr-event-preview-raw
              .event=${this.nostrEvent}
            ></nostr-event-preview-raw>
          </div>
        </div>

        <div>${startDate} - ${endDate}</div>

        <header class="info-header">
          <h3>${title}</h3>
        </header>

        <p>${summary}</p>
      </div>
    </article>`
  }

  static styles = css`
    .calendar-event {
      display: flex;
      gap: 1rem;
      border-top: 1px solid var(--text-color);
      padding-top: 0.5rem;

      figure {
        all: unset;

        img {
          object-fit: cover;
          object-position: center;
        }
      }
    }

    .info-panel {
      flex: 1;
      min-width: 0;
    }

    .info-tools-wip {
      display: flex;
      justify-content: space-between;

      h3 {
        margin: 0;
      }
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'nostr-calendar-event': NostrCalendarEvent
  }
}
