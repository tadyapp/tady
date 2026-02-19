import '@awesome.me/webawesome/dist/components/dialog/dialog.js'
import {
  NDKNip07Signer,
  NDKPrivateKeySigner,
  type NDKSigner,
} from '@nostr-dev-kit/ndk'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export type IdentitySelectedEvent = CustomEvent<{ signer: NDKSigner }>

@customElement('tady-identity-select')
export class TadyIdentitySelect extends LitElement {
  @property({ type: Boolean }) open = false

  private _select(anonymous: boolean) {
    const signer: NDKSigner = anonymous
      ? NDKPrivateKeySigner.generate()
      : new NDKNip07Signer()

    this.dispatchEvent(
      new CustomEvent('identity-selected', {
        detail: { signer },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private _cancel() {
    this.dispatchEvent(
      new Event('identity-cancel', {
        bubbles: true,
        composed: true,
      }),
    )
  }

  render() {
    return html`
      <wa-dialog
        label="Select identity"
        ?open=${this.open}
        @wa-close=${this._cancel}
      >
        <slot>Select identity to continue:</slot>
        <button slot="footer" @click=${() => this._select(false)}>
          Sign in
        </button>
        <button slot="footer" @click=${() => this._select(true)}>
          Anonymous
        </button>
      </wa-dialog>
    `
  }
}
