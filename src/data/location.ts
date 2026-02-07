import { signal } from '@lit-labs/signals'
import type { LatLng } from 'leaflet'

export const locationSelected = signal<LatLng | undefined>(undefined)
export const locationAuto = signal<LatLng | undefined>(undefined)
