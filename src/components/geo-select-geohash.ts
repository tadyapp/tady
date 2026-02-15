import '@awesome.me/webawesome/dist/components/slider/slider.js'
import type WaSlider from '@awesome.me/webawesome/dist/components/slider/slider.js'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import 'leaflet'
import {
  canvas,
  latLng,
  latLngBounds,
  map,
  marker,
  Marker,
  polygon,
  Polygon,
  tileLayer,
  type LatLng,
  type Map,
} from 'leaflet'
import leafletStyles from 'leaflet/dist/leaflet.css?inline'
import { css, html, LitElement, unsafeCSS, type PropertyValues } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import ngeohash from 'ngeohash'
import { formatDistance } from './geo-direction.js'
import './leaflet-icon-setup.js'
import { geohash2polygon, normalizeLng } from './leaflet-select-location.js'
import { geohash2location } from './nostr-short-text-note.js'

@customElement('geo-select-geohash')
export class GeoSelectGeohash extends LitElement {
  static formAssociated = true
  private internals: ElementInternals

  @query('#mapid')
  _mapEl!: HTMLDivElement
  @state()
  private _map: Map | null = null

  @property() name?: string
  @property() value?: string
  @property({ attribute: false }) location?: LatLng
  @state() private selectedLocation?: LatLng = this.location
  @property({ type: Number }) precision = 6

  constructor() {
    super()
    this.internals = this.attachInternals()
  }

  private updateFormValue() {
    if (!this.name) return
    if (!this.value) return
    const data = new FormData()
    data.set(this.name, this.value)
    this.internals.setFormValue(data)
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('value')) this.updateFormValue()
  }

  private changePrecision(event: InputEvent) {
    const target = event.target as WaSlider
    this.precision = target.value
  }

  disconnectedCallback(): void {
    // cleanup
    super.disconnectedCallback()
    this._map?.remove()
    this._map = null
  }

  firstUpdated() {
    this._map = map(this._mapEl, { scrollWheelZoom: 'center' })
      .setView(this.selectedLocation ?? [0, 0], this.selectedLocation ? 5 : 1)
      .addLayer(tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png'))

    if (this.selectedLocation) this.zoomToGeohash()

    const { lat, lng } = this._map.getCenter()
    const nlng = normalizeLng(lng)
    this.selectedLocation = latLng(lat, nlng)

    new ResizeObserver(() => {
      this._map?.invalidateSize()
    }).observe(this._mapEl)

    this._map.on('move', () => {
      if (!this._map) return
      const { lat, lng } = this._map.getCenter()
      this.selectedLocation = latLng(lat, lng)
    })

    this._map.on('moveend', () => {
      if (!this._map) return
      const { lat, lng } = this._map.getCenter()
      const nlng = normalizeLng(lng)
      if (Math.abs(nlng - lng) > 1) {
        this._map.setView([lat, nlng], this._map.getZoom(), { animate: false })
      }
      this.selectedLocation = latLng(lat, nlng)
    })
  }

  private zoomToGeohash({ animate = true }: { animate?: boolean } = {}) {
    if (!this._map || !this.value) return

    const [lat0, lng0, lat1, lng1] = ngeohash.decode_bbox(this.value)
    const geohashBounds = latLngBounds([lat0, lng0], [lat1, lng1])
    const loc = geohash2location(this.value)!

    const zoom = this._map.getBoundsZoom(geohashBounds) - 1
    this._map.setView(this.selectedLocation ?? loc.coords, zoom, { animate })
  }

  private marker: Marker | null = null
  private polygon: Polygon | null = null
  private polygonRenderer = canvas({ padding: 4 })

  protected willUpdate(_changedProperties: PropertyValues) {
    if (
      _changedProperties.has('_map') ||
      _changedProperties.has('selectedLocation')
    ) {
      if (this._map && this.selectedLocation) {
        this.marker?.remove()
        this.marker = marker(this.selectedLocation).addTo(this._map)
      }
    }

    if (
      _changedProperties.has('selectedLocation') ||
      _changedProperties.has('precision')
    ) {
      if (this.selectedLocation && this.precision) {
        this.value = ngeohash.encode(
          this.selectedLocation.lat,
          this.selectedLocation.lng,
          this.precision,
        )
      }
    }

    if (_changedProperties.has('value') || _changedProperties.has('_map')) {
      if (this._map && this.value) {
        this.polygon ??= polygon(geohash2polygon(this.value), {
          renderer: this.polygonRenderer,
        }).addTo(this._map)
        this.polygon.setLatLngs(geohash2polygon(this.value))
      }
    }

    if (_changedProperties.has('precision')) this.zoomToGeohash()

    // set initial location
    if (_changedProperties.has('location') || _changedProperties.has('_map')) {
      if (
        !_changedProperties.get('location') ||
        !_changedProperties.get('_map')
      ) {
        if (this.location && this._map) {
          this.selectedLocation = this.location
          this._map.setView(this.location, 14)
        }
      }
    }
  }

  render() {
    const location = this.value ? geohash2location(this.value) : undefined
    return html`<div id="mapid"></div>
      <div>
        <label for="geohash-precision"
          >Precision
          ${typeof location?.precision === 'number'
            ? formatDistance(location.precision)
            : null}</label
        >
        <wa-slider
          id="geohash-precision"
          min="5"
          max="10"
          .value=${this.precision}
          @input=${this.changePrecision}
          with-markers
          with-tooltip
        ></wa-slider>
      </div>`
  }

  static styles = css`
    #mapid {
      height: 16rem;
      user-select: none;
    }

    ${unsafeCSS(leafletStyles)}
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'geo-select-geohash': GeoSelectGeohash
  }
}
