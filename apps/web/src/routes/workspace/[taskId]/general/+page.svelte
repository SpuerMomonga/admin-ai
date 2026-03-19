<script lang='ts'>
  import { page } from '$app/state'
  import GeneralAdminPage from '$lib/components/admin/pages/GeneralAdminPage.svelte'

  const taskId = $derived(page.params.taskId ?? '')
</script>

<GeneralAdminPage {taskId} />
