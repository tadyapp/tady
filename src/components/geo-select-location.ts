import '@awesome.me/webawesome/dist/components/dialog/dialog.js'
import '@awesome.me/webawesome/dist/components/dialog/dialog.styles.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/components/icon/icon.styles.js'
import '@awesome.me/webawesome/dist/components/slider/slider.js'
import type WaSlider from '@awesome.me/webawesome/dist/components/slider/slider.js'
import '@awesome.me/webawesome/dist/components/slider/slider.styles.js'
import { signal, SignalWatcher, watch } from '@lit-labs/signals'
import { LatLng, LatLngBounds } from 'leaflet'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
  activeLocation,
  activeLocationType,
  locationAuto,
  locationPreference,
  locationSelected,
  radius,
  type LocationType,
} from '../data/location'
import { formatDistance, formatLatLng } from '../utils/geo.js'
import './leaflet-select-location.js'

export const dialogOpen = signal(false)

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
        locationPreference.set('manual')
      }
    }
  }

  private _handleSelectLocation = (latlng: LatLng) => {
    this._latitude = Math.round(latlng.lat * 10 ** 6) / 10 ** 6
    this._longitude = Math.round(latlng.lng * 10 ** 6) / 10 ** 6
  }

  private openDialog = () => {
    dialogOpen.set(true)
  }

  private handleChangePreference(e: Event) {
    const target = e.target as HTMLInputElement
    locationPreference.set(target.value as LocationType)
  }

  render() {
    const location =
      typeof this._latitude === 'number' &&
      typeof this._longitude === 'number' &&
      !isNaN(this._latitude + this._longitude)
        ? new LatLng(this._latitude, this._longitude)
        : undefined

    const MIN_RADIUS = 1000
    const MAX_RADIUS = 500_000

    return html`
      <wa-button
        @click=${this.openDialog}
        appearance="outlined"
        data-testid="location-select-trigger"
      >
        ${activeLocationType.get() === 'manual'
          ? html`<wa-icon
              name="hand"
              label="selected location"
              slot="start"
            ></wa-icon>`
          : html`<wa-icon
              name="location-crosshairs"
              label="automatic location"
              slot="start"
            ></wa-icon>`}
        ${formatLatLng(activeLocation.get(), { decimals: 4 })} &plusmn;
        ${formatDistance(radius.get())}
      </wa-button>
      <wa-dialog
        light-dismiss
        id="location-select-dialog"
        label="Set location"
        .open=${dialogOpen.get()}
        @wa-after-hide=${(e: Event) => {
          // the conditional is here because of event collision with wa-slider
          if (e.target === e.currentTarget) dialogOpen.set(false)
        }}
      >
        <div>
          <label>
            <input
              type="radio"
              name="preference"
              value="auto"
              .checked=${locationPreference.get() === 'auto'}
              @change=${this.handleChangePreference}
              ?disabled=${!locationAuto.get()}
            />
            <wa-icon
              name="location-crosshairs"
              label="automatic location"
            ></wa-icon>
            ${formatLatLng(locationAuto.get())}
            ${this._geolocationPositionError?.message}
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              name="preference"
              value="manual"
              .checked=${locationPreference.get() === 'manual'}
              @change=${this.handleChangePreference}
              ?disabled=${!locationSelected.get()}
            />
            <wa-icon name="hand" label="selected location"></wa-icon>
            ${formatLatLng(locationSelected.get(), { decimals: 6 })}</label
          >
        </div>
        <div>
          <wa-icon name="location-dot" label="coordinates"></wa-icon>
          <!-- <label for="geo-latitude">latitude</label> -->
          <input
            aria-label="latitude"
            placeholder="latitude"
            id="geo-latitude"
            type="number"
            @input=${this.#onLatitudeChange}
            .value=${this._latitude?.toString() ?? ''}
          />
          <!-- <label for="geo-longitude">longitude</label> -->
          <input
            aria-label="longitude"
            placeholder="longitude"
            id="geo-longitude"
            type="number"
            @input=${this.#onLongitudeChange}
            .value=${this._longitude?.toString() ?? ''}
          />
        </div>
        <div>
          <wa-icon name="plus-minus" label="radius"></wa-icon>
          <input
            type="number"
            size="4"
            min=${0}
            max=${500}
            .value=${String(radius.get() / 1000)}
            @change=${(e: Event) => {
              const target = e.target as HTMLInputElement
              radius.set(+(Number(target.value) * 1000).toPrecision(3))
            }}
          />
          km
          <wa-slider
            with-tooltip
            step=${0.05}
            min=${Math.log10(MIN_RADIUS)}
            max=${Math.log10(MAX_RADIUS)}
            .valueFormatter=${(value: number) => formatDistance(10 ** value)}
            .value=${Math.log10(radius.get())}
            @input=${(e: Event) => {
              const target = e.target as WaSlider
              radius.set(+Math.round(10 ** target.value).toPrecision(3))
            }}
          ></wa-slider>
        </div>
        <leaflet-select-location
          .location=${location}
          .locationAuto=${watch(locationAuto)}
          activeLocationType=${watch(activeLocationType)}
          .onSelectLocation=${this._handleSelectLocation}
          .places=${this.places}
          .onBoundsChange=${this.onBoundsChange}
          radius=${radius.get()}
        ></leaflet-select-location>
      </wa-dialog>
    `
  }

  static styles = css`
    /* ::part(dialog) { */
    /* width: 100%; */
    /* } */

    wa-slider {
      margin: 1rem 0;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'geo-select-location': GeoSelectLocation
  }
}
