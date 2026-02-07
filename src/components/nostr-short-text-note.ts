import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
import { LatLng } from 'leaflet'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import ngeohash from 'ngeohash'
import './geo-direction.js'
import { errorInDegreesToMeters, formatDistance } from './geo-direction.js'
import './nostr-content.js'
import './nostr-social.js'

@customElement('nostr-short-text-note')
export class NostrShortTextNote extends LitElement {
  @property({ attribute: false })
  nostrEvent!: NDKEvent

  @property({ attribute: false })
  origin: LatLng[] = []

  @state()
  private _author: NDKUserProfile | null = null

  protected async willUpdate(_changedProperties: PropertyValues) {
    if (_changedProperties.has('nostrEvent')) {
      this._author = await this.nostrEvent.author.fetchProfile()
    }
  }

  render() {
    const geohash = this.nostrEvent.tags
      .filter(tag => tag[0] === 'g')
      .map(tag => tag[1])
      .filter(g => Boolean(g))
      .sort((a, b) => a.length - b.length)
      .pop()

    const loc = geohash ? ngeohash.decode(geohash) : undefined
    const dest = loc ? new LatLng(loc.latitude, loc.longitude) : undefined
    const locError = loc ? errorInDegreesToMeters(loc) : undefined
    const precision =
      locError && (locError.latitude ** 2 + locError.longitude ** 2) ** 0.5

    return html`<div class="note">
      <div class="avatar-panel">
        <img class="avatar" src=${ifDefined(this._author?.picture)} />
      </div>
      <div class="content-panel">
        <div>
          <span class="name">${this._author?.displayName}</span>
          <span>${this._author?.nip05}</span>
          ${this.nostrEvent.created_at
            ? html`<span>
                ${new Intl.DateTimeFormat('en', {
                  dateStyle: 'medium',
                }).format(this.nostrEvent.created_at * 1000)}
              </span>`
            : null}
        </div>
        <div>
          ${this.origin.map(
            o => html`
              <geo-direction .origin=${o} .dest=${dest}></geo-direction>
            `,
          )}
          ${typeof precision === 'number'
            ? html`<span>&plusmn; ${formatDistance(precision)}</span>`
            : null}
        </div>
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
    }

    .avatar-panel {
      flex: 0 0 2.5rem;
    }

    .content-panel {
      min-width: 0;
      overflow-wrap: break-word;
    }

    .avatar {
      width: 2.5rem;
      min-height: 2.5rem;
      max-height: 3rem;
      object-fit: cover;
    }

    .name {
      font-weight: bold;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'nostr-short-text-note': NostrShortTextNote
  }
}
