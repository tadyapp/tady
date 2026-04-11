import type { NDKEvent } from '@nostr-dev-kit/ndk'

export type NDKEventSubmitEvent = CustomEvent<{
  event: NDKEvent
  media: File[]
}>
