// tady-create-news.ts
import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { css, html, LitElement } from 'lit'
import { customElement, query } from 'lit/decorators.js'
import { ndk } from '../../data/ndk'
import './tady-authenticated-form.js'
import type { AuthenticatedSubmitEvent } from './tady-authenticated-form.js'
import './tady-create-news-form.js'
import type { NewsFormValues } from './tady-create-news-form.js'
import './tady-form-dialog.js'
import type { TadyFormDialog } from './tady-form-dialog.js'

@customElement('tady-create-news')
export class TadyCreateNews extends LitElement {
  @query('tady-form-dialog') private _dialog!: TadyFormDialog

  private async _publish(e: AuthenticatedSubmitEvent<NewsFormValues>) {
    const { values, signer } = e.detail

    try {
      const event = new NDKEvent(ndk, {
        kind: 1,
        content: values.content,
        tags: values.geohash
          ? substrings(values.geohash).map(g => ['g', g])
          : undefined,
      })
      await event.sign(signer)
      await event.publish()

      this._dialog.close()
    } catch (e) {
      alert(e instanceof Error ? e.message : e)
    }
  }

  render() {
    return html`
      <tady-form-dialog label="Create news" close-on="form-reset">
        <wa-button slot="trigger" part="trigger" appearance="accent">
          <wa-icon name="plus" label="Create news"></wa-icon>
        </wa-button>

        <tady-authenticated-form @authenticated-submit=${this._publish}>
          <tady-create-news-form></tady-create-news-form>
        </tady-authenticated-form>
      </tady-form-dialog>
    `
  }

  static styles = css`
    tady-form-dialog::part(trigger) {
      display: block;
      position: fixed;
      right: 2rem;
      bottom: 2rem;
    }
  `
}

const substrings = (s: string) =>
  Array.from({ length: s.length }, (_, i) => s.slice(0, s.length - i))

declare global {
  interface HTMLElementTagNameMap {
    'tady-create-news': TadyCreateNews
  }
}
