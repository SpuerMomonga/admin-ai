<script lang='ts'>
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import { appShell, buildWorkspacePath } from '$lib/stores/app-shell'

  onMount(async () => {
    appShell.hydrate()

    const snapshot = appShell.getSnapshot()

    if (!snapshot.isLoggedIn) {
      await goto('/login', { replaceState: true })
      return
    }

    await goto(buildWorkspacePath(null, snapshot.activePanel), { replaceState: true })
  })
</script>

<div class='shell-panel flex min-h-[50vh] items-center justify-center px-4 py-6 text-sm text-muted-foreground'>
  Redirecting workspace…
</div>
