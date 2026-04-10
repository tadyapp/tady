import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/button/button.styles.js'
import type { LatLng } from 'leaflet'
import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import './geo-direction-map.js'

@customElement('geo-direction-dialog')
export class GeoDirectionDialog extends LitElement {
  @property({ attribute: false }) origin!: LatLng
  @property() destination!: string

  @state() open = false

  render() {
    return html`<wa-dialog
        light-dismiss
        .open=${this.open}
        @wa-after-hide=${() => {
          this.open = false
        }}
      >
        ${this.open
          ? html`<geo-direction-map
              .origin=${this.origin}
              .destination=${this.destination}
            ></geo-direction-map>`
          : null}
      </wa-dialog>
      <wa-button
        class="trigger"
        appearance="plain"
        @click=${() => {
          this.open = true
        }}
      >
        <slot></slot>
      </wa-button>`
  }

  static styles = css`
    .trigger::part(base) {
      padding: 0;
      height: unset;
      line-height: unset;
    }
    .trigger::part(label) {
      padding: 0;
      height: unset;
      line-height: unset;
    }
  `
}
