import type { LatLngBounds } from 'leaflet'
import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import ngeohash from 'ngeohash'
import './components/geo-select-location.js'
import { getEventGeohash } from './components/nostr-short-text-note.js'
import { NostrGeoSubscription } from './controllers/geohash-subscription.js'
import './tady-router.js'

/**
 * Layout
 */
@customElement('tady-layout')
export class TadyLayout extends LitElement {
  @state()
  private _bounds?: LatLngBounds
  private _zoom?: number

  private _events = new NostrGeoSubscription(this, {
    geohashes: () => {
      if (!this._bounds || !this._zoom || this._zoom < 4) return []

      let geos: string[] = []

      for (let i = 4; i > 0; i--) {
        geos = ngeohash.bboxes(
          this._bounds.getSouth(),
          this._bounds.getWest(),
          this._bounds.getNorth(),
          this._bounds.getEast(),
          i,
        )
        if (geos.length < 100) break
      }
      return geos
    },
    kinds: () => [1],
  })

  render() {
    console.log(this._events.events)
    // const kindMap = new Map<number, number>()
    // for (const event of this._events.events) {
    //   kindMap.set(event.kind, (kindMap.get(event.kind) ?? 0) + 1)
    // }
    // console.log(kindMap)

    const places: { id: string; geohash: string }[] = this._events.events.map(
      e => ({
        id: e.id,
        geohash: getEventGeohash(e)!,
      }),
    )

    return html`
      <header class="header">
        <geo-select-location
          .onBoundsChange=${(bounds: LatLngBounds, zoom: number) => {
            this._bounds = bounds
            this._zoom = zoom
          }}
          .places=${places}
        ></geo-select-location>
        <nav>
          <a href="/news">news</a>
          <a href="/events">events</a>
          <a href="/market">market</a>
        </nav>
      </header>
      <main><tady-router></tady-router></main>
    `
  }

  static styles = css`
    .header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .header nav {
      display: flex;
      gap: 1rem;
    }

    .header nav a {
      font-size: 2rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-layout': TadyLayout
  }
}
