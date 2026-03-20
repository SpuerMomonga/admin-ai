<script lang='ts'>
  import type { TaskRecord, TaskStatus } from '$lib/stores/tasks'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { translate as t, translateTaskStatus } from '$lib/stores/i18n'
  import { Ellipsis, PencilLine, Trash2 } from '@lucide/svelte'

  const {
    task,
    active = false,
    collapsed = false,
    locale = 'zh-CN',
    onselect,
    onrename,
    ondelete,
  } = $props<{
    task: TaskRecord
    active?: boolean
    collapsed?: boolean
    locale?: string
    onselect: () => void
    onrename: () => void
    ondelete: () => void
  }>()
  const statusDotTone: Record<TaskStatus, string> = {
    in_progress: 'bg-amber-500',
    completed: 'bg-emerald-500',
    failed: 'bg-rose-500',
  }

  const dotTone = $derived(statusDotTone[task.status as TaskStatus])

  function formatTime(value: string) {
    return new Intl.DateTimeFormat(locale, {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  }
</script>

<div class='relative'>
  <button
    type='button'
    class={`w-full text-left transition ${collapsed ? 'rounded-[10px] border border-transparent p-2 hover:border-shell-border hover:bg-shell-muted-panel' : 'shell-task-card px-2.5 py-2'} ${active ? 'border-brand/30 bg-brand/10 shadow-[0_10px_20px_rgba(0,78,162,0.1)]' : ''}`}
    title={task.title}
    onclick={onselect}
  >
    {#if collapsed}
      <div class='mx-auto flex size-9 items-center justify-center rounded-[8px] border border-shell-border bg-shell-muted-panel text-[11px] font-semibold text-foreground'>
        {task.title.slice(0, 2)}
      </div>
      <span class={`mx-auto mt-2 block size-2 rounded-full ${dotTone}`}></span>
    {:else}
      <div class='flex items-center gap-2 pr-8'>
        <span class={`size-2 shrink-0 rounded-full ${dotTone}`}></span>
        <span class='truncate text-sm font-medium text-foreground'>{task.title}</span>
      </div>

      <div class='mt-1.5 flex items-center gap-1 pl-4 pr-8 text-[11px] text-muted-foreground'>
        <span class='shrink-0'>{translateTaskStatus(task.status)}</span>
        <span aria-hidden='true' class='shrink-0 text-[12px] leading-none text-muted-foreground/80'>•</span>
        <span class='shrink-0'>{formatTime(task.updatedAt)}</span>
      </div>
    {/if}
  </button>

  {#if !collapsed}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        class='absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-[6px] text-muted-foreground transition hover:bg-shell-muted-panel hover:text-foreground'
        title={t('task_actions')}
        aria-label={t('task_actions')}
        onclick={event => event.stopPropagation()}
      >
        <Ellipsis class='size-4' />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align='end' sideOffset={8} class='min-w-[132px]'>
        <DropdownMenu.Item
          class='px-2.5 py-2 text-sm'
          onclick={(event) => {
            event.stopPropagation()
            onrename()
          }}
        >
          <PencilLine class='size-4' />
          <span>{t('rename_task')}</span>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          variant='destructive'
          class='px-2.5 py-2 text-sm'
          onclick={(event) => {
            event.stopPropagation()
            ondelete()
          }}
        >
          <Trash2 class='size-4' />
          <span>{t('delete_task')}</span>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  {/if}
</div>
