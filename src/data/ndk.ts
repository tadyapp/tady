// Import the package
import NDK from '@nostr-dev-kit/ndk'

// Create a new NDK instance with explicit relays
export const ndk = new NDK({
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
