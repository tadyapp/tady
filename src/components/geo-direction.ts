import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import { getDistance, getGreatCircleBearing } from 'geolib'
import type { LatLng } from 'leaflet'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

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

export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    // Distance in meters
    return `${Math.round(distance)}m`
  } else {
    // Distance in kilometers
    const kilometers = distance / 1000
    if (kilometers < 100) {
      return `${kilometers.toFixed(1)}km`
    } else return `${Math.round(kilometers)}km`
  }
}

export const errorInDegreesToMeters = (location: {
  latitude: number
  error: { latitude: number; longitude: number }
}) => {
  const EARTH_RADIUS_KM = 6371 // Average radius of the Earth in kilometers
  const METERS_PER_DEGREE = (EARTH_RADIUS_KM * 1000 * Math.PI) / 180 // Approximate meters per degree of latitude

  // Calculate latitude error in meters
  const latErrorMeters = location.error.latitude * METERS_PER_DEGREE

  // Convert latitude to radians for longitude calculation
  const latInRadians = location.error.latitude * (Math.PI / 180)

  // Calculate longitude error in meters
  const lonErrorMeters =
    location.error.longitude * METERS_PER_DEGREE * Math.cos(latInRadians)

  return {
    latitude: latErrorMeters,
    longitude: lonErrorMeters,
  }
}
