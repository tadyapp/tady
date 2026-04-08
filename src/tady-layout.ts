import { SignalWatcher } from '@lit-labs/signals'
import type { LatLngBounds } from 'leaflet'
import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import ngeohash from 'ngeohash'
import './components/geo-select-location.js'
import { NostrGeoSubscription } from './controllers/geohash-subscription.js'
import { activeType, typeKinds } from './data/things.js'
import './tady-router.js'
import { getEventGeohash } from './utils/geo.js'

/**
 * Layout
 */
@customElement('tady-layout')
export class TadyLayout extends SignalWatcher(LitElement) {
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
    kinds: () => {
      const at = activeType.get()
      return at ? typeKinds[at] : [-1]
    },
  })

  render() {
    const places: { id: string; geohash: string }[] = this._events.events.map(
      e => ({
        id: e.id,
        geohash: getEventGeohash(e)!,
      }),
    )

    const active = activeType.get()

    return html`
      <header class="header">
        <nav>
          <a href="/notes" class=${classMap({ active: active === 'notes' })}
            >notes</a
          >
          <a href="/events" class=${classMap({ active: active === 'events' })}
            >events</a
          >
          <a href="/market" class=${classMap({ active: active === 'market' })}
            >market</a
          >
        </nav>
        <geo-select-location
          .onBoundsChange=${(bounds: LatLngBounds, zoom: number) => {
            this._bounds = bounds
            this._zoom = zoom
          }}
          .places=${places}
        ></geo-select-location>
      </header>
      <main><tady-router></tady-router></main>
      <footer><a href="/about">about</a></footer>
    `
  }

  static styles = css`
    .header {
      display: flex;
      flex-wrap: wrap;
      /* flex-direction: column; */
      gap: 0.25rem 1rem;
      margin-bottom: 1rem;

      nav {
        display: flex;
        gap: 1rem;

        a {
          font-size: 1.5rem;
          text-decoration: none;

          &.active {
            color: pink;
            text-decoration: underline;
          }
        }
      }
    }

    footer {
      position: sticky;
      bottom: 0;
      margin-top: 5rem;
      display: flex;
      justify-content: space-around;
      pointer-events: none;

      a {
        pointer-events: all;
      }
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-layout': TadyLayout
  }
}
