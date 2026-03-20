<script lang='ts'>
  import { Tooltip } from '@admin-ai/ui'
  import { goto } from '$app/navigation'
  import { translate as t } from '$lib/i18n'
  import AppLogo from '$lib/components/AppLogo.svelte'
  import TaskRailItem from '$lib/components/workspace/tasks/TaskRailItem.svelte'
  import { appShell, buildWorkspacePath, type AdminPanel } from '$lib/stores/app-shell'
  import { CirclePlus, PanelLeftClose } from '@lucide/svelte'

  let { taskId, panel } = $props<{ taskId: string | null, panel: AdminPanel }>()

  async function selectTask(nextTaskId: string) {
    await goto(buildWorkspacePath(nextTaskId, panel))
  }

  async function createTask() {
    const nextTaskId = appShell.createTask()
    await goto(buildWorkspacePath(nextTaskId, panel))
  }

  function renameTask(taskId: string, currentTitle: string) {
    const nextTitle = window.prompt(t('rename_task_prompt'), currentTitle)

    if (nextTitle === null) {
      return
    }

    appShell.renameTask(taskId, nextTitle)
  }

  async function deleteTask(taskIdToDelete: string) {
    const result = appShell.deleteTask(taskIdToDelete)

    if (result.deletedActiveTask) {
      await goto(buildWorkspacePath(null, panel))
    }
  }
</script>

<aside class={`workspace-pane workspace-left-pane relative flex h-full min-h-0 flex-col overflow-hidden ${$appShell.leftCollapsed ? 'px-2 py-2.5' : 'px-2.5 py-2.5'}`}>
  <div class='flex items-center justify-between gap-2'>
    <AppLogo collapsed={$appShell.leftCollapsed} showSubtitle={false} />

    <Tooltip
      content={t('collapse_left')}
      class='shell-panel-toggle-button'
      aria-label={t('collapse_left')}
      onclick={() => appShell.toggleLeftCollapsed()}
    >
      <PanelLeftClose class='size-[18px]' />
    </Tooltip>
  </div>

  <div class={`mt-3 ${$appShell.leftCollapsed ? 'space-y-2' : 'space-y-2.5'}`}>
    <button
      type='button'
      class={`shell-primary-button w-full ${$appShell.leftCollapsed ? 'justify-center px-0' : 'justify-start'}`}
      onclick={createTask}
    >
      <CirclePlus class='size-4 shrink-0' />
      {#if !$appShell.leftCollapsed}
        <span>{t('new_task')}</span>
      {/if}
    </button>

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
          onrename={() => renameTask(task.id, task.title)}
          ondelete={() => deleteTask(task.id)}
        />
      {/each}
    </div>
  </div>
</aside>
