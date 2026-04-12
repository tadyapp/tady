import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/input/input.js'
import '@awesome.me/webawesome/dist/components/textarea/textarea.js'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { z } from 'zod'
import { locationAuto, locationSelected } from '../../data/location'
import { substrings } from '../../utils/geo'
import { dayRangeSinceEpoch } from '../../utils/nostr'
import type { NDKEventSubmitEvent } from './tady-create-form'

const localDatetimeToUnixTimestamp = z.codec(
  z.iso.datetime({ local: true }),
  z
    .number()
    .int()
    .positive()
    .max(9999999999, 'Looks like milliseconds, not unix timestamp'),
  {
    decode: localDate => Math.round(new Date(localDate).getTime() / 1000),
    encode: unixTimestamp => new Date(unixTimestamp * 1000).toISOString(),
  },
)

const calendarEventFormSchema = z.object({
  start: localDatetimeToUnixTimestamp,
  end: localDatetimeToUnixTimestamp.optional(),
  title: z.string(),
  summary: z.string().optional(),
  content: z.string().optional(),
  location: z.string().optional(),
  geohash: z
    .string()
    .regex(/^[0-9b-hjkmnp-z]+$/, 'Invalid geohash characters')
    .min(1, 'Geohash too short')
    .max(12, 'Geohash too long')
    .transform(s => s.toLowerCase()), // Normalize before validating ideally,
  media: z.array(z.instanceof(File)),
})

@customElement('tady-create-calendar-event-form')
export class TadyCreateCalendarEventForm extends LitElement {
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

    const values = calendarEventFormSchema.parse(rawValues)

    const tags: string[][] = []

    // add geohash tags
    const geohashTags = values.geohash
      ? substrings(values.geohash).map(g => ['g', g])
      : []
    tags.push(...geohashTags)
    // add unique identifier
    tags.push(['d', crypto.randomUUID()])
    // add start and end timestamps
    tags.push(['start', values.start.toString()])
    if (values.end) tags.push(['end', values.end.toString()])

    // add day identifiers
    const daysSinceEpoch = dayRangeSinceEpoch(
      values.start,
      values.end ?? values.start,
    )
    const tagsD = daysSinceEpoch.map(d => ['D', d.toString()])
    tags.push(...tagsD)

    // add content
    tags.push(['title', values.title])
    if (values.summary) tags.push(['summary', values.summary])

    const event = new NDKEvent(undefined, {
      kind: 31923,
      content: values.content ?? '',
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
        type="datetime-local"
        name="start"
        label="start"
        required
      ></wa-input>
      <wa-input type="datetime-local" name="end" label="end"></wa-input>
      <wa-input
        type="text"
        name="title"
        label="title"
        placeholder="title"
        required
      ></wa-input>
      <wa-textarea
        name="summary"
        label="summary"
        placeholder="summary"
      ></wa-textarea>
      <wa-textarea
        name="content"
        label="content"
        placeholder="content"
      ></wa-textarea>
      <wa-input
        type="text"
        label="location"
        name="location"
        placeholder="place name, address …"
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
