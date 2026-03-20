<script lang='ts'>
  import favicon from '$lib/assets/favicon.svg'
  import { TooltipProvider } from '$lib/components/ui/tooltip'
  import { getSystemPreferencesSnapshot } from '$lib/stores/preferences'
  import { hydrateSession } from '$lib/stores/session'
  import { applyDocumentTheme, watchSystemTheme } from '$lib/stores/theme'
  import { onMount } from 'svelte'
  import './layout.css'

  const { children } = $props()

  onMount(() => {
    hydrateSession()

    return watchSystemTheme(() => {
      if (getSystemPreferencesSnapshot().themePreference === 'system') {
        applyDocumentTheme('system')
      }
    })
  })
</script>

<svelte:head><link rel='icon' href={favicon} /></svelte:head>

<TooltipProvider delayDuration={180} skipDelayDuration={80}>
  {@render children()}
</TooltipProvider>
