import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('tady-unix-time')
export class TadyUnixTime extends LitElement {
  @property() unixTimestamp!: string

  render() {
    if (!this.unixTimestamp) return html`<span>Missing date</span>`
    if (isNaN(+this.unixTimestamp))
      return html`<span>${this.unixTimestamp}</span>`
    return html`<time
      datetime=${new Date(+this.unixTimestamp * 1000).toISOString()}
      >${new Date(+this.unixTimestamp * 1000).toLocaleString()}</time
    >`
  }
}
