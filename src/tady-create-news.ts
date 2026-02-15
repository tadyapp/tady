import '@awesome.me/webawesome/dist/components/dialog/dialog.js'
import type WaDialog from '@awesome.me/webawesome/dist/components/dialog/dialog.js'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import { SignalWatcher } from '@lit-labs/signals'
import { css, html, LitElement } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import './components/geo-select-geohash'
import { locationAuto, locationSelected } from './data/location'

interface FormValues {
  content: string
  geohash: string
}

@customElement('tady-create-news')
export class TadyCreateNews extends SignalWatcher(LitElement) {
  @query('#create-news-dialog')
  _dialog!: WaDialog

  _open() {
    this._dialog.open = true
  }
  _close() {
    this._dialog.open = false
  }

  @state()
  values: Partial<FormValues> = {}

  private _submit(e: SubmitEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const formValues = Object.fromEntries(
      formData.entries(),
    ) as Partial<FormValues>
    this.values = formValues
    console.log(formValues)
    // const event = new CustomEvent('confirm', { detail: { data: formValues } })
    // this.dispatchEvent(event)
  }

  private _change(e: Event) {
    const input = e.target as HTMLInputElement
    const name = input.name as keyof FormValues
    this.values = { ...this.values, [name]: input.value }
  }

  render() {
    return html`<button @click=${this._open}>
        <wa-icon name="plus" label="Create news"></wa-icon>
      </button>
      <wa-dialog id="create-news-dialog" label="Event source">
        <pre>${JSON.stringify(this.values, null, 2)}</pre>
        <form
          id="create-news-form"
          data-testid="create-news-form"
          @submit=${this._submit}
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
        </form>
        <button slot="footer" form="create-news-form" type="submit">
          Submit
        </button>
        <button slot="footer" form="create-news-form" type="reset">
          Cancel
        </button>
      </wa-dialog>`
  }

  static styles = css`
    ::part(dialog) {
      background-color: var(--background-color);
      color: var(--text-color);
    }
  `
}
