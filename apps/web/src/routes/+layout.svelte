<script lang='ts'>
  import favicon from '$lib/assets/favicon.svg'
  import { TooltipProvider } from '$lib/components/ui/tooltip'
  import { localeStore, syncDocumentLocale } from '$lib/i18n'
  import { hydrateAuth } from '$lib/stores/auth'
  import { applyDocumentTheme, getPreferencesSnapshot, watchSystemTheme } from '$lib/stores/preferences'
  import { onMount } from 'svelte'
  import './layout.css'

  const { children } = $props()

  onMount(() => {
    hydrateAuth()
    syncDocumentLocale()

    return watchSystemTheme(() => {
      if (getPreferencesSnapshot().themePreference === 'system') {
        applyDocumentTheme('system')
      }
    })
  })
</script>

<svelte:head><link rel='icon' href={favicon} /></svelte:head>

<TooltipProvider delayDuration={180} skipDelayDuration={80}>
  {#key $localeStore}
    {@render children()}
  {/key}
</TooltipProvider>
