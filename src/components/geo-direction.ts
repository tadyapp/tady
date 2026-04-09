import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import { getDistance, getGreatCircleBearing } from 'geolib'
import type { LatLng } from 'leaflet'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { formatDistance, isWithin } from '../utils/geo'

@customElement('geo-direction')
export class GeoDirection extends LitElement {
  @property({ attribute: false })
  origin?: LatLng
  @property({ attribute: false })
  dest?: LatLng
  @property()
  destGeohash?: string

  render() {
    if (!this.origin || !this.dest) return null

    const isWithinGeohash = this.destGeohash
      ? isWithin(this.origin, this.destGeohash)
      : undefined

    const distance = getDistance(this.origin, this.dest)
    const bearing = getGreatCircleBearing(this.origin, this.dest)

    const direction = isWithinGeohash
      ? html`<wa-icon name="circle-dot" variant="regular" circle-dot></wa-icon>`
      : html`<wa-icon name="arrow-up-long" rotate=${bearing}></wa-icon>`

    return html`${direction}<span>${formatDistance(distance)}</span>`
  }
}
