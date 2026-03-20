<script lang='ts'>
  import favicon from '$lib/assets/favicon.svg'
  import { TooltipProvider } from '$lib/components/ui/tooltip'
  import { appShell } from '$lib/stores/app-shell'
  import { applyDocumentTheme, watchSystemTheme } from '$lib/theme'
  import { onMount } from 'svelte'
  import './layout.css'

  const { children } = $props()

  onMount(() => {
    appShell.hydrate()

    return watchSystemTheme(() => {
      if (appShell.getSnapshot().themePreference === 'system') {
        applyDocumentTheme('system')
      }
    })
  })
</script>

<svelte:head><link rel='icon' href={favicon} /></svelte:head>

<TooltipProvider delayDuration={180} skipDelayDuration={80}>
  {@render children()}
</TooltipProvider>
