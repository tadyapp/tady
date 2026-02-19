import { SignalWatcher, watch } from '@lit-labs/signals'
import { css, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './components/create/tady-create-news.js'
import {
  activeLocationType,
  locationAuto,
  locationSelected,
  radius,
} from './data/location'
import { typeKinds } from './data/things'
import './tady-filters.js'
import type { FilterChangeEvent } from './tady-filters.js'
import './tady-list.js'
import { type EventFilter, type EventFilterConfig } from './utils/fiilter.js'

@customElement('tady-market')
export class TadyMarket extends SignalWatcher(LitElement) {
  @state() private _filter: EventFilter = events => events
  render() {
    return html`<tady-filters
        @filter-change=${(e: FilterChangeEvent) => {
          this._filter = e.detail.apply
        }}
        .filters=${new Map<string, EventFilterConfig>()}
      ></tady-filters>
      <tady-list
        .locationSelected=${watch(locationSelected)}
        .locationAuto=${watch(locationAuto)}
        .activeLocationType=${watch(activeLocationType)}
        radius=${watch(radius)}
        .kinds=${typeKinds['market']}
        .filter=${this._filter}
      ></tady-list>
      <tady-create-listing></tady-create-listing>`
  }

  static styles = css`
    tady-create-listing::part(trigger) {
      display: block;
      position: fixed;
      right: 2rem;
      bottom: 2rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-market': TadyMarket
  }
}
