import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import { getDistance, getGreatCircleBearing } from 'geolib'
import type { LatLng } from 'leaflet'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { formatDistance } from '../utils/geo'

@customElement('geo-direction')
export class GeoDirection extends LitElement {
  @property({ attribute: false })
  origin?: LatLng
  @property({ attribute: false })
  dest?: LatLng

  render() {
    if (!this.origin || !this.dest) return null

    const distance = getDistance(this.origin, this.dest)
    const bearing = getGreatCircleBearing(this.origin, this.dest)

    return html` <wa-icon name="arrow-up-long" rotate=${bearing}></wa-icon
      ><span>${formatDistance(distance)}</span>`
  }
}
