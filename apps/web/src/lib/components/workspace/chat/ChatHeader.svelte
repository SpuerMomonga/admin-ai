<script lang='ts'>
  import { Tooltip } from '@admin-ai/ui'
  import AppLogo from '$lib/components/AppLogo.svelte'
  import { goto } from '$app/navigation'
  import { translate as t } from '$lib/i18n'
  import { appShell, buildWorkspacePath, type AdminPanel } from '$lib/stores/app-shell'
  import WorkspaceUserMenu from './WorkspaceUserMenu.svelte'
  import { MessageCirclePlus, PanelLeftOpen, PanelRightOpen } from '@lucide/svelte'

  let { taskId, panel } = $props<{ taskId: string | null, panel: AdminPanel }>()

  const activeTask = $derived($appShell.tasks.find(task => task.id === taskId) ?? null)

  async function createTask() {
    const nextTaskId = appShell.createTask()
    await goto(buildWorkspacePath(nextTaskId, panel))
  }
</script>

<header class='flex items-start justify-between gap-3 px-3 py-2.5'>
  <div class='min-w-0'>
    {#if $appShell.leftCollapsed}
      <div class='flex items-center gap-2'>
        <AppLogo collapsed={true} />

        <Tooltip
          content={t('expand_left')}
          class='shell-panel-toggle-button'
          aria-label={t('expand_left')}
          onclick={() => appShell.setLeftCollapsed(false)}
        >
          <PanelLeftOpen class='size-[18px]' />
        </Tooltip>

        <p class='truncate text-sm font-semibold text-foreground'>
          {activeTask?.title ?? t('workspace_title')}
        </p>
      </div>
    {:else}
      <p class='truncate text-sm font-semibold text-foreground'>
        {activeTask?.title ?? t('workspace_title')}
      </p>
    {/if}
  </div>

  <div class='flex shrink-0 items-center gap-2'>
    <Tooltip
      content={t('new_task')}
      class='shell-panel-toggle-button'
      aria-label={t('new_task')}
      onclick={createTask}
    >
      <MessageCirclePlus class='size-[18px]' />
    </Tooltip>

    <WorkspaceUserMenu {taskId} {panel} />

    {#if $appShell.rightCollapsed}
      <Tooltip
        content={t('expand_right')}
        class='shell-panel-toggle-button'
        aria-label={t('expand_right')}
        onclick={() => appShell.setRightCollapsed(false)}
      >
        <PanelRightOpen class='size-[18px]' />
      </Tooltip>
    {/if}
  </div>
</header>
