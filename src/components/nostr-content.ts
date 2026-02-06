import type { NDKEvent, NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk'
import { FragmentType, transformText, type ParsedFragment } from '@snort/system'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ndk } from '../data/ndk'

@customElement('nostr-content')
export class NostrContent extends LitElement {
  @property({ attribute: false })
  event!: NDKEvent

  render() {
    const parsedContent = transformText(this.event.content, this.event.tags)

    return html`<!--prettier-ignore -->
      <div class="content">${parsedContent.map(
        fragment =>
          html`<snort-fragment .fragment=${fragment}></snort-fragment></div>`,
      )}</div>`
  }

  static styles = css`
    .content {
      white-space: pre-line;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'nostr-content': NostrContent
  }
}

@customElement('snort-fragment')
export class SnortFragment extends LitElement {
  @property({ attribute: false })
  fragment!: ParsedFragment

  render() {
    switch (this.fragment.type) {
      case FragmentType.Text: {
        const text = this.fragment.content.replace(/(\n\s*)+/, '\n')

        return html`<span class="text">${text}</span>`
      }
      case FragmentType.Hashtag: {
        return html`<span class="hashtag">#${this.fragment.content}</span>`
      }
      case FragmentType.Media: {
        const data = this.fragment.data as
          | {
              thumb?: string
              url?: string
              alt?: string
            }
          | undefined

        return html`<img
          class="media"
          src=${data?.thumb ?? data?.url ?? this.fragment.content}
          alt=${ifDefined(data?.alt)}
        />`
      }
      case FragmentType.Link: {
        return html`<a href=${this.fragment.content}
          >${this.fragment.content}</a
        >`
      }
      case FragmentType.Mention: {
        return html`<nostr-user-mention
          identifier=${this.fragment.content}
        ></nostr-user-mention>`
      }
      default: {
        return html`<pre>${JSON.stringify(this.fragment, null, 2)}</pre>`
      }
    }
  }

  static styles = css`
    /* .text {
      /* white-space: pre-wrap; * /
      border: 2px dotted pink;
      padding: 0.125rem;
      background-color: #f0f3;
    } */

    .media {
      display: block;
      /* margin: 0.5rem; */
      max-width: min(100%, 256px);
      max-height: 256px;
    }
    .hashtag {
      color: lightblue;
    }
  `
}

@customElement('nostr-user-mention')
export class NostrUserMention extends LitElement {
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
    return html`<span class="mention"
      >${this._profile?.picture
        ? html`<img src=${this._profile.picture} />`
        : null}
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
  `
}
