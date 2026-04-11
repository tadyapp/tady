import { imetaTagToTag } from '@nostr-dev-kit/ndk'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { blossom, ndk } from '../../data/ndk'
import type { AuthenticatedSubmitEvent } from './tady-authenticated-form'

// Listens for NDKEvent with signer and media, and publishes it.
@customElement('tady-nostr-publisher')
export class TadyNostrPublisher extends LitElement {
  private async _handleAuthenticatedSubmit(e: AuthenticatedSubmitEvent) {
    try {
      const { event, media, signer } = e.detail
      await blossom.getServerList(await signer.user())

      for (const file of media) {
        const imeta = await blossom.upload(file, {
          maxRetries: 0,
          signer,
        })

        if (!imeta.url) throw new Error('no media url')

        const placeholder = `${(
          await blossom.getSHA256Calculator().calculateSha256(file)
        ).slice(0, 16)}-${file.name}`

        event.content = event.content.replaceAll(placeholder, imeta.url).trim()

        const imetaTag = imetaTagToTag(imeta)
        event.tags.push(imetaTag)
      }

      await event.sign(signer)

      event.ndk = ndk

      await event.publish()

      this.dispatchEvent(
        new Event('publish-success', {
          bubbles: true,
          composed: true,
        }),
      )
    } catch (err) {
      this.dispatchEvent(
        new CustomEvent('publish-error', {
          detail: { error: err },
          bubbles: true,
          composed: true,
        }),
      )
    }
  }

  render() {
    return html`
      <div @authenticated-submit=${this._handleAuthenticatedSubmit}>
        <slot></slot>
      </div>
    `
  }
}
