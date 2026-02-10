import { SignalWatcher, watch } from '@lit-labs/signals'
import { LatLng, LatLngBounds } from 'leaflet'
import { html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { locationAuto, locationSelected } from '../data/location'
import './leaflet-select-location.js'

@customElement('geo-select-location')
export class GeoSelectLocation extends SignalWatcher(LitElement) {
  @state()
  private _latitude?: number
  @state()
  private _longitude?: number
  @state()
  private _geolocationPositionError?: GeolocationPositionError
  @property({ attribute: false })
  onBoundsChange?: (bounds: LatLngBounds, zoom: number) => unknown
  @property({ type: Array })
  places: Array<{ id: string; geohash: string }> = []

  #onLatitudeChange(e: InputEvent) {
    const target = e.target as HTMLInputElement
    this._latitude = target.value ? +target.value : undefined
  }

  #onLongitudeChange(e: InputEvent) {
    const target = e.target as HTMLInputElement
    this._longitude = target.value ? +target.value : undefined
  }

  // geolocation watch id
  private _watchId?: number

  connectedCallback(): void {
    super.connectedCallback()
    /* geolocation */
    this._watchId = navigator.geolocation.watchPosition(
      position => {
        // TODO there is also direction, timestamp, precision etc
        locationAuto.set(
          new LatLng(
            position.coords.latitude,
            position.coords.longitude,
            position.coords.altitude ?? undefined,
          ),
        )
      },
      error => {
        this._geolocationPositionError = error
        locationAuto.set(undefined)
      },
    )
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    if (typeof this._watchId === 'number')
      navigator.geolocation.clearWatch(this._watchId)
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
        locationSelected.set(undefined)
      } else {
        locationSelected.set(new LatLng(this._latitude, this._longitude))
      }
    }
  }

  private _handleSelectLocation = (latlng: LatLng) => {
    this._latitude = latlng.lat
    this._longitude = latlng.lng
  }

  render() {
    const location =
      typeof this._latitude === 'number' &&
      typeof this._longitude === 'number' &&
      !isNaN(this._latitude + this._longitude)
        ? new LatLng(this._latitude, this._longitude)
        : undefined

    return html`
      <div>
        auto: ${locationAuto.get()} ${this._geolocationPositionError?.message}
      </div>
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
      </div>
      <leaflet-select-location
        .location=${location}
        .locationAuto=${watch(locationAuto)}
        .onSelectLocation=${this._handleSelectLocation}
        .places=${this.places}
        .onBoundsChange=${this.onBoundsChange}></leaflet-select-location>
      </leaflet-select-location>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'geo-select-location': GeoSelectLocation
  }
}
