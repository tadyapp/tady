import { SignalWatcher } from '@lit-labs/signals'
import { html, LitElement, type PropertyValues } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import geohash from 'ngeohash'
import { locationAuto, locationSelected } from '../data/location'

@customElement('geo-select-location')
export class GeoSelectLocation extends SignalWatcher(LitElement) {
  @state()
  private _latitude: number | undefined = 1
  @state()
  private _longitude: number | undefined = 1

  #onLatitudeChange(e: InputEvent) {
    const target = e.target as HTMLInputElement
    this._latitude = +target.value
  }

  #onLongitudeChange(e: InputEvent) {
    const target = e.target as HTMLInputElement
    this._longitude = +target.value
  }

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (
      _changedProperties.has('_latitude') ||
      _changedProperties.has('_longitude')
    ) {
      if (
        this._latitude === undefined ||
        this._longitude === undefined ||
        isNaN(this._latitude) ||
        isNaN(this._longitude)
      ) {
        locationSelected.set('')
      } else {
        locationSelected.set(geohash.encode(this._latitude, this._longitude))
      }
    }
  }

  render() {
    return html` <div>auto: ${locationAuto.get()}</div>
      <div>manual: ${locationSelected.get()}</div>
      <div>
        <label>latitude</label>
        <input
          type="number"
          @input=${this.#onLatitudeChange}
          value=${ifDefined(this._latitude)}
        />
      </div>
      <div>
        <label>longitude</label>
        <input
          type="number"
          @input=${this.#onLongitudeChange}
          value=${ifDefined(this._longitude)}
        />
      </div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'geo-select-location': GeoSelectLocation
  }
}
