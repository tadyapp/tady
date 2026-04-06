// TODO replace with @nostr-dev-kit/cache-dexie after https://github.com/nostr-dev-kit/ndk/pull/377 gets published
import { NDKBlossom } from '@nostr-dev-kit/blossom'
import NDKCacheAdapterDexie from '@nostr-dev-kit/cache-dexie'
import NDK, { NDKBlossomList } from '@nostr-dev-kit/ndk'
import { blossomServers, relays } from '../config'

const cacheAdapter = new NDKCacheAdapterDexie({
  dbName: 'tady-app',
})

// Create a new NDK instance with explicit relays
export const ndk = new NDK({
  cacheAdapter,
  explicitRelayUrls: relays,
})

export const blossom = new NDKBlossom(ndk)
const serverList = new NDKBlossomList(ndk)
serverList.servers = blossomServers
blossom.serverList = serverList

ndk
  .connect()
  .catch(err =>
    console.warn(
      `ndk connection failed: ${err instanceof Error ? err.message : err} Continuing in offline mode.`,
      err,
    ),
  )
