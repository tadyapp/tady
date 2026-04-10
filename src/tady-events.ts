import { SignalWatcher, watch } from '@lit-labs/signals'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
  activeLocation,
  activeLocationType,
  locationAuto,
  locationSelected,
  radius,
} from './data/location.js'
import { typeKinds } from './data/things.js'
import './tady-filters.js'
import type { FilterChangeEvent } from './tady-filters.js'
import './tady-list.js'
import {
  getNearestFilter,
  type EventFilter,
  type EventFilterConfig,
} from './utils/filter.js'

@customElement('tady-events')
export class TadyEvents extends SignalWatcher(LitElement) {
  @state() private _filter: EventFilter = events => events
  render() {
    return html`<tady-filters
        @filter-change=${(e: FilterChangeEvent) => {
          this._filter = e.detail.apply
        }}
        .filters=${new Map<string, EventFilterConfig>([
          // add some time filtering
          ['nearest', { filter: getNearestFilter(activeLocation.get()) }],
        ])}
      ></tady-filters>
      <tady-list
        .locationSelected=${watch(locationSelected)}
        .locationAuto=${watch(locationAuto)}
        .activeLocationType=${watch(activeLocationType)}
        radius=${watch(radius)}
        .kinds=${typeKinds['events']}
        .filter=${this._filter}
      ></tady-list>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-events': TadyEvents
  }
}
