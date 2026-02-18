import { computed, signal } from '@lit-labs/signals'
import type { LatLng } from 'leaflet'

export type LocationType = 'auto' | 'manual'

export const locationSelected = signal<LatLng | undefined>(undefined)
export const locationAuto = signal<LatLng | undefined>(undefined)
export const locationPreference = signal<LocationType>('auto') // if both are available, preference is used, otherwise the one available is used
export const radius = signal<number>(25000) // metres from origin

export const activeLocationType = computed<LocationType>(() => {
  if (locationAuto.get() && locationSelected.get())
    return locationPreference.get()
  if (locationAuto.get()) return 'auto'
  if (locationSelected.get()) return 'manual'
  return locationPreference.get()
})

export const activeLocation = computed(() =>
  activeLocationType.get() === 'manual'
    ? locationSelected.get()
    : locationAuto.get(),
)
