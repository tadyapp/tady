import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import { SignalWatcher } from '@lit-labs/signals'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import './tady-authenticated-form.js'
import './tady-form-dialog.js'
import './tady-listing-form.js'
import './tady-nostr-publisher.js'

@customElement('tady-create-listing')
export class TadyCreateListing extends SignalWatcher(LitElement) {
  private async _handleError(e: unknown) {
    console.error(e)
    alert(e instanceof Error ? e.message : e)
  }
  render() {
    return html`
      <tady-form-dialog
        label="Create classified"
        close-on="form-reset publish-success"
      >
        <wa-button slot="trigger" part="trigger" appearance="accent">
          <wa-icon name="plus" label="Create classified"></wa-icon>
        </wa-button>
        <!-- publishes the media and publishes the signed event -->
        <tady-nostr-publisher @publish-error=${this._handleError}>
          <!-- adds signer to the event -->
          <tady-authenticated-form>
            <!-- generates unsigned event -->
            <tady-listing-form></tady-listing-form>
          </tady-authenticated-form>
        </tady-nostr-publisher>
      </tady-form-dialog>
    `
  }
}
