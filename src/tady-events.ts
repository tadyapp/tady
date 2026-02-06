import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('tady-events')
export class TadyEvents extends LitElement {
  render() {
    return html`<div>Events</div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-events': TadyEvents
  }
}
