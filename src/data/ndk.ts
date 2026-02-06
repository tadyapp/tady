// Import the package
import NDK from '@nostr-dev-kit/ndk'

// Create a new NDK instance with explicit relays
export const ndk = new NDK({
  explicitRelayUrls: ['wss://nos.lol'],
})

await ndk.connect()
