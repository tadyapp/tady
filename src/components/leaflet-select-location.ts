import 'leaflet'
import {
  canvas,
  CircleMarker,
  circleMarker,
  latLng,
  LatLng,
  LatLngBounds,
  map,
  marker,
  polygon,
  tileLayer,
  type Map,
  type Marker,
  type MarkerOptions,
  type Polygon,
} from 'leaflet'
import leafletStyles from 'leaflet/dist/leaflet.css?inline'
import { css, html, LitElement, unsafeCSS, type PropertyValues } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import ngeohash from 'ngeohash'
import {
  geohash2polygon,
  getCircleGeohashesInRadius,
  normalizeLng,
} from '../utils/geo.js'
import './leaflet-icon-setup.js'

@customElement('leaflet-select-location')
export class LeafletSelectLocation extends LitElement {
  @property({ attribute: false })
  location?: LatLng

  @property({ attribute: false })
  locationAuto?: LatLng

  @property() activeLocationType: 'auto' | 'manual' = 'auto'

  @property({ type: Number })
  precision = 4

  @property({ type: Number })
  radius!: number

  @property({ attribute: false })
  onBoundsChange?: (bounds: LatLngBounds, zoom: number) => unknown
  @property({ type: Array })
  places: Array<{ id: string; geohash: string }> = []

  @property()
  onSelectLocation?: (location: LatLng) => unknown

  @query('#mapid')
  _mapEl!: HTMLDivElement

  @state()
  private _map: Map | null = null

  private _markers = new globalThis.Map<string, Marker>()
  private _polygons: Polygon[] = []

  private _updateMarker(
    key: string,
    loc: LatLng | undefined,
    options?: MarkerOptions,
  ) {
    if (!this._map) return

    if (loc) {
      let m = this._markers.get(key)
      if (!m) {
        m = marker(loc, options).addTo(this._map)
        this._markers.set(key, m)
      }
      m.setLatLng(loc)
    } else {
      this._markers.get(key)?.remove()
      this._markers.delete(key)
    }
  }

  private _canvasRenderer = canvas()

  disconnectedCallback(): void {
    // cleanup
    super.disconnectedCallback()
    this._map?.remove()
    this._map = null
  }

  firstUpdated() {
    this._map = map(this._mapEl)
      .setView([50, 15], 5)
      .addLayer(tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png'))

    new ResizeObserver(() => {
      this._map?.invalidateSize()
    }).observe(this._mapEl)

    this.onBoundsChange?.(this._map.getBounds(), this._map.getZoom())

    this._map.on('click', e => {
      const latlng = e.latlng.clone()
      latlng.lng = normalizeLng(latlng.lng)
      this.onSelectLocation?.(latlng)
    })
    this._map.on('moveend', () => {
      if (!this._map) return
      const { lat, lng } = this._map.getCenter()
      const nlng = normalizeLng(lng)
      if (Math.abs(nlng - lng) > 1) {
        this._map.setView([lat, nlng], this._map.getZoom(), { animate: false })
      }
    })
    this._map.on('moveend', () => {
      if (!this._map) return
      this.onBoundsChange?.(this._map.getBounds(), this._map.getZoom())
    })
  }

  protected willUpdate(_changedProperties: PropertyValues) {
    if (_changedProperties.has('places')) {
      this.#showSecondaryPlaces()
    }

    // move marker when location changes
    if (_changedProperties.has('_map') || _changedProperties.has('location')) {
      this._updateMarker('location', this.location)
    }

    // move marker when auto location changes
    if (
      _changedProperties.has('_map') ||
      _changedProperties.has('locationAuto')
    ) {
      this._updateMarker('locationAuto', this.locationAuto)
    }

    // show polygon
    if (
      _changedProperties.has('_map') ||
      _changedProperties.has('location') ||
      _changedProperties.has('locationAuto') ||
      _changedProperties.has('precision') ||
      _changedProperties.has('radius') ||
      _changedProperties.has('activeLocationType')
    ) {
      const coord =
        this.activeLocationType === 'manual' ? this.location : this.locationAuto
      if (this._map && coord && this.precision && this.radius) {
        this._polygons.forEach(p => p.remove())
        this._polygons = []
        const geohashes = getCircleGeohashesInRadius({
          coord,
          precision: this.precision,
          radiusMeters: this.radius,
        })

        for (const gh of geohashes) {
          this._polygons.push(
            polygon(geohash2polygon(gh), {
              stroke: false,
              fillOpacity: 0.4,
            }).addTo(this._map),
          )
        }
      }

      if (!coord) {
        this._polygons.forEach(p => p.remove())
        this._polygons = []
      }
    }
  }

  #circleMarkers: CircleMarker[] = []

  #showSecondaryPlaces() {
    if (!this._map) return

    this.#circleMarkers.forEach(poly => poly.remove())
    this.#circleMarkers = []
    for (const place of this.places) {
      // if (place.geohash.length < 4) continue
      const decoded = ngeohash.decode(place.geohash)
      const coords = latLng(decoded.latitude, decoded.longitude)
      this.#circleMarkers.push(
        circleMarker(/*geohash2polygon(place.geohash)*/ coords, {
          renderer: this._canvasRenderer,
          stroke: false,
          radius: 5,
          fillColor: '#E93C35',
          fillOpacity: 0.3,
        }).addTo(this._map),
      )
    }
  }

  render() {
    return html`<div id="mapid"></div>`
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
    'leaflet-select-location': LeafletSelectLocation
  }
}
