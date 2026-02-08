import '@awesome.me/webawesome/dist/components/avatar/avatar.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('nostr-avatar')
export class NostrAvatar extends LitElement {
  @property({ attribute: false })
  profile: NDKUserProfile | null = null

  render() {
    const avatarLabel = `Avatar of ${this.profile?.name}`
    const nameWords = this.profile?.name?.split(/\s+/)
    const firstLetter = nameWords?.shift()?.[0] ?? ''
    const lastLetter = nameWords?.pop()?.[0] ?? ''
    const initials = firstLetter + lastLetter

    return html`
      <wa-avatar
        image=${ifDefined(this.profile?.picture)}
        label=${avatarLabel}
        initials=${initials}
      >
        <wa-icon name="person"></wa-icon>
      </wa-avatar>
    `
  }

  static styles = css`
    wa-avatar {
      --size: var(--avatar-size, 2rem);
    }
  `
}
