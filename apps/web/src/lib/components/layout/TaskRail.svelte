<script lang='ts'>
  import type { AdminPanel } from '$lib/stores/app-shell'
  import { goto } from '$app/navigation'
  import AppLogo from '$lib/components/AppLogo.svelte'
  import RenameTaskDialog from '$lib/components/layout/tasks/RenameTaskDialog.svelte'
  import TaskRailItem from '$lib/components/layout/tasks/TaskRailItem.svelte'
  import { Button } from '$lib/components/ui/button'
  import TooltipButton from '$lib/components/ui/tooltip-button.svelte'
  import { translate as t } from '$lib/i18n'
  import { appShell, buildWorkspacePath } from '$lib/stores/app-shell'
  import { CirclePlus, PanelLeftClose } from '@lucide/svelte'

  const { taskId, panel } = $props<{ taskId: string | null, panel: AdminPanel }>()
  let renameDialogOpen = $state(false)
  let renamingTask = $state<{ id: string, title: string } | null>(null)

  async function selectTask(nextTaskId: string) {
    await goto(buildWorkspacePath(nextTaskId, panel))
  }

  async function createTask() {
    const nextTaskId = appShell.createTask()
    await goto(buildWorkspacePath(nextTaskId, panel))
  }

  function startRenameTask(taskId: string, currentTitle: string) {
    renamingTask = {
      id: taskId,
      title: currentTitle,
    }
    renameDialogOpen = true
  }

  function submitRenameTask(nextTitle: string) {
    if (!renamingTask) {
      return
    }

    appShell.renameTask(renamingTask.id, nextTitle)
  }

  async function deleteTask(taskIdToDelete: string) {
    const result = appShell.deleteTask(taskIdToDelete)

    if (result.deletedActiveTask) {
      await goto(buildWorkspacePath(result.nextActiveTaskId || null, panel))
    }
  }

  $effect(() => {
    if (!renameDialogOpen) {
      renamingTask = null
    }
  })
</script>

<aside class={`workspace-pane workspace-left-pane relative flex h-full min-h-0 flex-col overflow-hidden ${$appShell.leftCollapsed ? 'px-2 py-2.5' : 'px-2.5 py-2.5'}`}>
  <div class='flex items-center justify-between gap-2'>
    <AppLogo collapsed={$appShell.leftCollapsed} showSubtitle={false} />

    <TooltipButton
      content={t('collapse_left')}
      class='shell-panel-toggle-button'
      aria-label={t('collapse_left')}
      onclick={() => appShell.toggleLeftCollapsed()}
    >
      <PanelLeftClose class='size-[18px]' />
    </TooltipButton>
  </div>

  <div class={`mt-3 ${$appShell.leftCollapsed ? 'space-y-2' : 'space-y-2.5'}`}>
    <Button
      variant='default'
      class={`w-full ${$appShell.leftCollapsed ? 'justify-center px-0' : 'justify-start'}`}
      onclick={createTask}
    >
      <CirclePlus class='size-4 shrink-0' />
      {#if !$appShell.leftCollapsed}
        <span>{t('new_task')}</span>
      {/if}
    </Button>

    {#if !$appShell.leftCollapsed}
      <div class='flex items-center justify-between px-1'>
        <p class='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>{t('tasks_title')}</p>
        <span class='rounded-full bg-shell-muted-panel px-2 py-1 text-[11px] font-medium text-muted-foreground'>
          {$appShell.tasks.length}
        </span>
      </div>
    {/if}
  </div>

  <div class='mt-3 min-h-0 flex-1 overflow-y-auto pr-1 no-scrollbar'>
    <div class='space-y-2'>
      {#each $appShell.tasks as task (task.id)}
        <TaskRailItem
          {task}
          active={task.id === taskId}
          collapsed={$appShell.leftCollapsed}
          locale={$appShell.locale}
          onselect={() => selectTask(task.id)}
          onrename={() => startRenameTask(task.id, task.title)}
          ondelete={() => deleteTask(task.id)}
        />
      {/each}
    </div>
  </div>
</aside>

{#if renamingTask}
  <RenameTaskDialog
    bind:open={renameDialogOpen}
    taskTitle={renamingTask.title}
    onsubmit={submitRenameTask}
  />
{/if}
