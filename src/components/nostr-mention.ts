import '@awesome.me/webawesome/dist/components/avatar/avatar.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ndk } from '../data/ndk'
import './nostr-avatar.js'

@customElement('nostr-mention')
export class NostrMention extends LitElement {
  @property()
  identifier!: string

  @state()
  _user: NDKUser | null = null
  @state()
  _profile: NDKUserProfile | null = null

  protected async willUpdate(_changedProperties: PropertyValues) {
    if (_changedProperties.has('identifier')) {
      this._user = (await ndk.fetchUser(this.identifier.slice(6))) ?? null
      const profile = await this._user?.fetchProfile()
      this._profile = profile ?? null
    }
  }

  render() {
    return html`<span class="mention">
      <nostr-avatar .profile=${this._profile}></nostr-avatar>
      ${this._profile?.displayName ??
      this._user?.npub ??
      this.identifier.slice(6, 20)}</span
    >`
  }

  static styles = css`
    .mention {
      white-space: normal;
      font-weight: bold;
    }

    nostr-avatar {
      --avatar-size: 1rem;
    }
  `
}
