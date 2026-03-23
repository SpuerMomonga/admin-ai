<script lang='ts'>
  import type { TaskStatus } from '$lib/stores/tasks'
  import type { AppLocale, ThemePreference } from '$lib/types/app'
  import { page } from '$app/state'
  import { Badge } from '$lib/components/ui/badge'
  import { Card } from '$lib/components/ui/card'
  import { m } from '$lib/paraglide/messages'
  import { knowledgeBases } from '$lib/stores/conversation'
  import { preferencesStore } from '$lib/stores/preferences'
  import { tasksStore } from '$lib/stores/tasks'

  const staticDefaults = {
    primaryModel: 'GPT-5.4',
    defaultKnowledgeBaseId: 'ops-playbook',
    approvalMode: 'guided',
    responseStyle: 'compact',
    cachePolicy: 'session_and_reload',
  } as const

  const statusToneClasses: Record<TaskStatus, string> = {
    in_progress: 'border-brand/20 bg-brand/10 text-brand',
    completed: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    failed: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  }

  const taskId = $derived(page.url.searchParams.get('taskId'))
  const activeTask = $derived($tasksStore.tasks.find(item => item.id === taskId) ?? null)
  const activeKnowledgeBase = $derived(
    activeTask ? (knowledgeBases.find(base => base.id === activeTask.knowledgeBaseId) ?? null) : null,
  )
  const defaultKnowledgeBase = $derived(
    knowledgeBases.find(base => base.id === staticDefaults.defaultKnowledgeBaseId) ?? null,
  )
  const taskCounts = $derived.by(() => ({
    total: $tasksStore.tasks.length,
    inProgress: $tasksStore.tasks.filter(task => task.status === 'in_progress').length,
    completed: $tasksStore.tasks.filter(task => task.status === 'completed').length,
    failed: $tasksStore.tasks.filter(task => task.status === 'failed').length,
  }))
  const recentTasks = $derived.by(() => [...$tasksStore.tasks]
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
    .slice(0, 4))
  const summaryCards = $derived.by(() => [
    {
      label: m.dashboard_metric_total_tasks(),
      value: String(taskCounts.total),
      description: m.dashboard_metric_total_tasks_copy(),
    },
    {
      label: m.dashboard_metric_in_progress(),
      value: String(taskCounts.inProgress),
      description: m.dashboard_metric_in_progress_copy(),
    },
    {
      label: m.dashboard_metric_active_base(),
      value: defaultKnowledgeBase?.badge ?? 'OPS',
      description: m.dashboard_metric_active_base_copy(),
    },
    {
      label: m.dashboard_metric_primary_model(),
      value: staticDefaults.primaryModel,
      description: m.dashboard_metric_primary_model_copy(),
    },
  ])

  function getTaskStatusLabel(status: TaskStatus) {
    if (status === 'completed') {
      return m.task_status_completed()
    }

    if (status === 'failed') {
      return m.task_status_failed()
    }

    return m.task_status_in_progress()
  }

  function getThemeLabel(themePreference: ThemePreference) {
    if (themePreference === 'light') {
      return m.theme_light()
    }

    if (themePreference === 'dark') {
      return m.theme_dark()
    }

    return m.theme_system()
  }

  function getLocaleLabel(locale: AppLocale) {
    return locale === 'zh-CN' ? m.locale_zh_cn() : m.locale_en()
  }

  function getAdminTabBarLabel(isVisible: boolean) {
    return isVisible ? m.admin_tab_bar_show() : m.admin_tab_bar_hide()
  }

  function getApprovalModeLabel(mode: 'guided' | 'manual') {
    return mode === 'manual' ? m.rules_approval_manual() : m.rules_approval_guided()
  }

  function getResponseStyleLabel(style: 'compact' | 'structured') {
    return style === 'structured' ? m.rules_style_structured() : m.rules_style_compact()
  }

  function getCachePolicyLabel(policy: 'session_and_reload' | 'session_only') {
    return policy === 'session_only' ? m.rules_cache_session_only() : m.rules_cache_session_and_reload()
  }

  function formatTimestamp(value: string) {
    return new Intl.DateTimeFormat($preferencesStore.locale, {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  }
</script>

<section class='grid gap-3'>
  <Card size='sm' class='px-4'>
    <p class='shell-card-label'>{m.workspace_label()}</p>
    <h3 class='shell-card-title'>{m.panel_general()}</h3>
    <p class='shell-card-copy'>{m.dashboard_description()}</p>
  </Card>

  <div class='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
    {#each summaryCards as card}
      <Card size='sm' class='px-4'>
        <p class='shell-card-label'>{card.label}</p>
        <h3 class='shell-card-title'>{card.value}</h3>
        <p class='shell-card-copy'>{card.description}</p>
      </Card>
    {/each}
  </div>

  <div class='grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]'>
    <Card size='sm' class='px-4'>
      <div class='flex items-start justify-between gap-3'>
        <div class='min-w-0'>
          <p class='shell-card-label'>{m.dashboard_active_task_title()}</p>
          <h3 class='truncate text-base font-semibold text-foreground'>
            {activeTask?.title ?? m.workspace_title()}
          </h3>
        </div>

        {#if activeTask}
          <Badge variant='outline' class={statusToneClasses[activeTask.status]}>
            {getTaskStatusLabel(activeTask.status)}
          </Badge>
        {/if}
      </div>

      {#if activeTask}
        <p class='mt-3 text-sm leading-6 text-muted-foreground'>{activeTask.summary}</p>

        <div class='mt-3 grid gap-2 sm:grid-cols-2'>
          <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-3'>
            <p class='shell-card-label'>{m.dashboard_task_mode_label()}</p>
            <p class='mt-1 text-sm font-medium text-foreground'>
              {activeTask.mode === 'conversation' ? m.conversation_mode() : m.operation_mode()}
            </p>
          </div>

          <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-3'>
            <p class='shell-card-label'>{m.knowledge_base_label()}</p>
            <p class='mt-1 text-sm font-medium text-foreground'>{activeKnowledgeBase?.badge ?? activeTask.knowledgeBaseId}</p>
          </div>

          <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-3'>
            <p class='shell-card-label'>{m.general_task_status_label()}</p>
            <p class='mt-1 text-sm font-medium text-foreground'>{getTaskStatusLabel(activeTask.status)}</p>
          </div>

          <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-3'>
            <p class='shell-card-label'>{m.dashboard_last_updated_label()}</p>
            <p class='mt-1 text-sm font-medium text-foreground'>{formatTimestamp(activeTask.updatedAt)}</p>
          </div>
        </div>
      {:else}
        <p class='mt-3 text-sm leading-6 text-muted-foreground'>{m.workspace_empty_description()}</p>
      {/if}
    </Card>

    <Card size='sm' class='px-4'>
      <p class='shell-card-label'>{m.dashboard_operating_posture_title()}</p>
      <h3 class='shell-card-title'>{getApprovalModeLabel(staticDefaults.approvalMode)}</h3>
      <p class='shell-card-copy'>{m.dashboard_operating_posture_description()}</p>

      <div class='mt-3 grid gap-2'>
        <div class='flex items-center justify-between gap-3 rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-2.5 text-sm'>
          <span class='text-muted-foreground'>{m.rules_style_label()}</span>
          <span class='font-medium text-foreground'>{getResponseStyleLabel(staticDefaults.responseStyle)}</span>
        </div>

        <div class='flex items-center justify-between gap-3 rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-2.5 text-sm'>
          <span class='text-muted-foreground'>{m.rules_cache_label()}</span>
          <span class='font-medium text-foreground'>{getCachePolicyLabel(staticDefaults.cachePolicy)}</span>
        </div>

        <div class='flex items-center justify-between gap-3 rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-2.5 text-sm'>
          <span class='text-muted-foreground'>{m.theme_label()}</span>
          <span class='font-medium text-foreground'>{getThemeLabel($preferencesStore.themePreference)}</span>
        </div>

        <div class='flex items-center justify-between gap-3 rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-2.5 text-sm'>
          <span class='text-muted-foreground'>{m.locale_label()}</span>
          <span class='font-medium text-foreground'>{getLocaleLabel($preferencesStore.locale)}</span>
        </div>
      </div>

      <div class='mt-3 rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-3'>
        <p class='shell-card-label'>{m.admin_nav_mode_label()}</p>
        <p class='mt-2 text-sm leading-6 text-muted-foreground'>
          {$preferencesStore.adminNavigationMode === 'sidebar' ? m.admin_nav_sidebar() : m.admin_nav_topbar()}
        </p>
      </div>

      <div class='mt-2 rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-3'>
        <p class='shell-card-label'>{m.admin_tab_bar_label()}</p>
        <p class='mt-2 text-sm leading-6 text-muted-foreground'>{getAdminTabBarLabel($preferencesStore.adminTabBarVisible)}</p>
      </div>
    </Card>
  </div>

  <Card size='sm' class='px-4'>
    <div class='flex items-center justify-between gap-3'>
      <div>
        <p class='shell-card-label'>{m.dashboard_recent_tasks_title()}</p>
        <h3 class='text-base font-semibold text-foreground'>{m.tasks_title()}</h3>
      </div>
      <span class='rounded-full border border-shell-border bg-shell-muted-panel px-2.5 py-1 text-[11px] font-semibold text-muted-foreground'>
        {taskCounts.total}
      </span>
    </div>

    <div class='mt-3 grid gap-2'>
      {#if recentTasks.length > 0}
        {#each recentTasks as task}
          <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-3'>
            <div class='flex items-start justify-between gap-3'>
              <div class='min-w-0'>
                <p class='truncate text-sm font-semibold text-foreground'>{task.title}</p>
                <p class='mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground'>{task.summary}</p>
              </div>

              <span class={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusToneClasses[task.status]}`}>
                {getTaskStatusLabel(task.status)}
              </span>
            </div>

            <div class='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground'>
              <span>{m.dashboard_last_updated_label()}: {formatTimestamp(task.updatedAt)}</span>
              <span>{m.dashboard_task_mode_label()}: {task.mode === 'conversation' ? m.conversation_mode() : m.operation_mode()}</span>
            </div>
          </div>
        {/each}
      {:else}
        <p class='text-sm leading-6 text-muted-foreground'>{m.dashboard_recent_tasks_empty()}</p>
      {/if}
    </div>
  </Card>
</section>
