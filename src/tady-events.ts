import { SignalWatcher, watch } from '@lit-labs/signals'
import { css, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './components/create/tady-create-calendar-event.js'
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
      ></tady-list>
      <tady-create-calendar-event></tady-create-calendar-event>`
  }

  static styles = css`
    tady-create-calendar-event::part(trigger) {
      display: block;
      position: fixed;
      right: 2rem;
      bottom: 2rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-events': TadyEvents
  }
}
