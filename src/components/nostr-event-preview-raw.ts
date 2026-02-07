import '@awesome.me/webawesome/dist/components/copy-button/copy-button.js'
import '@awesome.me/webawesome/dist/components/dialog/dialog.js'
import type WaDialog from '@awesome.me/webawesome/dist/components/dialog/dialog.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import type { NDKEvent } from '@nostr-dev-kit/ndk'
import { css, html, LitElement } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'

@customElement('nostr-event-preview-raw')
export class NostrEventPreviewRaw extends LitElement {
  @property({ attribute: false })
  event!: NDKEvent

  @query('#event-preview-dialog')
  _dialog!: WaDialog

  _open() {
    this._dialog.open = true
  }

  _close() {
    this._dialog.open = false
  }

  @state()
  _pretty = false

  _handleChangePretty(e: Event) {
    this._pretty = (e.target as HTMLInputElement).checked
  }

  render() {
    const value = JSON.stringify(
      this.event.rawEvent(),
      null,
      this._pretty ? 2 : undefined,
    )

    return html`<button @click=${this._open}>
        <wa-icon name="code" label="Preview raw event"></wa-icon>
      </button>
      <wa-dialog id="event-preview-dialog" light-dismiss label="Event source">
        <label slot="header-actions" class="pretty-check">
          pretty
          <input
            type="checkbox"
            @change=${this._handleChangePretty}
            .checked=${this._pretty}
          />
        </label>
        <wa-copy-button slot="header-actions" value=${value}></wa-copy-button>
        <pre class="raw-event">${value}</pre>
      </wa-dialog>`
  }

  static styles = css`
    ::part(dialog) {
      color: var(--text-color);
      background-color: var(--background-color);
      --width: 48rem;
      max-width: 90vw;
    }

    .raw-event {
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }

    .pretty-check {
      display: flex;
      align-items: center;
    }

    ::part(header-actions) {
      align-items: center;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'nostr-event-preview-raw': NostrEventPreviewRaw
  }
}
