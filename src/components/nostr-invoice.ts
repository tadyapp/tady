import '@awesome.me/webawesome/dist/components/card/card.js'
import '@awesome.me/webawesome/dist/components/copy-button/copy-button.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/components/popover/popover.js'
import '@awesome.me/webawesome/dist/components/qr-code/qr-code.js'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('nostr-invoice')
export class NostrInvoice extends LitElement {
  @property()
  invoice!: string

  render() {
    const href = `lightning:${this.invoice}`
    const short = html`${this.invoice.slice(0, 15)}&hellip;${this.invoice.slice(
      -3,
    )}`

    return html`<wa-card>
      <header slot="header">
        <wa-icon name="bolt"></wa-icon>
        BOLT11 Invoice
        <a href=${href}>${short}</a>
      </header>
      <a href=${href}>Pay Invoice</a>
      <wa-copy-button value=${this.invoice}></wa-copy-button>
      <button id="popover-barcode"><wa-icon name="qrcode"></wa-icon></button>
      <wa-popover for="popover-barcode">
        <wa-qr-code error-correction="L" value=${href}></wa-qr-code>
      </wa-popover>
    </wa-card>`
  }

  static styles = css`
    wa-card {
      background-color: var(--background-color);
      color: var(--text-color);
      white-space: normal;
    }

    ::part(header),
    ::part(body) {
      padding: 0.75rem;
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    wa-popover,
    wa-qr-code {
      background-color: white;
      color: black;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'nostr-invoice': NostrInvoice
  }
}
