<script lang='ts'>
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'
  import { translate as t } from '$lib/i18n'
  import type { TaskRecord, TaskStatus } from '$lib/stores/app-shell'
  import { Ellipsis, PencilLine, Trash2 } from '@lucide/svelte'

  let {
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

  let itemElement = $state<HTMLDivElement | null>(null)
  let menuOpen = $state(false)

  const statusTone: Record<TaskStatus, string> = {
    in_progress: 'bg-amber-500',
    completed: 'bg-emerald-500',
    failed: 'bg-rose-500',
  }

  const tone = $derived(statusTone[task.status as TaskStatus])

  function formatTime(value: string) {
    return new Intl.DateTimeFormat(locale, {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  }

  onMount(() => {
    if (!browser) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!menuOpen || !itemElement) {
        return
      }

      const target = event.target

      if (target instanceof Node && !itemElement.contains(target)) {
        menuOpen = false
      }
    }

    window.addEventListener('pointerdown', onPointerDown)

    return () => window.removeEventListener('pointerdown', onPointerDown)
  })
</script>

<div bind:this={itemElement} class='relative'>
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
    <span class={`mx-auto mt-2 block size-2 rounded-full ${tone}`}></span>
  {:else}
    <div class='flex items-center gap-2 pr-8'>
      <span class={`size-2 shrink-0 rounded-full ${tone}`}></span>
      <span class='truncate text-sm font-medium text-foreground'>{task.title}</span>
    </div>

    <div class='mt-1.5 flex items-center justify-between gap-2 pl-4 pr-8 text-[11px] text-muted-foreground'>
      <span class='min-w-0 truncate'>
        {t('tasks_title')}{t(`task_status_${task.status}`)}
      </span>
      <span class='shrink-0'>{formatTime(task.updatedAt)}</span>
    </div>
  {/if}
  </button>

  {#if !collapsed}
    <button
      type='button'
      class='absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-[6px] text-muted-foreground transition hover:bg-shell-muted-panel hover:text-foreground'
      title='Task actions'
      aria-label='Task actions'
      onclick={(event) => {
        event.stopPropagation()
        menuOpen = !menuOpen
      }}
    >
      <Ellipsis class='size-4' />
    </button>
  {/if}

  {#if menuOpen && !collapsed}
    <div class='absolute right-2 top-[calc(100%+4px)] z-20 min-w-[132px] rounded-[8px] border border-shell-border bg-shell-elevated p-1 shadow-[0_12px_30px_rgba(15,23,42,0.12)]'>
      <button
        type='button'
        class='shell-menu-button w-full justify-start px-2.5 py-2 text-sm'
        onclick={(event) => {
          event.stopPropagation()
          menuOpen = false
          onrename()
        }}
      >
        <PencilLine class='size-4' />
        <span>{t('rename_task')}</span>
      </button>
      <button
        type='button'
        class='shell-danger-button w-full justify-start px-2.5 py-2 text-sm'
        onclick={(event) => {
          event.stopPropagation()
          menuOpen = false
          ondelete()
        }}
      >
        <Trash2 class='size-4' />
        <span>{t('delete_task')}</span>
      </button>
    </div>
  {/if}
</div>
