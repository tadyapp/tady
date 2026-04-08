import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import './tady-authenticated-form.js'
import './tady-create-note-form.js'
import './tady-form-dialog.js'
import './tady-nostr-publisher.js'

@customElement('tady-create-note')
export class TadyCreateNote extends LitElement {
  private async _handleError(e: unknown) {
    console.error(e)
    alert(e instanceof Error ? e.message : e)
  }

  render() {
    return html`
      <tady-form-dialog
        label="Create note"
        close-on="form-reset publish-success"
      >
        <wa-button slot="trigger" part="trigger" appearance="accent">
          <wa-icon name="plus" label="Create note"></wa-icon>
        </wa-button>
        <!-- publishes the event -->
        <tady-nostr-publisher @publish-error=${this._handleError}>
          <!-- signs the event -->
          <tady-authenticated-form>
            <!-- generates unsigned event -->
            <tady-create-note-form></tady-create-note-form>
          </tady-authenticated-form>
        </tady-nostr-publisher>
      </tady-form-dialog>
    `
  }

  static styles = css`
    tady-form-dialog::part(trigger) {
      display: block;
      position: fixed;
      right: 2rem;
      bottom: 2rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-create-note': TadyCreateNote
  }
}
