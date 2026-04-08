import { Router } from '@lit-labs/router'
import { SignalWatcher, watch } from '@lit-labs/signals'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import {
  activeLocationType,
  locationAuto,
  locationSelected,
  radius,
} from './data/location.js'
import { activeType, typeKinds } from './data/things.js'
import './tady-about.js'
import './tady-list.js'
import './tady-notes.js'
import { navigate } from './utils/navigate.js'

export let router: Router

@customElement('tady-router')
export class TadyRouter extends SignalWatcher(LitElement) {
  private _router = new Router(this, [
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
      render: () => {
        activeType.set('notes')
        return html`<tady-notes></tady-notes>`
      },
    },
    {
      name: 'events',
      path: '/events',
      render: () => {
        activeType.set('events')
        return html`<tady-list
          .locationSelected=${watch(locationSelected)}
          .locationAuto=${watch(locationAuto)}
          .activeLocationType=${watch(activeLocationType)}
          radius=${watch(radius)}
          .kinds=${typeKinds['events']}
        ></tady-list>`
      },
    },
    {
      name: 'market',
      path: '/market',
      render: () => {
        activeType.set('market')
        return html`<tady-list
          .locationSelected=${watch(locationSelected)}
          .locationAuto=${watch(locationAuto)}
          .activeLocationType=${watch(activeLocationType)}
          radius=${watch(radius)}
          .kinds=${typeKinds['market']}
        ></tady-list>`
      },
    },
    {
      name: 'about',
      path: '/about',
      render: () => html`<tady-about></tady-about>`,
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
