import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk'
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import debounce from 'lodash-es/debounce'
import { ndk } from '../data/ndk'

export class NostrGeoSubscription implements ReactiveController {
  host: ReactiveControllerHost
  events: NDKEvent[] = []

  private _getGeohashes: () => Iterable<string>
  private _getKinds: () => number[]
  private _lastKey?: string
  private _subscription?: NDKSubscription
  private _pendingEvents: NDKEvent[] = []

  private _flush = debounce(() => {
    this.events = [...this.events, ...this._pendingEvents]
    this._pendingEvents = []
    this.host.requestUpdate()
  }, 100)

  constructor(
    host: ReactiveControllerHost,
    {
      geohashes,
      kinds,
      debounce: debounceMs = 200,
    }: {
      geohashes: () => Iterable<string>
      kinds: () => number[]
      debounce?: number
    },
  ) {
    this.host = host
    this._getGeohashes = geohashes
    this._getKinds = kinds
    this._flush = debounce(() => {
      this.events = [...this.events, ...this._pendingEvents]
      this._pendingEvents = []
      this.host.requestUpdate()
    }, debounceMs)
    host.addController(this)
  }

  hostUpdated() {
    const geohashes = [...this._getGeohashes()]
    const kinds = this._getKinds()
    const key = JSON.stringify({ geohashes, kinds })

    if (key === this._lastKey) return
    this._lastKey = key
    this._subscribe(geohashes, kinds)
  }

  hostDisconnected() {
    this._subscription?.stop()
    this._flush.cancel()
  }

  private _subscribe(geohashes: string[], kinds: number[]) {
    this._subscription?.stop()
    this._flush.cancel()
    this.events = []
    this._pendingEvents = []

    if (geohashes.length === 0) {
      this.host.requestUpdate()
      return
    }

    this._subscription = ndk.subscribe(
      geohashes.map(g => ({
        kinds: kinds.length > 0 ? kinds : undefined,
        '#g': [g],
      })),
      { closeOnEose: false },
      {
        onEvent: e => {
          this._pendingEvents.push(e)
          this._flush()
        },
      },
    )
  }
}
