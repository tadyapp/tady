import { ndk } from '../data/ndk.js'
import * as config from './index.js'

export type ConfigType = typeof config

globalThis.updateAppConfig = async newConfig => {
  if (newConfig.relays) {
    ndk.explicitRelayUrls = newConfig.relays
    await ndk.connect()
  }

  return { ...config, ...newConfig }
}

declare global {
  var updateAppConfig: (newConfig: Partial<ConfigType>) => Promise<ConfigType>
}
