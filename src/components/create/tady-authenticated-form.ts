import { type NDKEvent, type NDKSigner } from '@nostr-dev-kit/ndk'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import type { NDKEventSubmitEvent } from './tady-create-news-form'
import './tady-identity-select'
import type { IdentitySelectedEvent } from './tady-identity-select'

export type AuthenticatedSubmitEvent = CustomEvent<{
  event: NDKEvent
  media: File[]
  signer: NDKSigner
}>

// Intercepts NDKEvent from form, asks for identity, re-emits the NDKEvent, signed
@customElement('tady-authenticated-form')
export class TadyAuthenticatedForm extends LitElement {
  @state() private _identityOpen = false
  @state() private _pendingEvent?: NDKEvent
  @state() private _media?: File[]

  private _handleFormSubmit(e: NDKEventSubmitEvent) {
    console.log('handling form submit', e.detail)
    e.stopPropagation()
    this._pendingEvent = e.detail.event
    this._media = e.detail.media ?? []
    this._identityOpen = true
  }

  private async _handleIdentity(e: IdentitySelectedEvent) {
    try {
      this._identityOpen = false
      if (!this._pendingEvent || !this._media || !e.detail.signer)
        throw new Error('Missing data for form authentication')

      const authenticatedEvent: AuthenticatedSubmitEvent = new CustomEvent(
        'authenticated-submit',
        {
          detail: {
            event: this._pendingEvent,
            signer: e.detail.signer,
            media: this._media,
          },
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
