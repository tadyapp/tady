/**
 * Show destination geohash
 *  - if close enough, show it as a rectangle on map
 *  - if it's too far, show it as a pin
 *  - show a haversine line from origin coordinates to the centre of destination geohash
 */

import 'leaflet'
import { map, tileLayer, type Map } from 'leaflet'
import leafletStyles from 'leaflet/dist/leaflet.css?inline'
import { css, html, LitElement, unsafeCSS } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import { normalizeLng } from '../utils/geo'

@customElement('geo-base-map')
export class GeoBaseMap extends LitElement {
  @query('#mapid') protected _mapEl!: HTMLDivElement

  @state() protected _map: Map | null = null

  firstUpdated() {
    this._map = map(this._mapEl)
      .setView([0, 0], 1)
      .addLayer(tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png'))

    this._map.on('moveend', () => {
      if (!this._map) return
      const { lat, lng } = this._map.getCenter()
      const nlng = normalizeLng(lng)
      if (Math.abs(nlng - lng) > 1) {
        this._map.setView([lat, nlng], this._map.getZoom(), { animate: false })
      }
    })

    new ResizeObserver(() => {
      this._map?.invalidateSize()
    }).observe(this._mapEl)
  }

  render() {
    return html`<div id="mapid"></div>`
  }

  static styles = [
    css`
      #mapid {
        height: 16rem;
        user-select: none;
      }

      ${unsafeCSS(leafletStyles)}
    `,
  ]
}
