import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import './nostr-content.js'
import './nostr-social.js'

@customElement('nostr-short-text-note')
export class NostrShortTextNote extends LitElement {
  @property({ type: Object })
  nostrEvent!: NDKEvent

  @state()
  private _author: NDKUserProfile | null = null

  protected async willUpdate(_changedProperties: PropertyValues) {
    if (_changedProperties.has('nostrEvent')) {
      this._author = await this.nostrEvent.author.fetchProfile()
    }
  }

  render() {
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
