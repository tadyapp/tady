import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/button/button.styles.js'
import { css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import './components/create/tady-create-note.js'
import './components/nostr-short-text-note.js'
import type { EventFilter, EventFilterConfig } from './utils/fiilter.js'

export type FilterChangeEvent = CustomEvent<{ apply: EventFilter }>

@customElement('tady-filters')
export class TadyFilters extends LitElement {
  @property({ attribute: false }) filters = new Map<string, EventFilterConfig>()

  @state()
  private _selected = new Set<string>()

  private _emit() {
    const apply: EventFilter = events => {
      let result = [...events]
      for (const key of this._selected) {
        const def = this.filters.get(key)
        if (def) result = def.filter(result)
      }
      return result
    }

    const event: FilterChangeEvent = new CustomEvent('filter-change', {
      detail: { apply },
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(event)
  }

  private _toggle(key: string) {
    const next = new Set(this._selected)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
      this.filters.get(key)?.exclude?.forEach(k => next.delete(k))
    }
    this._selected = next
    this._emit()
  }

  render() {
    return html`<div
      role="toolbar"
      aria-labelledby="filter-heading"
      class="filters"
    >
      <header id="filter-heading">
        <wa-icon name="filter" label="Filter results"></wa-icon>
      </header>
      ${repeat(
        this.filters.keys(),
        key => key,
        key => {
          const active = this._selected.has(key)
          return html`<wa-button
            aria-pressed=${active ? 'true' : 'false'}
            size="small"
            pill
            appearance=${active ? 'accent' : 'outlined'}
            @click=${() => this._toggle(key)}
            >${key}</wa-button
          >`
        },
      )}
    </div>`
  }

  static styles = css`
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      margin: 0.5rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-filters': TadyFilters
  }
}
