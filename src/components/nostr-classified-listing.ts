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

@customElement('nostr-classified-listing')
export class NostrClassifiedListing extends LitElement {
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

  private _getTags(tagname: string) {
    return this.nostrEvent.tags.filter(t => t[0] === tagname)
  }

  render() {
    const geohash = getEventGeohash(this.nostrEvent)
    const loc = geohash ? geohash2location(geohash) : undefined
    const dest = loc?.coords
    const precision = loc?.precision

    const title = this._getTag('title')?.[1]
    const summary = this._getTag('summary')?.[1]
    const priceTag = this._getTag('price')
    const price = (() => {
      if (!priceTag) return undefined
      if (priceTag[1] === '0') return 'FREE'
      return priceTag.slice(1).join(' ')
    })()

    const categories = this._getTags('t').map(tag => tag[1])

    const image = this._getTag('image')?.[1]

    return html`<article class="listing">
        <figure class="image-panel">
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
            <div class="tools">
              <nostr-event-preview-raw
                .event=${this.nostrEvent}
              ></nostr-event-preview-raw>
            </div>
          </div>
          <header class="info-header">
            <h3>${title}</h3>
            <div class="price">${price}</div>
          </header>

          <div class="categories">
            ${categories.map(c => html`<span>${c}</span>`)}
          </div>

          <p>${summary}</p>
        </div>
      </article>
      <div class="wip">
        <div>
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
        </div>
        <div class="tools">
          <nostr-event-preview-raw
            .event=${this.nostrEvent}
          ></nostr-event-preview-raw>
        </div>
        <div>${title}</div>
        <nostr-avatar .profile=${this._author}></nostr-avatar>
        <span class="name">${this._author?.displayName}</span>
        <span>${this._author?.nip05}</span>
        ${this.nostrEvent.created_at
          ? html`<span>
              ${new Intl.DateTimeFormat('en', {
                dateStyle: 'medium',
              }).format(this.nostrEvent.created_at * 1000)}
            </span>`
          : null}
      </div>`
  }

  static styles = css`
    img {
      object-fit: cover;
      object-position: center;
    }

    figure {
      all: unset;
    }

    .wip {
      display: none;
    }

    .listing {
      display: flex;
      gap: 1rem;
      border-top: 1px solid var(--text-color);
      padding-top: 0.5rem;
    }

    .image-panel {
      flex: 0 0 8rem;
    }

    .info-panel {
      flex: 1;
      min-width: 0;
    }

    .info-header,
    .info-tools-wip {
      display: flex;
      justify-content: space-between;

      h3 {
        margin: 0;
      }
    }

    .categories {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .price {
      color: green;
      font-weight: bold;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'nostr-classified-listing': NostrClassifiedListing
  }
}
