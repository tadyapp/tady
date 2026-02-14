import './update.js'

export const relays = import.meta.env.VITE_RELAYS?.split(/,\s*/) ?? [
  'wss://nos.lol',
]
