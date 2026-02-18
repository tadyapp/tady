import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
import { LatLng } from 'leaflet'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
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

@customElement('nostr-short-text-note')
export class NostrShortTextNote extends LitElement {
  @property({ attribute: false })
  nostrEvent!: NDKEvent

  @property({ attribute: false })
  origins: { location: LatLng; label?: 'manual' | 'auto' }[] = []

  @state()
  private _author: NDKUserProfile | null = null

  protected async willUpdate(_changedProperties: PropertyValues) {
    if (_changedProperties.has('nostrEvent')) {
      this._author = await this.nostrEvent.author.fetchProfile()
    }
  }

  render() {
    const geohash = getEventGeohash(this.nostrEvent)
    const loc = geohash ? geohash2location(geohash) : undefined
    const dest = loc?.coords
    const precision = loc?.precision

    return html`<div class="note">
      <div class="avatar-panel">
        <nostr-avatar .profile=${this._author}></nostr-avatar>
      </div>
      <div class="content-panel">
        <header>
          <div class="top-wrapper">
            <div class="meta">
              <span class="name">${this._author?.displayName}</span>
              <span>${this._author?.nip05}</span>
              ${this.nostrEvent.created_at
                ? html`<span>
                    ${new Intl.DateTimeFormat('en', {
                      dateStyle: 'medium',
                    }).format(this.nostrEvent.created_at * 1000)}
                  </span>`
                : null}
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
            </div>
            <div class="tools">
              <nostr-event-preview-raw
                .event=${this.nostrEvent}
              ></nostr-event-preview-raw>
            </div>
          </div>
        </header>
        <div class="content">
          <nostr-content .event=${this.nostrEvent}></nostr-content>
          <nostr-social eventId=${this.nostrEvent.id}></nostr-social>
        </div>
      </div>
    </div>`
  }

  static styles = css`
    .note {
      display: flex;
      gap: 0.5rem;
      border-top: 1px solid var(--text-color);
      padding-top: 0.5rem;
    }

    .avatar-panel {
      flex: 0 0 2.5rem;
    }

    .content-panel {
      min-width: 0;
      overflow-wrap: break-word;
      flex: 1;
    }

    .avatar {
      width: 2.5rem;
      min-height: 2.5rem;
      max-height: 3rem;
      object-fit: cover;
    }

    nostr-avatar {
      --avatar-size: 2.5rem;
    }

    .name {
      font-weight: bold;
    }

    .top-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'nostr-short-text-note': NostrShortTextNote
  }
}
