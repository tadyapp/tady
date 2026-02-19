import { SignalWatcher, watch } from '@lit-labs/signals'
import { css, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './components/create/tady-create-news.js'
import {
  activeLocation,
  activeLocationType,
  locationAuto,
  locationSelected,
  radius,
} from './data/location'
import { typeKinds } from './data/things'
import './tady-filters.js'
import type { FilterChangeEvent } from './tady-filters.js'
import './tady-list.js'
import {
  getNearestFilter,
  latestFilter,
  type EventFilter,
  type EventFilterConfig,
} from './utils/fiilter.js'

@customElement('tady-news')
export class TadyNews extends SignalWatcher(LitElement) {
  @state() private _filter: EventFilter = events => events
  render() {
    return html`<tady-filters
        @filter-change=${(e: FilterChangeEvent) => {
          this._filter = e.detail.apply
        }}
        .filters=${new Map<string, EventFilterConfig>([
          ['latest', { filter: latestFilter, exclude: ['nearest'] }],
          [
            'nearest',
            {
              filter: getNearestFilter(activeLocation.get()),
              exclude: ['latest'],
            },
          ],
        ])}
      ></tady-filters>
      <tady-list
        .locationSelected=${watch(locationSelected)}
        .locationAuto=${watch(locationAuto)}
        .activeLocationType=${watch(activeLocationType)}
        radius=${watch(radius)}
        .kinds=${typeKinds['news']}
        .filter=${this._filter}
      ></tady-list>
      <tady-create-news></tady-create-news>`
  }

  static styles = css`
    tady-create-news::part(trigger) {
      display: block;
      position: fixed;
      right: 2rem;
      bottom: 2rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-news': TadyNews
  }
}
