import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import './tady-authenticated-form.js'
import './tady-create-calendar-event-form.js'
import './tady-form-dialog.js'
import './tady-nostr-publisher.js'

@customElement('tady-create-calendar-event')
export class TadyCreateCalendarEvent extends LitElement {
  private async _handleError(e: unknown) {
    console.error(e)
    alert(e instanceof Error ? e.message : e)
  }

  render() {
    return html`
      <tady-form-dialog
        label="Create calendar event"
        close-on="form-reset publish-success"
      >
        <wa-button slot="trigger" part="trigger" appearance="accent">
          <wa-icon name="plus" label="Create calendar event"></wa-icon>
        </wa-button>
        <!-- publishes the media and publishes the signed event -->
        <tady-nostr-publisher @publish-error=${this._handleError}>
          <!-- adds signer to the event -->
          <tady-authenticated-form>
            <!-- generates unsigned event -->
            <tady-create-calendar-event-form></tady-create-calendar-event-form>
          </tady-authenticated-form>
        </tady-nostr-publisher>
      </tady-form-dialog>
    `
  }
}
