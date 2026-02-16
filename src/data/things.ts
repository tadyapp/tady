import { signal } from '@lit-labs/signals'

type EventType = 'news' | 'events' | 'market'

export const activeType = signal<EventType | undefined>(undefined)

export const typeKinds: Record<EventType, number[]> = {
  news: [1],
  events: [31922, 31923],
  market: [30402, 30403],
}
