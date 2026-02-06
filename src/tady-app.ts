import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import './tady-layout.js'

@customElement('tady-app')
export class TadyApp extends LitElement {
  render() {
    return html`<tady-layout></tady-layout>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-app': TadyApp
  }
}
