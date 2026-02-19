// tady-authenticated-form.ts

import { type NDKEvent } from '@nostr-dev-kit/ndk'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import type { NDKEventSubmitEvent } from './tady-create-news-form'
import type { IdentitySelectedEvent } from './tady-identity-select'

export type AuthenticatedSubmitEvent = CustomEvent<NDKEvent>

// Intercepts form-submit, asks for identity, re-emits with signer
@customElement('tady-authenticated-form')
export class TadyAuthenticatedForm extends LitElement {
  @state() private _identityOpen = false
  @state() private _pendingEvent?: NDKEvent

  private _handleFormSubmit(e: NDKEventSubmitEvent) {
    console.log('handling form submit', e.detail)
    e.stopPropagation()
    this._pendingEvent = e.detail
    this._identityOpen = true
  }

  private async _handleIdentity(e: IdentitySelectedEvent) {
    try {
      this._identityOpen = false
      await this._pendingEvent?.sign(e.detail.signer)
      const authenticatedEvent: AuthenticatedSubmitEvent = new CustomEvent(
        'authenticated-submit',
        {
          detail: this._pendingEvent,
          bubbles: true,
          composed: true,
        },
      )

      this.dispatchEvent(authenticatedEvent)
    } catch (e) {
      this.dispatchEvent(
        new CustomEvent('authentication-error', {
          detail: e,
          bubbles: true,
          composed: true,
        }),
      )
      alert(e instanceof Error ? e.message : e)
    }
  }

  private _handleCancel() {
    this._identityOpen = false
  }

  render() {
    return html`
      <div @form-submit=${this._handleFormSubmit}>
        <slot></slot>
      </div>
      <tady-identity-select
        ?open=${this._identityOpen}
        @identity-selected=${this._handleIdentity}
        @identity-cancel=${this._handleCancel}
      ></tady-identity-select>
    `
  }
}
