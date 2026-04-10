import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/button/button.styles.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/components/icon/icon.styles.js'
import { greatCircle } from '@turf/turf'
import 'leaflet'
import L, {
  latLngBounds,
  Polygon,
  polygon,
  Polyline,
  polyline,
  PolylineDecorator,
  type FitBoundsOptions,
  type LatLng,
} from 'leaflet'
import 'leaflet-polylinedecorator'
import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {
  geohash2location,
  geohash2polygon,
  getGeohashBounds,
} from '../utils/geo'
import { GeoBaseMap } from './geo-base-map'

@customElement('geo-direction-map')
export class GeoDirectionMap extends GeoBaseMap {
  @property({ attribute: false }) origin!: LatLng
  @property() destination!: string

  private polylines: [Polyline, PolylineDecorator][] = []
  private polygon?: Polygon

  private zoomToOrigin(options?: FitBoundsOptions) {
    const bounds = latLngBounds([this.origin])
    this._map?.fitBounds(bounds, options)
  }
  private zoomToDestination(options?: FitBoundsOptions) {
    const geohashBounds = getGeohashBounds(this.destination)
    const bounds = latLngBounds([
      geohashBounds.getNorthEast(),
      geohashBounds.getSouthWest(),
    ])
    this._map?.fitBounds(bounds, options)
  }
  private zoomToDirection(options?: FitBoundsOptions) {
    const geohashBounds = getGeohashBounds(this.destination)
    const bounds = latLngBounds([
      geohashBounds.getNorthEast(),
      geohashBounds.getSouthWest(),
      this.origin,
    ])
    this._map?.fitBounds(bounds, options)
  }

  firstUpdated(): void {
    super.firstUpdated()
    this._map?.setView(geohash2location(this.destination).coords, 15)

    this.zoomToDestination({ animate: false })
  }

  willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties)

    if (
      (changedProperties.has('destination') || changedProperties.has('_map')) &&
      this._map
    ) {
      this.polygon?.remove()
      this.polygon = polygon(geohash2polygon(this.destination), {
        stroke: false,
        fillOpacity: 0.4,
      }).addTo(this._map)
    }

    if (
      (changedProperties.has('destination') ||
        changedProperties.has('origin') ||
        changedProperties.has('_map')) &&
      this._map
    ) {
      const geohashCenter = geohash2location(this.destination)

      const result = greatCircle(
        [this.origin.lng, this.origin.lat],
        [geohashCenter.coords.lng, geohashCenter.coords.lat],
        { npoints: 20 },
      )

      // remove previous polylines
      this.polylines.forEach(p => {
        p[0].remove()
        p[1].remove()
      })
      this.polylines = []

      // array of coordinates for each polyline, but in geojson - flipped lng and lat
      let pcoords: [number, number][][]

      if (result.geometry.type === 'LineString') {
        pcoords = [result.geometry.coordinates as [number, number][]]
      } else {
        pcoords = result.geometry.coordinates as [number, number][][]
      }

      for (const pc of pcoords) {
        const pln = pc.map(val => [val[1], val[0]] as [number, number])

        const color = 'red'

        const poly = polyline(pln, { color }).addTo(this._map)
        const arrowhead = L.polylineDecorator(poly, {
          patterns: [
            {
              offset: '100%',
              repeat: 0,
              symbol: L.Symbol.arrowHead({
                pixelSize: 15,
                polygon: false,
                pathOptions: { stroke: true, color },
              }),
            },
          ],
        }).addTo(this._map)

        this.polylines.push([poly, arrowhead])
      }
    }
  }

  static styles = [
    ...super.styles,
    css`
      #mapid {
        height: 24rem;
      }
    `,
  ]

  render() {
    const mapContainer = super.render()
    return html`
      <div>
        <wa-button @click=${() => this.zoomToOrigin()} appearance="outlined">
          <wa-icon name="backward-step"></wa-icon>
        </wa-button>
        <wa-button @click=${() => this.zoomToDirection()} appearance="outlined">
          <wa-icon name="up-right-and-down-left-from-center"></wa-icon>
        </wa-button>
        <wa-button
          @click=${() => this.zoomToDestination()}
          appearance="outlined"
        >
          <wa-icon name="forward-step"></wa-icon>
        </wa-button>
      </div>
      ${mapContainer}
    `
  }
}

declare module 'leaflet' {
  function polylineDecorator(
    paths: Polyline | Polyline[],
    options?: PolylineDecoratorOptions,
  ): PolylineDecorator
}
