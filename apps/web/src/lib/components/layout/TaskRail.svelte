<script lang='ts'>
  import { goto } from '$app/navigation'
  import AppLogo from '$lib/components/AppLogo.svelte'
  import RenameTaskDialog from '$lib/components/layout/tasks/RenameTaskDialog.svelte'
  import TaskRailItem from '$lib/components/layout/tasks/TaskRailItem.svelte'
  import { Button } from '$lib/components/ui/button'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import TooltipButton from '$lib/components/ui/tooltip-button.svelte'
  import { buildWorkspacePath } from '$lib/stores/admin-tabs'
  import { translate as t } from '$lib/stores/i18n'
  import { navigationStore, toggleLeftCollapsed } from '$lib/stores/navigation'
  import { systemPreferencesStore } from '$lib/stores/preferences'
  import { createTask as createTaskRecord, deleteTask as deleteTaskRecord, renameTask, tasksStore } from '$lib/stores/tasks'
  import { CirclePlus, PanelLeftClose } from '@lucide/svelte'

  const { taskId, adminPath } = $props<{ taskId: string | null, adminPath: string }>()
  let renameDialogOpen = $state(false)
  let renamingTask = $state<{ id: string, title: string } | null>(null)

  async function selectTask(nextTaskId: string) {
    await goto(buildWorkspacePath(nextTaskId, adminPath))
  }

  async function createNewTask() {
    const nextTaskId = createTaskRecord()
    await goto(buildWorkspacePath(nextTaskId, adminPath))
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

    renameTask(renamingTask.id, nextTitle)
  }

  async function handleDeleteTask(taskIdToDelete: string) {
    const result = deleteTaskRecord(taskIdToDelete)

    if (result.deletedActiveTask) {
      await goto(buildWorkspacePath(result.nextActiveTaskId || null, adminPath))
    }
  }

  $effect(() => {
    if (!renameDialogOpen) {
      renamingTask = null
    }
  })
</script>

<aside class={`workspace-pane workspace-left-pane relative flex h-full min-h-0 flex-col overflow-hidden ${$navigationStore.leftCollapsed ? 'px-2 py-2.5' : 'px-2.5 py-2.5'}`}>
  <div class='flex items-center justify-between gap-2'>
    <AppLogo collapsed={$navigationStore.leftCollapsed} showSubtitle={false} />

    <TooltipButton
      content={t('collapse_left')}
      class='shell-panel-toggle-button'
      aria-label={t('collapse_left')}
      onclick={toggleLeftCollapsed}
    >
      <PanelLeftClose class='size-4.5' />
    </TooltipButton>
  </div>

  <div class={`mt-3 ${$navigationStore.leftCollapsed ? 'space-y-2' : 'space-y-2.5'}`}>
    <Button
      variant='default'
      class={`w-full ${$navigationStore.leftCollapsed ? 'justify-center px-0' : 'justify-start'}`}
      onclick={createNewTask}
    >
      <CirclePlus class='size-4 shrink-0' />
      {#if !$navigationStore.leftCollapsed}
        <span>{t('new_task')}</span>
      {/if}
    </Button>

    {#if !$navigationStore.leftCollapsed}
      <div class='flex items-center justify-between px-1'>
        <p class='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>{t('tasks_title')}</p>
        <span class='rounded-full bg-shell-muted-panel px-2 py-1 text-[11px] font-medium text-muted-foreground'>
          {$tasksStore.tasks.length}
        </span>
      </div>
    {/if}
  </div>

  <ScrollArea class='mt-3 min-h-0 flex-1' viewportClass='pr-1' scrollbars='vertical'>
    <div class='space-y-2'>
      {#each $tasksStore.tasks as task (task.id)}
        <TaskRailItem
          {task}
          active={task.id === taskId}
          collapsed={$navigationStore.leftCollapsed}
          locale={$systemPreferencesStore.locale}
          onselect={() => selectTask(task.id)}
          onrename={() => startRenameTask(task.id, task.title)}
          ondelete={() => handleDeleteTask(task.id)}
        />
      {/each}
    </div>
  </ScrollArea>
</aside>

{#if renamingTask}
  <RenameTaskDialog
    bind:open={renameDialogOpen}
    taskTitle={renamingTask.title}
    onsubmit={submitRenameTask}
  />
{/if}
