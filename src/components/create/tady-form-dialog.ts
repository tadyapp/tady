import '@awesome.me/webawesome/dist/components/dialog/dialog.js'
import type WaDialog from '@awesome.me/webawesome/dist/components/dialog/dialog.js'
import { html, LitElement } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'

@customElement('tady-form-dialog')
export class TadyFormDialog extends LitElement {
  @query('wa-dialog') private _dialog!: WaDialog

  @property() label = ''
  @property({ attribute: 'close-on' }) closeOn = 'form-submit form-reset'

  open() {
    this._dialog.open = true
  }

  close() {
    this._dialog.open = false
  }

  private _handleEvent = (e: Event) => {
    const events = this.closeOn.split(' ')
    if (events.includes(e.type)) {
      this.close()
    }
  }

  connectedCallback() {
    super.connectedCallback()
    this.closeOn.split(' ').forEach(event => {
      this.addEventListener(event, this._handleEvent)
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.closeOn.split(' ').forEach(event => {
      this.removeEventListener(event, this._handleEvent)
    })
  }

  render() {
    return html`
      <slot name="trigger" @click=${() => this.open()}></slot>
      <wa-dialog .label=${this.label}>
        <slot></slot>
        <slot name="footer" slot="footer"></slot>
      </wa-dialog>
    `
  }
}
