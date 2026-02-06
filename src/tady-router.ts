import { Router } from '@lit-labs/router'
import { SignalWatcher, watch } from '@lit-labs/signals'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { locationSelected } from './data/location.js'
import { navigate } from './navigate.js'
import './tady-events.js'
import './tady-market.js'
import './tady-news.js'

export let router: Router

@customElement('tady-router')
export class TadyRouter extends SignalWatcher(LitElement) {
  private _router = new Router(this, [
    {
      name: 'home',
      path: '/',
      enter: () => {
        navigate(this._router.link('news'))
        return false
      },
    },
    {
      name: 'news',
      path: '/news',
      render: () =>
        html`<tady-news
          locationSelected=${watch(locationSelected)}
        ></tady-news>`,
    },
    {
      name: 'events',
      path: '/events',
      render: () => html`<tady-events></tady-events>`,
    },
    {
      name: 'market',
      path: '/market',
      render: () => html`<tady-market></tady-market>`,
    },
    { path: '/*', render: () => html`404` },
  ])

  connectedCallback(): void {
    super.connectedCallback()
    router = this._router
  }

  render() {
    return this._router.outlet()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-router': TadyRouter
  }
}
