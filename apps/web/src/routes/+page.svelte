<script lang='ts'>
  import { goto } from '$app/navigation'
  import { m } from '$lib/paraglide/messages.js'
  import { getAuthSnapshot, hydrateAuth } from '$lib/stores/auth'
  import { buildWorkspacePath, getTabsSnapshot } from '$lib/stores/tabs'
  import { getTasksSnapshot } from '$lib/stores/tasks'
  import { onMount } from 'svelte'

  onMount(async () => {
    hydrateAuth()

    const authSnapshot = getAuthSnapshot()

    if (!authSnapshot.isLoggedIn) {
      await goto('/login', { replaceState: true })
      return
    }

    await goto(buildWorkspacePath(getTasksSnapshot().activeTaskId, getTabsSnapshot().activeAdminPath), { replaceState: true })
  })
</script>

<div class='shell-panel flex min-h-[50vh] items-center justify-center px-4 py-6 text-sm text-muted-foreground'>
  {m.workspace_loading()}
</div>
