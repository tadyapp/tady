import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { LatLng } from 'leaflet'
import { eventDistance } from './geo'

export type EventFilter = (events: NDKEvent[]) => NDKEvent[]
export interface EventFilterConfig {
  filter: EventFilter
  exclude?: string[]
}

export const latestFilter: EventFilter = events =>
  events.sort((a, b) =>
    a.created_at && b.created_at ? b.created_at - a.created_at : 0,
  )

export const getNearestFilter =
  (location?: LatLng): EventFilter =>
  events => {
    if (!location) return events
    return events.sort(
      (a, b) => eventDistance(a, location) - eventDistance(b, location),
    )
  }
