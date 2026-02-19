import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/dialog/dialog.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import { SignalWatcher } from '@lit-labs/signals'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { locationAuto, locationSelected } from '../../data/location.js'
import { substrings } from '../../utils/geo.js'
import '../geo-select-geohash.js'
import './tady-identity-select.js'

export interface NewsFormValues {
  content: string
  geohash: string
}

export type NDKEventSubmitEvent = CustomEvent<NDKEvent>

@customElement('tady-create-news-form')
export class TadyCreateNewsForm extends SignalWatcher(LitElement) {
  @state() values: Partial<NewsFormValues> = {}

  private _submit(e: SubmitEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const values = Object.fromEntries(
      formData.entries(),
    ) as unknown as NewsFormValues

    const event = new NDKEvent(undefined, {
      kind: 1,
      content: values.content,
      tags: values.geohash
        ? substrings(values.geohash).map(g => ['g', g])
        : undefined,
    })

    const submitEvent: NDKEventSubmitEvent = new CustomEvent('form-submit', {
      detail: event,
      bubbles: true,
      composed: true,
    })
    console.log('dispatching form-submit', submitEvent.detail)
    this.dispatchEvent(submitEvent)
  }

  private _reset() {
    this.values = {}
    this.dispatchEvent(
      new Event('form-reset', {
        bubbles: true,
        composed: true,
      }),
    )
  }

  private _change(e: Event) {
    const input = e.target as HTMLInputElement
    this.values = { ...this.values, [input.name]: input.value }
  }

  render() {
    return html`
      <form
        id="create-news-form"
        data-testid="create-news-form"
        @submit=${this._submit}
        @reset=${this._reset}
        @input=${this._change}
      >
        <div>
          <label for="news-form-content">Content</label>
          <textarea id="news-form-content" name="content"></textarea>
        </div>
        <geo-select-geohash
          name="geohash"
          .location=${locationAuto.get() ?? locationSelected.get()}
        ></geo-select-geohash>
        <button type="submit">Submit</button>
        <button type="reset">Cancel</button>
      </form>
    `
  }
}
