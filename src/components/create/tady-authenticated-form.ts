// tady-authenticated-form.ts

import type { NDKSigner } from '@nostr-dev-kit/ndk'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import type { IdentitySelectedEvent } from './tady-identity-select'

export type AuthenticatedSubmitEvent<T = unknown> = CustomEvent<{
  values: T
  signer: NDKSigner
}>

// Intercepts form-submit, asks for identity, re-emits with signer
@customElement('tady-authenticated-form')
export class TadyAuthenticatedForm extends LitElement {
  @state() private _identityOpen = false
  @state() private _pendingDetail: unknown

  private _handleFormSubmit(e: CustomEvent) {
    console.log('handling form submit')
    e.stopPropagation()
    this._pendingDetail = e.detail
    this._identityOpen = true
  }

  private _handleIdentity(e: IdentitySelectedEvent) {
    this._identityOpen = false
    const customEvent: AuthenticatedSubmitEvent = new CustomEvent(
      'authenticated-submit',
      {
        detail: {
          values: this._pendingDetail,
          signer: e.detail.signer,
        },
        bubbles: true,
        composed: true,
      },
    )

    this.dispatchEvent(customEvent)
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
