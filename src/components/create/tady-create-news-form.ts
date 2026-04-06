import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/dialog/dialog.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import { SignalWatcher } from '@lit-labs/signals'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { locationAuto, locationSelected } from '../../data/location.js'
import { blossom } from '../../data/ndk.js'
import { substrings } from '../../utils/geo.js'
import '../geo-select-geohash.js'

export interface NewsFormValues {
  content: string
  geohash: string
  media: File[]
}

export type NDKEventSubmitEvent = CustomEvent<{
  event: NDKEvent
  media: File[]
}>

@customElement('tady-create-news-form')
export class TadyCreateNewsForm extends SignalWatcher(LitElement) {
  @state() values: Partial<NewsFormValues> = {}

  private _submit(e: SubmitEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const values = {
      ...Object.fromEntries(formData.entries()),
      media: formData
        .getAll('media')
        .filter(f => f instanceof File && f.name && f.size),
    } as unknown as NewsFormValues

    const event = new NDKEvent(undefined, {
      kind: 1,
      content: values.content,
      tags: values.geohash
        ? substrings(values.geohash).map(g => ['g', g])
        : undefined,
    })

    const submitEvent: NDKEventSubmitEvent = new CustomEvent('form-submit', {
      detail: {
        event,
        media: values.media,
      },
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

  private async _change(e: Event) {
    const input = e.target as HTMLInputElement
    const value =
      input.type === 'file' ? Array.from(input.files || []) : input.value
    const nextValues = { ...this.values, [input.name]: value }

    // include file identifiers within the content
    if (
      input.type === 'file' &&
      input.name === 'media' &&
      Array.isArray(value) &&
      value.length > 0 &&
      value[0] instanceof File
    ) {
      const calculator = blossom.getSHA256Calculator()

      nextValues.content ??= ''
      for (const medium of value) {
        nextValues.content += `\n${(await calculator.calculateSha256(medium)).slice(0, 16)}-${medium.name}`
      }
    }

    this.values = nextValues
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
          <label>Media</label>
          <input type="file" multiple accept="image/*,video/*" name="media" />
        </div>
        <div>
          <label for="news-form-content">Content</label>
          <textarea
            id="news-form-content"
            name="content"
            .value=${this.values.content ?? ''}
          ></textarea>
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
