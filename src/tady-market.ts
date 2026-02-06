import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('tady-market')
export class TadyMarket extends LitElement {
  render() {
    return html`<div>Market</div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-market': TadyMarket
  }
}
