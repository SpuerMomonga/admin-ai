<script lang='ts'>
  import { translate as t } from '$lib/i18n'
  import { appShell } from '$lib/stores/app-shell'
</script>

<section class='grid gap-3'>
  <article class='shell-card'>
    <p class='shell-card-label'>{t('rules_title')}</p>
    <h3 class='shell-card-title'>{t('panel_rules')}</h3>
    <p class='shell-card-copy'>{t('rules_description')}</p>
  </article>

  <article class='shell-card'>
    <div class='grid gap-3 lg:grid-cols-2'>
      <label class='shell-field'>
        <span>{t('rules_approval_label')}</span>
        <select class='shell-select' value={$appShell.settings.rules.approvalMode} onchange={(event) => appShell.updateSettingsSection('rules', { approvalMode: event.currentTarget.value as 'manual' | 'guided' })}>
          <option value='guided'>guided</option>
          <option value='manual'>manual</option>
        </select>
      </label>

      <label class='shell-field'>
        <span>{t('rules_style_label')}</span>
        <select class='shell-select' value={$appShell.settings.rules.responseStyle} onchange={(event) => appShell.updateSettingsSection('rules', { responseStyle: event.currentTarget.value as 'compact' | 'structured' })}>
          <option value='compact'>compact</option>
          <option value='structured'>structured</option>
        </select>
      </label>

      <label class='shell-field'>
        <span>{t('rules_cache_label')}</span>
        <select class='shell-select' value={$appShell.settings.rules.cachePolicy} onchange={(event) => appShell.updateSettingsSection('rules', { cachePolicy: event.currentTarget.value as 'session_and_reload' | 'session_only' })}>
          <option value='session_and_reload'>session + reload</option>
          <option value='session_only'>session only</option>
        </select>
      </label>

      <label class='shell-field'>
        <span>{t('rules_execution_label')}</span>
        <select class='shell-select' value={$appShell.settings.rules.executionPolicy} onchange={(event) => appShell.updateSettingsSection('rules', { executionPolicy: event.currentTarget.value as 'safe_first' | 'balanced' })}>
          <option value='safe_first'>safe first</option>
          <option value='balanced'>balanced</option>
        </select>
      </label>
    </div>

    <p class='mt-3 text-sm leading-6 text-muted-foreground'>{t('panel_cache_hint')}</p>
  </article>
</section>
