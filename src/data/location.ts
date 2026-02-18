import { computed, signal } from '@lit-labs/signals'
import type { LatLng } from 'leaflet'

export const locationSelected = signal<LatLng | undefined>(undefined)
export const locationAuto = signal<LatLng | undefined>(undefined)
export const locationPreference = signal<'auto' | 'manual'>('auto') // if both are available, preference is used, otherwise the one available is used
export const radius = signal<number>(10000) // metres from origin

export const activeLocationType = computed(() => {
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
