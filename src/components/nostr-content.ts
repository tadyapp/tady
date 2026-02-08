import type { NDKEvent } from '@nostr-dev-kit/ndk'
import { FragmentType, transformText, type ParsedFragment } from '@snort/system'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import './nostr-invoice.js'
import './nostr-mention.js'

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
        return html`<nostr-mention
          identifier=${this.fragment.content}
        ></nostr-mention>`
      }
      case FragmentType.Invoice: {
        return html`<nostr-invoice
          invoice=${this.fragment.content}
        ></nostr-invoice>`
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
