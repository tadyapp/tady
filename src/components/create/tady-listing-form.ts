import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/input/input.js'
import '@awesome.me/webawesome/dist/components/textarea/textarea.js'
import { SignalWatcher } from '@lit-labs/signals'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import z from 'zod'
import { locationAuto, locationSelected } from '../../data/location.js'
import { substrings } from '../../utils/geo.js'
import type { NDKEventSubmitEvent } from './tady-create-form.js'

const classifiedFormSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim(),
  content: z.string().trim(),
  location: z.string().trim().optional(),
  media: z.array(z.instanceof(File)),
  amount: z.preprocess(
    (val?: string) => (val?.trim?.() === '' ? NaN : val),
    z.coerce.number().nonnegative(),
  ),
  currency: z.string().regex(/^[A-Z]{3,4}$/),
  frequency: z.string().optional(),
  geohash: z
    .string()
    .regex(/^[0-9b-hjkmnp-z]+$/, 'Invalid geohash characters')
    .min(5, 'Precision too low')
    .max(12, 'Precision too high')
    .transform(s => s.toLowerCase()), // Normalize before validating ideally,
})

@customElement('tady-listing-form')
export class TadyListingForm extends SignalWatcher(LitElement) {
  private _submit(e: SubmitEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const rawValues = {
      ...Object.fromEntries(formData.entries()),
      media: formData
        .getAll('media')
        .filter(f => f instanceof File && f.name && f.size),
    }

    const values = classifiedFormSchema.parse(rawValues)

    const tags: string[][] = []

    // add geohash tags
    const geohashTags = values.geohash
      ? substrings(values.geohash).map(g => ['g', g])
      : []
    tags.push(...geohashTags)
    // add unique identifier
    tags.push(['d', crypto.randomUUID()])

    // add content
    tags.push(['title', values.title])
    tags.push(['summary', values.summary])
    if (values.location) tags.push(['location', values.location])

    const priceTag: string[] = [
      'price',
      String(values.amount),
      values.currency ?? '',
    ]

    if (values.frequency) priceTag.push(values.frequency)

    tags.push(priceTag)

    const event = new NDKEvent(undefined, {
      kind: 30402,
      content: values.content,
      tags,
    })

    const submitEvent: NDKEventSubmitEvent = new CustomEvent('form-submit', {
      detail: {
        event,
        media: values.media,
      },
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(submitEvent)
  }
  render() {
    return html`<form @submit=${this._submit}>
      <wa-input
        name="title"
        label="title"
        placeholder="title"
        required
      ></wa-input>
      <wa-input
        name="summary"
        label="summary"
        placeholder="summary"
        required
      ></wa-input>
      <div class="price">
        <wa-input
          name="amount"
          type="number"
          .withoutSpinButtons=${true}
          min="0"
          label="price"
          placeholder="00"
        ></wa-input>
        <wa-input
          name="currency"
          type="text"
          label="currency"
          placeholder="EUR"
        ></wa-input>
        <wa-input
          name="frequency"
          type="text"
          label="per frequency"
          placeholder="month"
        ></wa-input>
      </div>
      <wa-textarea
        name="content"
        label="content"
        placeholder="content"
      ></wa-textarea>
      <wa-input
        type="text"
        label="location"
        name="location"
        placeholder="place name, approximate address …"
      ></wa-input>
      <geo-select-geohash
        name="geohash"
        .location=${locationAuto.get() ?? locationSelected.get()}
      ></geo-select-geohash>
      <div class="actions">
        <wa-button type="reset" appearance="outlined">Cancel</wa-button>
        <wa-button type="submit" appearance="filled">Submit</wa-button>
      </div>
    </form>`
  }

  static styles = css`
    form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .price {
        display: flex;
        gap: 0.5rem;

        wa-input {
          /* flex: 1; */
          min-width: 0;
        }
      }
    }

    .actions {
      display: flex;
      justify-content: stretch;
      gap: 1rem;

      wa-button {
        flex: 1;
      }
    }
  `
}
