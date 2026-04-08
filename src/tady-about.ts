import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/components/icon/icon.styles.js'
import '@awesome.me/webawesome/dist/components/markdown/markdown.js'
import '@awesome.me/webawesome/dist/components/markdown/markdown.styles.js'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import content from '../README.md?raw'

@customElement('tady-about')
export class TadyAbout extends LitElement {
  render() {
    return html`<!-- prettier-ignore -->
      <wa-markdown>
        <script type="text/markdown">
[<wa-icon name="git" family="brands"></wa-icon>](https://github.com/tadyapp/tady.git)

${content}
        </script>
      </wa-markdown>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tady-about': TadyAbout
  }
}
