import { Router } from '@lit-labs/router'
import { SignalWatcher } from '@lit-labs/signals'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { activeType } from './data/things.js'
import './tady-about.js'
import './tady-events.js'
import './tady-list.js'
import './tady-market.js'
import './tady-notes.js'
import { navigate } from './utils/navigate.js'

export let router: Router

@customElement('tady-router')
export class TadyRouter extends SignalWatcher(LitElement) {
  private _router = new Router(
    this,
    [
      {
        name: 'home',
        path: '/',
        enter: () => {
          navigate(this._router.link('notes'))
          return false
        },
      },
      {
        name: 'notes',
        path: '/notes',
        enter: () => {
          activeType.set('notes')
          return true
        },
        render: () => html`<tady-notes></tady-notes>`,
      },
      {
        name: 'events',
        path: '/events',
        enter: () => {
          activeType.set('events')
          return true
        },
        render: () => html`<tady-events></tady-events>`,
      },
      {
        name: 'market',
        path: '/market',
        enter: () => {
          activeType.set('market')
          return true
        },
        render: () => html`<tady-market></tady-market>`,
      },
      {
        name: 'about',
        path: '/about',
        enter: () => {
          activeType.set(undefined)
          return true
        },
        render: () => html`<tady-about></tady-about>`,
      },
    ],
    {
      fallback: {
        enter: () => {
          activeType.set(undefined)
          return true
        },
        render: () => html`404`,
      },
    },
  )

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
