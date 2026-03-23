<script lang='ts'>
  import { goto } from '$app/navigation'
  import AppLogo from '$lib/components/AppLogo.svelte'
  import TooltipButton from '$lib/components/ui/tooltip-button.svelte'
  import { m } from '$lib/paraglide/messages'
  import { appStateStore, setLeftCollapsed, setRightCollapsed } from '$lib/stores/app-state'
  import { resetPendingTaskComposer } from '$lib/stores/conversation'
  import { buildWorkspacePath } from '$lib/stores/tabs'
  import { tasksStore } from '$lib/stores/tasks'
  import { MessageCirclePlus, PanelLeftOpen, PanelRightOpen } from '@lucide/svelte'
  import WorkspaceUserMenu from './WorkspaceUserMenu.svelte'

  const { taskId, adminPath } = $props<{ taskId: string | null, adminPath: string }>()

  const activeTask = $derived($tasksStore.tasks.find(task => task.id === taskId) ?? null)

  async function createNewTask() {
    resetPendingTaskComposer()
    await goto(buildWorkspacePath(null, adminPath))
  }
</script>

<header class='flex items-start justify-between gap-3 px-3 py-2.5'>
  <div class='min-w-0'>
    {#if $appStateStore.leftCollapsed}
      <div class='flex items-center gap-2'>
        <AppLogo collapsed={true} />

        <TooltipButton
          content={m.expand_left()}
          side='right'
          class='shell-panel-toggle-button'
          aria-label={m.expand_left()}
          onclick={() => setLeftCollapsed(false)}
        >
          <PanelLeftOpen class='size-4.5' />
        </TooltipButton>

        <p class='truncate text-sm font-semibold text-foreground'>
          {activeTask?.title ?? m.workspace_title()}
        </p>
      </div>
    {:else}
      <p class='truncate text-sm font-semibold text-foreground'>
        {activeTask?.title ?? m.workspace_title()}
      </p>
    {/if}
  </div>

  <div class='flex shrink-0 items-center gap-2'>
    <TooltipButton
      content={m.new_task()}
      side='left'
      class='shell-panel-toggle-button'
      aria-label={m.new_task()}
      onclick={createNewTask}
    >
      <MessageCirclePlus class='size-4.5' />
    </TooltipButton>

    <WorkspaceUserMenu {taskId} {adminPath} />

    {#if $appStateStore.rightCollapsed}
      <TooltipButton
        content={m.expand_right()}
        side='left'
        class='shell-panel-toggle-button'
        aria-label={m.expand_right()}
        onclick={() => setRightCollapsed(false)}
      >
        <PanelRightOpen class='size-4.5' />
      </TooltipButton>
    {/if}
  </div>
</header>
