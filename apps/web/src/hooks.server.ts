import type { Handle } from '@sveltejs/kit'
import { getTextDirection } from '$lib/paraglide/runtime.js'
import { paraglideMiddleware } from '$lib/paraglide/server.js'

export const handle: Handle = async ({ event, resolve }) => {
  return paraglideMiddleware(event.request, ({ locale }) => {
    return resolve(event, {
      transformPageChunk: ({ html }) => {
        return html
          .replace('%lang%', locale)
          .replace('%dir%', getTextDirection(locale))
      },
    })
  })
}
