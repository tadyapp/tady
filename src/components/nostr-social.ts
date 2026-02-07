import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import { ndk } from '../data/ndk'

@customElement('nostr-social')
export class NostrSocial extends LitElement {
  @property()
  eventId!: string

  @state()
  private _replies: NDKEvent[] = []
  @state()
  private _reposts: NDKEvent[] = []
  @state()
  private _reactions: NDKEvent[] = []

  private _sub?: NDKSubscription

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('eventId')) {
      this._replies = []
      this._reposts = []
      this._reactions = []
      this._sub?.stop()
      this._sub = ndk.subscribe(
        [{ kinds: [1, 6, 7], '#e': [this.eventId] }],
        { closeOnEose: false },
        {
          onEvent: event => {
            switch (event.kind) {
              case 1: {
                this._replies = [...this._replies, event]
                break
              }
              case 6: {
                this._reposts = [...this._reposts, event]
                break
              }
              case 7: {
                this._reactions = [...this._reactions, event]
                this._reactions.push(event)
                break
              }
            }
          },
        },
      )
    }
  }

  @state()
  private _repliesOpen = false

  render() {
    const reactionGroups = groupReactions(this._reactions)
    const entries = [...reactionGroups.entries()].sort(
      (a, b) => b[1].size - a[1].size,
    )

    const replies = html`
      ${repeat(
        [...this._replies].reverse(),
        reply => reply.id,
        reply =>
          html`<nostr-short-text-note
            .nostrEvent=${reply}
          ></nostr-short-text-note>`,
      )}
    `

    return html`<div>
      <div class="reactions-list">
        ${repeat(
          entries,
          entry => entry[0],
          entry =>
            html`<nostr-emoji-group
              identifier=${entry[0]}
              .events=${entry[1]}
            ></nostr-emoji-group>`,
        )}
      </div>
      ${this._replies.length > 0
        ? html`<button
            .onclick=${() => {
              this._repliesOpen = !this._repliesOpen
            }}
          >
            replies: ${this._replies.length}
          </button>`
        : html`replies: 0`}
      reposts: ${this._reposts.length} ${this._repliesOpen ? replies : null}
    </div>`
  }

  static styles = css`
    .reactions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: stretch;
    }
  `
}

@customElement('nostr-emoji-group')
export class NostrEmojiGroup extends LitElement {
  @property()
  identifier!: Identifier
  @property({ attribute: false })
  events!: Set<NDKEvent>

  render() {
    const reaction = (() => {
      if (this.identifier === 'like') return '👍'
      if (this.identifier === 'dislike') return '👎'
      if (this.identifier.startsWith('emoji:'))
        return this.identifier.split(':')[1]
      if (this.identifier.startsWith('custom:'))
        return html`<img
          class="custom-emoji"
          src=${this.identifier.split(':').slice(2).join(':')}
          alt=${this.identifier.split(':')[1]}
          title=${`:${this.identifier.split(':')[1]}:`}
        />`
    })()

    return html`<span class="emoji-group"
      >${reaction} ${this.events.size}</span
    >`
  }

  static styles = css`
    .emoji-group {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;

      border: 1px solid darkgray;
      border-radius: 2rem;
      padding: 0.125rem 0.5rem;
    }

    .custom-emoji {
      height: 1rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'nostr-social': NostrSocial
  }
}

type Identifier =
  | 'like'
  | 'dislike'
  | `emoji:${string}`
  | `custom:${string}:${string}`

/**
 * A helper that groups same reactions together
 */
const groupReactions = (reactions: Iterable<NDKEvent>) => {
  const group = new Map<Identifier, Set<NDKEvent>>()
  for (const reaction of reactions) {
    const identifier = getIdentifier(reaction)
    if (!identifier) continue
    if (!group.has(identifier)) group.set(identifier, new Set())
    group.get(identifier)!.add(reaction)
  }
  return group
}

const getIdentifier = (reaction: NDKEvent): Identifier | null => {
  if (reaction.content === '' || reaction.content === '+') return 'like'
  if (reaction.content === '-') return 'dislike'
  if (/^\p{Emoji}$/u.test(reaction.content)) return `emoji:${reaction.content}`
  if (/^:.*:/u.test(reaction.content)) {
    const tag = reaction.tags.find(
      tag => tag[0] === 'emoji' && tag[1] === reaction.content.slice(1, -1),
    )

    if (tag) {
      try {
        new URL(tag[2])
        return `custom:${tag[1]}:${tag[2]}`
      } catch {
        /*nothing to do*/
      }
    }
  }

  return null
}
