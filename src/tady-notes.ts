import { SignalWatcher, watch } from '@lit-labs/signals'
import { css, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './components/create/tady-create-note.js'
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
  latestFilter,
  type EventFilter,
  type EventFilterConfig,
} from './utils/filter.js'

@customElement('tady-notes')
export class TadyNotes extends SignalWatcher(LitElement) {
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
        .kinds=${typeKinds.notes}
        .filter=${this._filter}
      ></tady-list>
      <tady-create-note></tady-create-note>`
  }

  static styles = css`
    tady-create-note::part(trigger) {
      display: block;
      position: fixed;
      right: 2rem;
      bottom: 2rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-notes': TadyNotes
  }
}
