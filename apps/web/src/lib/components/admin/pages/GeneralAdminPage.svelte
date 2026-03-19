<script lang='ts'>
  import { translate as t } from '$lib/i18n'
  import { appShell, type TaskStatus } from '$lib/stores/app-shell'

  let { taskId } = $props<{ taskId: string }>()

  const task = $derived($appShell.tasks.find(item => item.id === taskId) ?? null)
  const statusOptions = ['in_progress', 'completed', 'failed'] as const satisfies ReadonlyArray<TaskStatus>
</script>

<section class='grid gap-3'>
  <div class='grid gap-3 lg:grid-cols-3'>
    <article class='shell-card'>
      <p class='shell-card-label'>{t('theme_label')}</p>
      <h3 class='shell-card-title'>{t(`theme_${$appShell.themePreference}`)}</h3>
      <p class='shell-card-copy'>{t('general_theme_card')}</p>
    </article>

    <article class='shell-card'>
      <p class='shell-card-label'>{t('locale_label')}</p>
      <h3 class='shell-card-title'>{t($appShell.locale === 'zh-CN' ? 'locale_zh_cn' : 'locale_en')}</h3>
      <p class='shell-card-copy'>{t('general_locale_card')}</p>
    </article>

    <article class='shell-card'>
      <p class='shell-card-label'>{t('rules_cache_label')}</p>
      <h3 class='shell-card-title'>{$appShell.settings.rules.cachePolicy === 'session_and_reload' ? 'session + reload' : 'session only'}</h3>
      <p class='shell-card-copy'>{t('general_cache_card')}</p>
    </article>
  </div>

  <article class='shell-card'>
    <div class='grid gap-3 lg:grid-cols-2'>
      <label class='shell-field'>
        <span>{t('theme_label')}</span>
        <select class='shell-select' value={$appShell.themePreference} onchange={(event) => appShell.setThemePreference(event.currentTarget.value as typeof $appShell.themePreference)}>
          <option value='system'>{t('theme_system')}</option>
          <option value='light'>{t('theme_light')}</option>
          <option value='dark'>{t('theme_dark')}</option>
        </select>
      </label>

      <label class='shell-field'>
        <span>{t('locale_label')}</span>
        <select class='shell-select' value={$appShell.locale} onchange={(event) => appShell.setLocalePreference(event.currentTarget.value as typeof $appShell.locale)}>
          <option value='zh-CN'>{t('locale_zh_cn')}</option>
          <option value='en'>{t('locale_en')}</option>
        </select>
      </label>
    </div>

    {#if task}
      <div class='mt-3 grid gap-3 lg:grid-cols-2'>
        <label class='shell-field'>
          <span>{t('general_task_status_label')}</span>
          <select class='shell-select' value={task.status} onchange={(event) => appShell.setTaskStatus(task.id, event.currentTarget.value as TaskStatus)}>
            {#each statusOptions as statusOption}
              <option value={statusOption}>{t(`task_status_${statusOption}`)}</option>
            {/each}
          </select>
        </label>

        <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-3'>
          <p class='shell-card-label'>{t('task_summary_label')}</p>
          <p class='mt-2 text-sm leading-6 text-foreground'>{task.summary}</p>
        </div>
      </div>
    {/if}
  </article>
</section>
