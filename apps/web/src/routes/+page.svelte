<script lang='ts'>
  import { goto } from '$app/navigation'
  import { translate as t } from '$lib/i18n'
  import { appShell, buildWorkspacePath } from '$lib/stores/app-shell'
  import { onMount } from 'svelte'

  onMount(async () => {
    appShell.hydrate()

    const snapshot = appShell.getSnapshot()

    if (!snapshot.isLoggedIn) {
      await goto('/login', { replaceState: true })
      return
    }

    await goto(buildWorkspacePath(snapshot.activeTaskId, snapshot.activePanel), { replaceState: true })
  })
</script>

<div class='shell-panel flex min-h-[50vh] items-center justify-center px-4 py-6 text-sm text-muted-foreground'>
  {t('workspace_loading')}
</div>
