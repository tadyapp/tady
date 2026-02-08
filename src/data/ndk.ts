// TODO replace with @nostr-dev-kit/cache-dexie after https://github.com/nostr-dev-kit/ndk/pull/377 gets published
import NDKCacheAdapterDexie from '@mrkvon/ndk-cache-dexie'
import NDK from '@nostr-dev-kit/ndk'

const cacheAdapter = new NDKCacheAdapterDexie({
  dbName: 'tady-app',
})

// Create a new NDK instance with explicit relays
export const ndk = new NDK({
  cacheAdapter,
  explicitRelayUrls: ['wss://nos.lol'],
})

ndk
  .connect()
  .catch(err =>
    console.warn(
      `ndk connection failed: ${err instanceof Error ? err.message : err} Continuing in offline mode.`,
      err,
    ),
  )
