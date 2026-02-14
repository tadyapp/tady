import { expect, Locator, Page } from '@playwright/test'
import { ConfigType } from '../src/config/update.js'

export const updateAppConfig = async (
  page: Page,
  config: Partial<ConfigType>,
  { path = '/', locator }: { path?: string; locator?: Locator } = {},
) => {
  locator ??= page.getByRole('button', { name: 'Sign in' })
  await page.goto(path)
  await expect(locator).toBeVisible()
  await page.evaluate(`globalThis.updateAppConfig(${JSON.stringify(config)})`)
}
