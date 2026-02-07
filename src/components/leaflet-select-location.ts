import 'leaflet'
import {
  LatLng,
  Map,
  map,
  marker,
  Marker,
  polygon,
  Polygon,
  tileLayer,
} from 'leaflet'
import leafletStyles from 'leaflet/dist/leaflet.css?inline'
import { css, html, LitElement, unsafeCSS, type PropertyValues } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import geohash from 'ngeohash'
import './leaflet-icon-setup.js'

@customElement('leaflet-select-location')
export class LeafletSelectLocation extends LitElement {
  @property({ attribute: false })
  location?: LatLng

  @property({ type: Number })
  precision = 4

  @property({ type: Number })
  rings = 1

  @property()
  onSelectLocation?: (location: LatLng) => unknown

  @query('#mapid')
  _mapEl!: HTMLDivElement

  @state()
  private _map: Map | null = null

  private _marker: Marker | null = null
  private _polygons: Polygon[] = []

  firstUpdated() {
    this._map = map(this._mapEl)
      .setView([50, 15], 5)
      .addLayer(tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png'))
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
  }

  protected willUpdate(_changedProperties: PropertyValues) {
    // move marker when location changes
    if (_changedProperties.has('_map') || _changedProperties.has('location')) {
      if (this._map) {
        if (this.location) {
          if (!this._marker) {
            this._marker = marker(this.location).addTo(this._map)
          }

          this._marker.setLatLng(this.location)
          this._map.setView(this.location)
        } else {
          this._marker?.remove()
          this._marker = null
        }
      }
    }

    if (
      _changedProperties.has('_map') ||
      _changedProperties.has('location') ||
      _changedProperties.has('precision') ||
      _changedProperties.has('rings')
    ) {
      if (this._map && this.location && this.precision && this.rings) {
        this._polygons.forEach(p => p.remove())
        this._polygons = []
        const geohashes = getRelevantGeohashes({
          coord: this.location,
          precision: this.precision,
          rings: this.rings,
        })

        for (const gh of geohashes) {
          const [lat0, lng0, lat1, lng1] = geohash.decode_bbox(gh)
          this._polygons.push(
            polygon([
              [lat0, lng0],
              [lat0, lng1],
              [lat1, lng1],
              [lat1, lng0],
            ]).addTo(this._map),
          )
        }
      }

      if (!this.location) {
        this._polygons.forEach(p => p.remove())
        this._polygons = []
      }
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

export const getRelevantGeohashes = ({
  coord,
  precision,
  rings,
}: {
  coord: LatLng
  precision: number
  rings: number
}) => {
  const geohashes = new Set<string>()
  geohashes.add(geohash.encode(coord.lat, coord.lng, precision))

  for (let i = 0, len = rings; i < len; ++i) {
    const nextghs = new Set<string>()
    for (const h of geohashes) {
      for (const n of geohash.neighbors(h)) {
        nextghs.add(n)
      }
    }
    for (const h of nextghs) {
      geohashes.add(h)
    }
  }

  return geohashes
}

const normalizeLng = (lng: number) => (((lng % 360) - 180 * 3) % 360) + 180
