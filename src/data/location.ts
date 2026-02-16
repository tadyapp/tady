import { signal } from '@lit-labs/signals'
import type { LatLng } from 'leaflet'

export const locationSelected = signal<LatLng | undefined>(undefined)
export const locationAuto = signal<LatLng | undefined>(undefined)
export const locationPreference = signal<'auto' | 'manual'>('auto') // if both are available, preference is used, otherwise the one available is used
export const radius = signal<number>(10000) // metres from origin
