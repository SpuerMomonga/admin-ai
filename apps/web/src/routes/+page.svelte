<script lang='ts'>
  import { goto } from '$app/navigation'
  import { buildWorkspacePath } from '$lib/stores/admin-tabs'
  import { translate as t } from '$lib/stores/i18n'
  import { getSessionSnapshot, hydrateSession } from '$lib/stores/session'
  import { onMount } from 'svelte'

  onMount(async () => {
    hydrateSession()

    const snapshot = getSessionSnapshot()

    if (!snapshot.isLoggedIn) {
      await goto('/login', { replaceState: true })
      return
    }

    await goto(buildWorkspacePath(snapshot.activeTaskId, snapshot.activeAdminPath), { replaceState: true })
  })
</script>

<div class='shell-panel flex min-h-[50vh] items-center justify-center px-4 py-6 text-sm text-muted-foreground'>
  {t('workspace_loading')}
</div>
