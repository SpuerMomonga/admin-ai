<script lang='ts'>
  import { goto } from '$app/navigation'
  import AppLogo from '$lib/components/AppLogo.svelte'
  import TooltipButton from '$lib/components/ui/tooltip-button.svelte'
  import { buildWorkspacePath } from '$lib/stores/admin-tabs'
  import { translate as t } from '$lib/stores/i18n'
  import { navigationStore, setLeftCollapsed, setRightCollapsed } from '$lib/stores/navigation'
  import { createTask as createTaskRecord, tasksStore } from '$lib/stores/tasks'
  import { MessageCirclePlus, PanelLeftOpen, PanelRightOpen } from '@lucide/svelte'
  import WorkspaceUserMenu from './WorkspaceUserMenu.svelte'

  const { taskId, adminPath } = $props<{ taskId: string | null, adminPath: string }>()

  const activeTask = $derived($tasksStore.tasks.find(task => task.id === taskId) ?? null)

  async function createNewTask() {
    const nextTaskId = createTaskRecord()
    await goto(buildWorkspacePath(nextTaskId, adminPath))
  }
</script>

<header class='flex items-start justify-between gap-3 px-3 py-2.5'>
  <div class='min-w-0'>
    {#if $navigationStore.leftCollapsed}
      <div class='flex items-center gap-2'>
        <AppLogo collapsed={true} />

        <TooltipButton
          content={t('expand_left')}
          side='right'
          class='shell-panel-toggle-button'
          aria-label={t('expand_left')}
          onclick={() => setLeftCollapsed(false)}
        >
          <PanelLeftOpen class='size-4.5' />
        </TooltipButton>

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
    <TooltipButton
      content={t('new_task')}
      side='left'
      class='shell-panel-toggle-button'
      aria-label={t('new_task')}
      onclick={createNewTask}
    >
      <MessageCirclePlus class='size-4.5' />
    </TooltipButton>

    <WorkspaceUserMenu {taskId} {adminPath} />

    {#if $navigationStore.rightCollapsed}
      <TooltipButton
        content={t('expand_right')}
        side='left'
        class='shell-panel-toggle-button'
        aria-label={t('expand_right')}
        onclick={() => setRightCollapsed(false)}
      >
        <PanelRightOpen class='size-4.5' />
      </TooltipButton>
    {/if}
  </div>
</header>
