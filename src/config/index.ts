import './update.js'

export const relays: string[] = import.meta.env.VITE_RELAYS?.split(/,\s*/) ?? [
  'wss://nos.lol',
]

export const blossomServers: string[] =
  import.meta.env.VITE_BLOSSOM_SERVERS?.split(/,\s*/) ?? [
    'https://blossom.band',
  ]
