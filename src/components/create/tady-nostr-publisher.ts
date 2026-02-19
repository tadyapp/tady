import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ndk } from '../../data/ndk'
import type { AuthenticatedSubmitEvent } from './tady-authenticated-form'

// Listens for authenticated NDKEvent, and publishes it.
@customElement('tady-nostr-publisher')
export class TadyNostrPublisher extends LitElement {
  private async _handleAuthenticatedSubmit(e: AuthenticatedSubmitEvent) {
    try {
      const event = e.detail
      event.ndk = ndk
      await event.publish()

      this.dispatchEvent(
        new Event('publish-success', {
          bubbles: true,
          composed: true,
        }),
      )
    } catch (err) {
      this.dispatchEvent(
        new CustomEvent('publish-error', {
          detail: { error: err },
          bubbles: true,
          composed: true,
        }),
      )
    }
  }

  render() {
    return html`
      <div @authenticated-submit=${this._handleAuthenticatedSubmit}>
        <slot></slot>
      </div>
    `
  }
}
