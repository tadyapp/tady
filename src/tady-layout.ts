import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import './components/geo-select-location.js'
import './tady-router.js'

/**
 * Layout
 */
@customElement('tady-layout')
export class TadyLayout extends LitElement {
  render() {
    return html`
      <header class="header">
        <geo-select-location></geo-select-location>
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
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-layout': TadyLayout
  }
}
