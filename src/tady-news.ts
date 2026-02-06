import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import './components/nostr-short-text-note.js'
import { ndk } from './data/ndk'

@customElement('tady-news')
export class TadyNews extends LitElement {
  @property()
  locationAuto = ''
  @property()
  locationSelected = ''

  @state()
  private _events: NDKEvent[] = []

  private _subscription: NDKSubscription | undefined = undefined

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('locationSelected')) {
      this._events = []

      if (this.locationSelected) {
        this._subscription?.stop()
        this._subscription = ndk.subscribe(
          [{ kinds: [1], '#g': [this.locationSelected.substring(0, 3)] }],
          { closeOnEose: false },
          { onEvent: e => (this._events = [...this._events, e]) },
        )
      }
    }

    return
  }

  render() {
    return html`<div>News ${this.locationSelected}</div>
      <ul class="list">
        ${repeat(
          this._events,
          event => event.id,
          event => html`
            <li>
              <nostr-short-text-note
                .nostrEvent=${event}
              ></nostr-short-text-note>
            </li>
          `,
        )}
      </ul> `
  }

  static styles = css`
    .list {
      list-style-type: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-news': TadyNews
  }
}
